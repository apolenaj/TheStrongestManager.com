/**
 * Wearable Integration Abstraction (Prompt 185).
 * Apple Health · Google Health Connect · Garmin · Whoop · Oura.
 * Adapter interfaces + flags only — no fake live integrations.
 */

export const WEARABLE_INTEGRATION_ENGINE_VERSION =
  "wearable_integration.v1" as const;

export const WEARABLE_INTEGRATION_HONESTY = [
  "Wearable providers are adapter interfaces only in this build — no fake OAuth, tokens, or invented device samples.",
  "Stub adapters stay not_configured / unavailable and always return empty samples until a real client is registered.",
  "Per-provider feature flags default off for live sync; the architecture registry flag documents the extension points.",
  "Device signals are never medical diagnoses; sleep/HRV/recovery scores from wearables remain coaching context when connected later.",
] as const;

export const WEARABLE_PROVIDER_IDS = [
  "apple_health",
  "google_health_connect",
  "garmin",
  "whoop",
  "oura",
] as const;

export type WearableProviderId = (typeof WEARABLE_PROVIDER_IDS)[number];

export const WEARABLE_PROVIDER_LABELS: Record<WearableProviderId, string> = {
  apple_health: "Apple Health",
  google_health_connect: "Google Health Connect",
  garmin: "Garmin",
  whoop: "Whoop",
  oura: "Oura",
};

/** Coarse platform hints for future native bridges — not a live capability claim. */
export const WEARABLE_PROVIDER_PLATFORMS: Record<
  WearableProviderId,
  readonly string[]
> = {
  apple_health: ["ios", "watchos"],
  google_health_connect: ["android"],
  garmin: ["ios", "android", "web_api"],
  whoop: ["ios", "android", "web_api"],
  oura: ["ios", "android", "web_api"],
};

export const WEARABLE_DATA_KINDS = [
  "sleep",
  "hrv",
  "resting_heart_rate",
  "recovery_score",
  "steps",
  "strain",
  "readiness",
] as const;

export type WearableDataKind = (typeof WEARABLE_DATA_KINDS)[number];

export const WEARABLE_DATA_KIND_LABELS: Record<WearableDataKind, string> = {
  sleep: "Sleep",
  hrv: "HRV",
  resting_heart_rate: "Resting heart rate",
  recovery_score: "Recovery score",
  steps: "Steps",
  strain: "Strain / load",
  readiness: "Readiness",
};

/**
 * Planned data kinds per vendor (documentation for future adapters).
 * Stubs declare these but still return empty until connected.
 */
export const WEARABLE_PROVIDER_PLANNED_KINDS: Record<
  WearableProviderId,
  readonly WearableDataKind[]
> = {
  apple_health: [
    "sleep",
    "hrv",
    "resting_heart_rate",
    "steps",
    "readiness",
  ],
  google_health_connect: [
    "sleep",
    "hrv",
    "resting_heart_rate",
    "steps",
    "readiness",
  ],
  garmin: ["sleep", "hrv", "resting_heart_rate", "steps", "strain", "readiness"],
  whoop: ["sleep", "hrv", "recovery_score", "strain", "readiness"],
  oura: ["sleep", "hrv", "readiness", "resting_heart_rate", "steps"],
};

export type WearableConnectionStatus =
  | "unavailable"
  | "not_configured"
  | "connected";

/** Env keys documented for future live wiring — never invent values. */
export const WEARABLE_FUTURE_ENV_KEYS: Record<
  WearableProviderId,
  readonly string[]
> = {
  apple_health: ["APPLE_HEALTH_BRIDGE_ENABLED"],
  google_health_connect: ["GOOGLE_HEALTH_CONNECT_BRIDGE_ENABLED"],
  garmin: ["GARMIN_CLIENT_ID", "GARMIN_CLIENT_SECRET"],
  whoop: ["WHOOP_CLIENT_ID", "WHOOP_CLIENT_SECRET"],
  oura: ["OURA_CLIENT_ID", "OURA_CLIENT_SECRET"],
};
