/**
 * API platform foundation (Prompt 90).
 * Internal architecture for a future external API — not a public product surface yet.
 */

export const API_PLATFORM_ENGINE_VERSION = "api_platform.v1" as const;

/** Path-versioned public contract (future). Internal adapters stay unversioned. */
export const API_PUBLIC_VERSIONS = ["v1"] as const;
export type ApiPublicVersion = (typeof API_PUBLIC_VERSIONS)[number];

export const API_CURRENT_PUBLIC_VERSION: ApiPublicVersion = "v1";

/**
 * Auth schemes the platform may accept on versioned JSON APIs.
 * Cookie session remains web-primary; Bearer is for future native / partners.
 */
export const API_AUTH_SCHEMES = [
  "cookie_session",
  "bearer_access_token",
  "webhook_signature",
  "none_public_readonly",
] as const;
export type ApiAuthScheme = (typeof API_AUTH_SCHEMES)[number];

export const API_AUTH_SCHEME_LABELS: Record<ApiAuthScheme, string> = {
  cookie_session: "Auth.js cookie session (web)",
  bearer_access_token: "Bearer access token (future native / partners)",
  webhook_signature: "Provider signature (Stripe, etc.)",
  none_public_readonly: "No auth — never for private athlete data",
};

/** Stable error codes for JSON envelopes. */
export const API_ERROR_CODES = [
  "unauthorized",
  "forbidden",
  "not_found",
  "validation_error",
  "rate_limited",
  "conflict",
  "not_implemented",
  "internal_error",
  "feature_disabled",
] as const;
export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

/**
 * Planned resource families for a future external API.
 * Do not mount these as public routes until product + auth + rate limits are ready.
 */
export const API_RESOURCE_FAMILIES = [
  "athlete_metrics",
  "exercises",
  "technique_analysis",
  "training_programs",
  "performance_insights",
] as const;
export type ApiResourceFamily = (typeof API_RESOURCE_FAMILIES)[number];

export type ApiEndpointSpec = {
  family: ApiResourceFamily;
  /** Future path under /api/v1 — documentation only until shipped. */
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  auth: ApiAuthScheme[];
  /** Key into RATE_LIMITS / future API_RATE_LIMIT_POLICIES. */
  rateLimitPolicy: string;
  /** Owns the response via services — never Prisma from the route. */
  serviceHint: string;
  /** false until explicitly launched. */
  public: boolean;
  notes: string;
};

/**
 * Catalog of potential future external endpoints.
 * All `public: false` — do not expose yet.
 */
export const FUTURE_EXTERNAL_API_CATALOG: readonly ApiEndpointSpec[] = [
  {
    family: "athlete_metrics",
    method: "GET",
    path: "/api/v1/athletes/me/metrics",
    auth: ["cookie_session", "bearer_access_token"],
    rateLimitPolicy: "apiRead",
    serviceHint: "progress / body-metric services (scoped)",
    public: false,
    notes: "Never include recovery/body without explicit scopes; prefer athlete-owned session.",
  },
  {
    family: "athlete_metrics",
    method: "GET",
    path: "/api/v1/athletes/me/scores",
    auth: ["cookie_session", "bearer_access_token"],
    rateLimitPolicy: "apiRead",
    serviceHint: "athlete-score / performance-intelligence services",
    public: false,
    notes: "Summary scores only — no invented rankings.",
  },
  {
    family: "exercises",
    method: "GET",
    path: "/api/v1/exercises",
    auth: ["cookie_session", "bearer_access_token"],
    rateLimitPolicy: "apiRead",
    serviceHint: "content / exercise library services",
    public: false,
    notes: "Catalog read; pagination required before public launch.",
  },
  {
    family: "exercises",
    method: "GET",
    path: "/api/v1/exercises/{slug}",
    auth: ["cookie_session", "bearer_access_token"],
    rateLimitPolicy: "apiRead",
    serviceHint: "content / exercise detail",
    public: false,
    notes: "Public marketing pages may stay SSR; API is for app clients.",
  },
  {
    family: "technique_analysis",
    method: "GET",
    path: "/api/v1/technique/analyses",
    auth: ["cookie_session", "bearer_access_token"],
    rateLimitPolicy: "apiRead",
    serviceHint: "technique analysis-service list",
    public: false,
    notes: "Metadata only by default; media via signed URLs, not raw storage keys.",
  },
  {
    family: "technique_analysis",
    method: "POST",
    path: "/api/v1/technique/analyses",
    auth: ["cookie_session", "bearer_access_token"],
    rateLimitPolicy: "apiTechniqueWrite",
    serviceHint: "technique analysis-service create/upload",
    public: false,
    notes: "Evolve from internal /api/technique/*; do not freeze multipart as the only contract.",
  },
  {
    family: "training_programs",
    method: "GET",
    path: "/api/v1/programs",
    auth: ["cookie_session", "bearer_access_token"],
    rateLimitPolicy: "apiRead",
    serviceHint: "programming services",
    public: false,
    notes: "Athlete-owned programs; coach access requires CoachAthleteAccess.",
  },
  {
    family: "training_programs",
    method: "GET",
    path: "/api/v1/programs/{id}",
    auth: ["cookie_session", "bearer_access_token"],
    rateLimitPolicy: "apiRead",
    serviceHint: "programming services",
    public: false,
    notes: "Ownership check mandatory.",
  },
  {
    family: "performance_insights",
    method: "GET",
    path: "/api/v1/insights",
    auth: ["cookie_session", "bearer_access_token"],
    rateLimitPolicy: "apiRead",
    serviceHint: "insights engine / services",
    public: false,
    notes: "Honest empty states when data is thin — never fabricate insights.",
  },
] as const;

/** Surfaces that stay internal forever (or until redesigned). */
export const INTERNAL_API_SURFACES = [
  {
    path: "/api/auth/[...nextauth]",
    purpose: "Auth.js cookie session",
    publicContract: false,
  },
  {
    path: "/api/billing/webhook",
    purpose: "Stripe (or provider) webhooks",
    publicContract: false,
  },
  {
    path: "/api/technique/*",
    purpose: "Current web technique upload/media/movement adapters",
    publicContract: false,
  },
] as const;

export const API_PLATFORM_HONESTY = [
  "The versioned external API is not public yet — catalog entries are architecture only.",
  "Internal adapters (/api/auth, /api/technique, /api/billing/webhook) are not the partner contract.",
  "All athlete data endpoints require secure authorization; never use none_public_readonly for private metrics.",
  "Routes call services/domain — never raw Prisma ownership bypasses.",
] as const;

export function isApiPublicVersion(value: string): value is ApiPublicVersion {
  return (API_PUBLIC_VERSIONS as readonly string[]).includes(value);
}

export function futurePublicEndpointCount(): number {
  return FUTURE_EXTERNAL_API_CATALOG.filter((e) => e.public).length;
}

export function plannedExternalEndpointCount(): number {
  return FUTURE_EXTERNAL_API_CATALOG.length;
}
