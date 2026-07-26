/**
 * Deload Intelligence (Prompt 124).
 * Multi-signal “Consider deload” recommendations — user decides; never auto-applied.
 */

export const DELOAD_INTELLIGENCE_ENGINE_VERSION =
  "deload_intelligence.v1" as const;

export const DELOAD_INTELLIGENCE_HONESTY = [
  "Recommendation is Consider deload — not an automatic program change. You decide.",
  "One bad workout is never enough. Multiple signals over a window must align.",
  "This is a coaching pattern, not a medical diagnosis or overtraining proof.",
  "Sport calendars and peaking plans may override a generic deload cue.",
] as const;

export const DELOAD_RECOMMENDATION_LABEL = "Consider deload" as const;
export const DELOAD_HOLD_LABEL = "No deload cue right now" as const;
export const DELOAD_INSUFFICIENT_LABEL = "Not enough data for a deload cue" as const;

/** Minimum completed sessions in the analysis window. */
export const DELOAD_MIN_SESSIONS = 4;

/** Independent stress signals that must fire together. */
export const DELOAD_MIN_SIGNALS_FIRED = 2;

/** Lookback window for session / load / recovery aggregation (days). */
export const DELOAD_LOOKBACK_DAYS = 14;

/** Suppress recommendations within this many days of an accepted deload. */
export const DELOAD_RECENT_SUPPRESS_DAYS = 7;

/** Readiness mean below this counts as a recovery stress signal. */
export const DELOAD_READINESS_LOW = 45;

/** Readiness drop (prior − recent) that counts as declining recovery. */
export const DELOAD_READINESS_DROP = 8;

/** Session RPE mean at or above this (when no target) counts as high RPE. */
export const DELOAD_RPE_HIGH = 8.5;

/** Missed-rep rate (fraction of sets) that counts as sustained misses. */
export const DELOAD_MISSED_REP_RATE = 0.15;

export const DELOAD_SIGNAL_KEYS = [
  "performance_trend",
  "rpe",
  "recovery",
  "missed_reps",
  "training_load",
] as const;

export type DeloadSignalKey = (typeof DELOAD_SIGNAL_KEYS)[number];

export const DELOAD_SIGNAL_LABELS: Record<DeloadSignalKey, string> = {
  performance_trend: "Performance trend",
  rpe: "RPE",
  recovery: "Recovery",
  missed_reps: "Missed reps",
  training_load: "Training load",
};
