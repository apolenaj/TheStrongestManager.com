/**
 * API route helpers (Prompt 90) — JSON auth + rate limit for future versioned routes.
 * Not a public partner SDK. Prefer services over Prisma in route handlers.
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  apiError,
  apiSuccess,
  type ApiErrorCode,
} from "@/domain/api";
import { featureFlags } from "@/config/feature-flags";
import {
  API_RATE_LIMITS,
  rateLimit,
  type RateLimitResult,
} from "@/lib/rate-limit";
import { clientKeyFromRequest } from "@/lib/request-client-key";
import type { ApiRateLimitPolicyKey } from "@/domain/api";

export type ApiSessionUser = {
  id: string;
  email?: string | null;
};

/**
 * Cookie-session auth for JSON APIs (401, never redirect).
 * Bearer tokens are not implemented — return unauthorized if required later.
 */
export async function requireApiSession(): Promise<
  | { ok: true; user: ApiSessionUser }
  | { ok: false; response: NextResponse }
> {
  if (!featureFlags.apiPlatform) {
    return {
      ok: false,
      response: jsonApiError(503, "feature_disabled", "API platform is not enabled."),
    };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return {
      ok: false,
      response: jsonApiError(401, "unauthorized", "Unauthorized."),
    };
  }

  return {
    ok: true,
    user: {
      id: session.user.id,
      email: session.user.email,
    },
  };
}

export function jsonApiSuccess<T>(
  data: T,
  init?: { status?: number; meta?: Record<string, unknown>; headers?: HeadersInit },
): NextResponse {
  return NextResponse.json(apiSuccess(data, init?.meta), {
    status: init?.status ?? 200,
    headers: init?.headers,
  });
}

export function jsonApiError(
  status: number,
  code: ApiErrorCode,
  message: string,
  details?: unknown,
): NextResponse {
  return NextResponse.json(apiError(code, message, details), { status });
}

export function applyApiRateLimit(input: {
  request: Request;
  userId: string;
  policy: ApiRateLimitPolicyKey;
  bucketSuffix: string;
}): RateLimitResult & { response?: NextResponse } {
  const options = API_RATE_LIMITS[input.policy];
  const key = clientKeyFromRequest(
    input.request,
    `api-${input.bucketSuffix}`,
    input.userId,
  );
  const result = rateLimit(key, options);
  if (!result.ok) {
    return {
      ...result,
      response: NextResponse.json(
        apiError(
          "rate_limited",
          `Rate limit reached. Try again in ${result.retryAfterSeconds}s.`,
        ),
        {
          status: 429,
          headers: { "Retry-After": String(result.retryAfterSeconds) },
        },
      ),
    };
  }
  return result;
}
