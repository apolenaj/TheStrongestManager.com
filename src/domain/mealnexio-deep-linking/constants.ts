/**
 * Mealnexio Deep Linking (Prompt 187).
 * Cross-product UX: TSM → Mealnexio nutrition review → optional summary return.
 * SSO reserved for future shared identity — never fake a live handoff.
 */

export const MEALNEXIO_DEEP_LINKING_ENGINE_VERSION =
  "mealnexio_deep_linking.v1" as const;

export const MEALNEXIO_DEEP_LINKING_HONESTY = [
  "Deep links open Mealnexio in the browser with documented context params — they do not invent a connected sync or SSO session.",
  "Nutrition summaries appear only when Mealnexio returns a real structured payload through the return protocol; empty/null otherwise.",
  "Cross-product SSO is architecture-ready (OIDC-style) but status stays not_configured until shared identity infrastructure exists.",
  "“Nutrition may be limiting recovery” is a coaching prompt to review nutrition — not a medical diagnosis or calorie prescription.",
] as const;

/** Public Mealnexio origin (outbound). */
export const MEALNEXIO_ORIGIN = "https://mealnexio.com" as const;

/**
 * Documented Mealnexio path for nutrition review.
 * Until Mealnexio publishes a stable deep path, we land on the site root with query context.
 */
export const MEALNEXIO_NUTRITION_REVIEW_PATH = "/" as const;

/** TSM return surface when Mealnexio hands back a summary (future handshake). */
export const TSM_MEALNEXIO_RETURN_PATH =
  "/app/nutrition/mealnexio-return" as const;

export const MEALNEXIO_DEEP_LINK_INTENTS = [
  "nutrition_review",
  "nutrition_summary_handoff",
] as const;

export type MealnexioDeepLinkIntent =
  (typeof MEALNEXIO_DEEP_LINK_INTENTS)[number];

export const MEALNEXIO_DEEP_LINK_INTENT_LABELS: Record<
  MealnexioDeepLinkIntent,
  string
> = {
  nutrition_review: "Nutrition review",
  nutrition_summary_handoff: "Nutrition summary handoff",
};

export const MEALNEXIO_SSO_STATUSES = [
  "not_configured",
  "unavailable",
  "available",
] as const;

export type MealnexioSsoStatus = (typeof MEALNEXIO_SSO_STATUSES)[number];

export const MEALNEXIO_SSO_STATUS_LABELS: Record<MealnexioSsoStatus, string> = {
  not_configured: "SSO not configured",
  unavailable: "SSO unavailable",
  available: "SSO available",
};

/** Default until shared IdP / OIDC bridge ships. */
export const MEALNEXIO_SSO_DEFAULT_STATUS: MealnexioSsoStatus =
  "not_configured";

export const RECOVERY_NUTRITION_PROMPT =
  "Nutrition may be limiting recovery." as const;

export const RECOVERY_NUTRITION_CTA_LABEL =
  "Open Mealnexio nutrition review" as const;

export const MEALNEXIO_RETURN_PROTOCOL_STATUSES = [
  "not_live",
  "ready",
] as const;

export type MealnexioReturnProtocolStatus =
  (typeof MEALNEXIO_RETURN_PROTOCOL_STATUSES)[number];

/** Query / context keys for outbound deep links (documented contract). */
export const MEALNEXIO_DEEP_LINK_QUERY = {
  source: "tsm_source",
  intent: "tsm_intent",
  prompt: "tsm_prompt",
  returnPath: "tsm_return",
  sso: "tsm_sso",
  ref: "tsm_ref",
} as const;

export const TSM_DEEP_LINK_SOURCE = "thestrongestmanager" as const;

/** Future server env keys — documented only; unused until live. */
export const MEALNEXIO_DEEP_LINK_FUTURE_ENV_KEYS = [
  "MEALNEXIO_SSO_ISSUER",
  "MEALNEXIO_SSO_CLIENT_ID",
  "MEALNEXIO_RETURN_HMAC_SECRET",
  "MEALNEXIO_DEEP_LINK_BASE",
] as const;
