import { isVerifiedExpertContributor } from "@/domain/expert-contributor";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { RATE_LIMITS, rateLimit } from "@/lib/rate-limit";
import { clientKeyFromRequest } from "@/lib/request-client-key";
import { verifyMediaAccessToken } from "@/services/technique/media-signing";
import { readTechniqueVideo } from "@/services/technique/storage";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ analysisId: string }>;
};

function safeContentDispositionFilename(name: string): string {
  const cleaned = name
    .replace(/[^\w.\- ()[\]]+/g, "_")
    .replace(/["\\\r\n]/g, "")
    .slice(0, 120);
  return cleaned || "technique-video";
}

export async function GET(request: Request, context: RouteContext) {
  const { analysisId } = await context.params;
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing access token." }, { status: 401 });
  }

  const payload = verifyMediaAccessToken(token);
  if (!payload || payload.analysisId !== analysisId) {
    return NextResponse.json({ error: "Invalid or expired token." }, { status: 401 });
  }

  const session = await auth();
  if (!session?.user?.id || session.user.id !== payload.userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const limited = rateLimit(
    clientKeyFromRequest(request, "technique-media", session.user.id),
    RATE_LIMITS.techniqueMedia,
  );
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Media rate limit reached." },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSeconds) },
      },
    );
  }

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  let analysis = profile
    ? await prisma.techniqueAnalysis.findFirst({
        where: {
          id: analysisId,
          athleteProfileId: profile.id,
          deletedAt: null,
        },
        select: {
          storageKey: true,
          mimeType: true,
          originalFileName: true,
        },
      })
    : null;

  // Optional expert review (Prompt 95): verified experts may access media only when
  // the athlete consented to expert review for this analysis.
  if (!analysis?.storageKey) {
    const expert = await prisma.expertContributorProfile.findUnique({
      where: { userId: session.user.id },
      select: { verificationStatus: true },
    });
    if (
      expert &&
      isVerifiedExpertContributor(expert.verificationStatus)
    ) {
      analysis = await prisma.techniqueAnalysis.findFirst({
        where: {
          id: analysisId,
          deletedAt: null,
          expertReviewConsentAt: { not: null },
          expertReviews: {
            some: {
              status: {
                in: [
                  "pending_review",
                  "confirmed",
                  "corrected",
                  "commented",
                ],
              },
            },
          },
        },
        select: {
          storageKey: true,
          mimeType: true,
          originalFileName: true,
        },
      });
    }
  }

  if (!analysis?.storageKey) {
    return NextResponse.json({ error: "Media not found." }, { status: 404 });
  }

  try {
    const { buffer } = await readTechniqueVideo(analysis.storageKey);
    const filename = safeContentDispositionFilename(
      analysis.originalFileName ?? "technique-video",
    );
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": analysis.mimeType ?? "application/octet-stream",
        "Content-Length": String(buffer.byteLength),
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
      },
    });
  } catch {
    return NextResponse.json({ error: "Media unavailable." }, { status: 404 });
  }
}
