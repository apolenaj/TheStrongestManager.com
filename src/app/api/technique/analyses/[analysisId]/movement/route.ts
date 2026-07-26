import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  persistMovementReport,
  validatePoseFramesPayload,
} from "@/services/movement/persist-report";
import { RATE_LIMITS, rateLimit } from "@/lib/rate-limit";
import { clientKeyFromRequest } from "@/lib/request-client-key";
import { obs, withObservedApi } from "@/services/observability";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ analysisId: string }>;
};

async function postHandler(request: Request, context?: unknown) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const limited = rateLimit(
    clientKeyFromRequest(request, "technique-movement", session.user.id),
    RATE_LIMITS.techniqueMovement,
  );
  if (!limited.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: `Analysis rate limit reached. Try again in ${limited.retryAfterSeconds}s.`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSeconds) },
      },
    );
  }

  const { analysisId } = await (context as RouteContext).params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Expected JSON body." },
      { status: 400 },
    );
  }

  const payload = body as {
    frames?: unknown;
    poseProvider?: string;
    useFixture?: boolean;
  };

  const useFixture = Boolean(payload.useFixture);
  const frames = useFixture
    ? []
    : validatePoseFramesPayload(payload.frames);

  if (!useFixture && !frames) {
    obs.warn({
      category: "technique_failures",
      message: "technique_movement_invalid_frames",
      props: { analysisId, status: 400 },
    });
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid or empty pose frames payload.",
      },
      { status: 400 },
    );
  }

  const result = await persistMovementReport({
    userId: session.user.id,
    analysisId,
    frames: frames ?? [],
    poseProvider: String(payload.poseProvider ?? "client_landmarks"),
    fixture: useFixture,
  });

  if (!result.ok) {
    obs.warn({
      category: "technique_failures",
      message: "technique_pipeline_failed",
      props: { analysisId, status: 400 },
    });
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    report: result.report,
    overallTechniqueScore: result.report.overallTechniqueScore,
  });
}

export const POST = withObservedApi(postHandler);
