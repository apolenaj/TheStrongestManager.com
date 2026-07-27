import { NextResponse } from "next/server";
import { apiError, apiSuccess } from "@/domain/api";
import { RATE_LIMITS, rateLimit } from "@/lib/rate-limit";
import { clientKeyFromRequest } from "@/lib/request-client-key";
import { listPublicProgramCatalog } from "@/services/program-catalog";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const limited = rateLimit(
    clientKeyFromRequest(request, "programs-catalog"),
    RATE_LIMITS.apiRead,
  );
  if (!limited.ok) {
    return NextResponse.json(
      apiError(
        "rate_limited",
        `Rate limit reached. Try again in ${limited.retryAfterSeconds}s.`,
      ),
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSeconds) },
      },
    );
  }

  try {
    const url = new URL(request.url);
    const result = await listPublicProgramCatalog({
      goal: url.searchParams.get("goal"),
      experience: url.searchParams.get("experience"),
      schedule: url.searchParams.get("schedule"),
    });

    if (!result.ok) {
      return NextResponse.json(
        apiError("validation_error", result.message),
        { status: 400 },
      );
    }

    return NextResponse.json(
      apiSuccess(
        { programs: result.programs },
        { count: result.programs.length },
      ),
    );
  } catch {
    return NextResponse.json(
      apiError("internal_error", "Unable to load program catalog."),
      { status: 500 },
    );
  }
}
