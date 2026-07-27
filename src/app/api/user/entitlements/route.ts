import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { apiError, apiSuccess } from "@/domain/api";
import { RATE_LIMITS, rateLimit } from "@/lib/rate-limit";
import { clientKeyFromRequest } from "@/lib/request-client-key";
import { listUserProgramEntitlements } from "@/services/program-catalog";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await auth();
  const userId = session?.user?.id ?? null;

  const limited = rateLimit(
    clientKeyFromRequest(request, "user-entitlements", userId ?? "anon"),
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
    const result = await listUserProgramEntitlements(userId);
    if (!result.ok) {
      return NextResponse.json(apiError("unauthorized", result.message), {
        status: 401,
      });
    }

    return NextResponse.json(
      apiSuccess(
        { entitlements: result.entitlements },
        { count: result.entitlements.length },
      ),
      {
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  } catch {
    return NextResponse.json(
      apiError("internal_error", "Unable to load entitlements."),
      { status: 500 },
    );
  }
}
