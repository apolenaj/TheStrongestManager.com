import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { RATE_LIMITS, rateLimit } from "@/lib/rate-limit";
import { exportUserData } from "@/services/privacy/export-service";

export const runtime = "nodejs";

/**
 * Authenticated data export download.
 * Ownership: session user only. Excludes raw videos and storage keys.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const limited = rateLimit(
    `export:user:${session.user.id}`,
    RATE_LIMITS.dataExport,
  );
  if (!limited.ok) {
    return NextResponse.json(
      {
        error: `Too many export requests. Retry in ${limited.retryAfterSeconds}s.`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSeconds) },
      },
    );
  }

  const result = await exportUserData(session.user.id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return new NextResponse(result.json, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${result.filename.replace(/"/g, "")}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
