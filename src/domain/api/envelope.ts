/**
 * JSON API envelope helpers — for future /api/v1 and internal JSON routes.
 * Do not mount public partner APIs until product launch.
 */

import type { ApiErrorCode } from "@/domain/api/constants";

export type ApiSuccessEnvelope<T> = {
  ok: true;
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiErrorEnvelope = {
  ok: false;
  error: {
    code: ApiErrorCode;
    message: string;
    details?: unknown;
  };
};

export type ApiEnvelope<T> = ApiSuccessEnvelope<T> | ApiErrorEnvelope;

export function apiSuccess<T>(
  data: T,
  meta?: Record<string, unknown>,
): ApiSuccessEnvelope<T> {
  return meta ? { ok: true, data, meta } : { ok: true, data };
}

export function apiError(
  code: ApiErrorCode,
  message: string,
  details?: unknown,
): ApiErrorEnvelope {
  return {
    ok: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  };
}

/** Map common HTTP statuses to ApiErrorCode. */
export function apiErrorCodeForStatus(status: number): ApiErrorCode {
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 409) return "conflict";
  if (status === 422 || status === 400) return "validation_error";
  if (status === 429) return "rate_limited";
  if (status === 501) return "not_implemented";
  if (status === 503) return "feature_disabled";
  return "internal_error";
}
