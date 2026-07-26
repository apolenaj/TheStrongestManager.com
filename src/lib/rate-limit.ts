/**
 * In-memory sliding-window rate limiter (Prompt 43).
 * Suitable for single-node / local. Production should swap to Redis/Upstash
 * via the same interface — do not invent distributed limits here.
 */

export type RateLimitOptions = {
  /** Max attempts in the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
};

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; remaining: number; retryAfterSeconds: number };

type Bucket = {
  timestamps: number[];
};

const buckets = new Map<string, Bucket>();

/** Test helper — clears all buckets. */
export function resetRateLimitBucketsForTests(): void {
  buckets.clear();
}

/**
 * Record an attempt for `key`. Returns ok:false when over limit.
 * Does not throw.
 */
export function rateLimit(
  key: string,
  options: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - options.windowMs;
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { timestamps: [] };
    buckets.set(key, bucket);
  }

  bucket.timestamps = bucket.timestamps.filter((t) => t > windowStart);

  if (bucket.timestamps.length >= options.limit) {
    const oldest = bucket.timestamps[0] ?? now;
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((oldest + options.windowMs - now) / 1000),
    );
    return { ok: false, remaining: 0, retryAfterSeconds };
  }

  bucket.timestamps.push(now);
  return {
    ok: true,
    remaining: Math.max(0, options.limit - bucket.timestamps.length),
  };
}

/** Presets for auth and technique surfaces. */
export const RATE_LIMITS = {
  signup: { limit: 5, windowMs: 60 * 60 * 1000 },
  login: { limit: 20, windowMs: 15 * 60 * 1000 },
  forgotPassword: { limit: 5, windowMs: 60 * 60 * 1000 },
  resetPassword: { limit: 10, windowMs: 60 * 60 * 1000 },
  techniqueUpload: { limit: 15, windowMs: 60 * 60 * 1000 },
  techniqueMovement: { limit: 40, windowMs: 60 * 60 * 1000 },
  techniqueMedia: { limit: 120, windowMs: 60 * 1000 },
  /** Guest free technique-check claim tickets (Prompt 169). */
  techniqueCheckClaim: { limit: 5, windowMs: 60 * 60 * 1000 },
  /** Guest free program-audit claim tickets (Prompt 170). */
  programAuditClaim: { limit: 8, windowMs: 60 * 60 * 1000 },
  /** Guest free athlete-assessment claim tickets (Prompt 171). */
  athleteAssessmentClaim: { limit: 10, windowMs: 60 * 60 * 1000 },
  dataExport: { limit: 5, windowMs: 60 * 60 * 1000 },
  billingWebhook: { limit: 120, windowMs: 60 * 1000 },
  /**
   * Future versioned JSON API policies (Prompt 90).
   * Not applied to public partner traffic until /api/v1 launches.
   */
  apiRead: { limit: 120, windowMs: 60 * 1000 },
  apiWrite: { limit: 60, windowMs: 60 * 1000 },
  apiTechniqueWrite: { limit: 15, windowMs: 60 * 60 * 1000 },
  apiAuthSensitive: { limit: 20, windowMs: 15 * 60 * 1000 },
} as const;

/** Alias used by API platform helpers — same object as RATE_LIMITS API keys. */
export const API_RATE_LIMITS = {
  apiRead: RATE_LIMITS.apiRead,
  apiWrite: RATE_LIMITS.apiWrite,
  apiTechniqueWrite: RATE_LIMITS.apiTechniqueWrite,
  apiAuthSensitive: RATE_LIMITS.apiAuthSensitive,
} as const;
