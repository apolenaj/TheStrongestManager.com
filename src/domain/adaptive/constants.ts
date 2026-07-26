/**
 * Adaptive programming engine constants (Prompt 23).
 * Suggestions are never auto-applied to the athlete program.
 */

export const ADAPTIVE_ENGINE_VERSION = "adaptive.v1" as const;

export const ADAPTATION_CHANGE_KINDS = [
  "increase_load",
  "keep_load",
  "reduce_load",
  "increase_volume",
  "reduce_volume",
  "deload",
] as const;
export type AdaptationChangeKind = (typeof ADAPTATION_CHANGE_KINDS)[number];

export const ADAPTATION_STATUSES = [
  "pending",
  "accepted",
  "modified",
  "declined",
  "expired",
  "superseded",
] as const;
export type AdaptationStatus = (typeof ADAPTATION_STATUSES)[number];

export const ADAPTATION_CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
export type AdaptationConfidence =
  (typeof ADAPTATION_CONFIDENCE_LEVELS)[number];

export const ADAPTATION_EVENT_TYPES = [
  "proposed",
  "accepted",
  "modified",
  "declined",
  "applied",
  "superseded",
  "expired",
] as const;
export type AdaptationEventType = (typeof ADAPTATION_EVENT_TYPES)[number];

/** Lookback windows for signal gathering. */
export const ADAPTATION_SESSION_LOOKBACK = 14;
export const ADAPTATION_RECOVERY_LOOKBACK_DAYS = 7;
export const ADAPTATION_TECHNIQUE_LOOKBACK = 5;

/** Default load deltas (kg) when applying — athlete can modify before apply. */
export const DEFAULT_LOAD_INCREMENT_KG = 2.5;
export const DEFAULT_LOAD_REDUCTION_KG = 2.5;
export const DEFAULT_DELOAD_LOAD_PCT = 0.1;
export const DEFAULT_VOLUME_SET_DELTA = 1;
