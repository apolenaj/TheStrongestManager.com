/**
 * Rate-limit policy names for versioned APIs (Prompt 90).
 * Numeric presets live in src/lib/rate-limit.ts (API_RATE_LIMITS).
 */

export const API_RATE_LIMIT_POLICY_KEYS = [
  "apiRead",
  "apiWrite",
  "apiTechniqueWrite",
  "apiAuthSensitive",
] as const;
export type ApiRateLimitPolicyKey =
  (typeof API_RATE_LIMIT_POLICY_KEYS)[number];

export const API_RATE_LIMIT_POLICY_DESCRIPTIONS: Record<
  ApiRateLimitPolicyKey,
  string
> = {
  apiRead: "Authenticated GET list/detail — generous but bounded per user.",
  apiWrite: "Authenticated mutating JSON — tighter than reads.",
  apiTechniqueWrite: "Upload / heavy technique writes — align with techniqueUpload.",
  apiAuthSensitive: "Token exchange / sensitive auth — align with login/forgot.",
};

export function isApiRateLimitPolicyKey(
  value: string,
): value is ApiRateLimitPolicyKey {
  return (API_RATE_LIMIT_POLICY_KEYS as readonly string[]).includes(value);
}
