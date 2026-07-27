import { NextResponse } from "next/server";
import { apiError, apiSuccess } from "@/domain/api";
import { RATE_LIMITS, rateLimit } from "@/lib/rate-limit";
import { clientKeyFromRequest } from "@/lib/request-client-key";
import { getPublicProgramBySlug } from "@/services/program-catalog";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const limited = rateLimit(
    clientKeyFromRequest(request, "programs-detail"),
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
    const { slug } = await context.params;
    const result = await getPublicProgramBySlug(slug);

    if (!result.ok) {
      const status = result.error === "not_found" ? 404 : 400;
      const code =
        result.error === "not_found" ? "not_found" : "validation_error";
      return NextResponse.json(apiError(code, result.message), { status });
    }

    return NextResponse.json(apiSuccess({ program: result.program }));
  } catch {
    return NextResponse.json(
      apiError("internal_error", "Unable to load program."),
      { status: 500 },
    );
  }
}
