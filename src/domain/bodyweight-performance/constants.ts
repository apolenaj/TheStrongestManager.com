/**
 * Bodyweight / Performance Relationship (Prompt 121).
 * Trends across bodyweight, estimated strength, and relative strength.
 */

export const BODYWEIGHT_PERFORMANCE_ENGINE_VERSION =
  "bodyweight_performance.v1" as const;

/** Relative change within this band counts as “stable”. */
export const BODYWEIGHT_PERFORMANCE_STABLE_PCT = 1.5;

/** Absolute kg band for estimated strength “stable” when % is noisy at low loads. */
export const BODYWEIGHT_PERFORMANCE_STABLE_STRENGTH_KG = 2.5;

export const BODYWEIGHT_PERFORMANCE_HONESTY = [
  "Bodyweight, estimated strength, and relative strength are separate signals — weight gain does not always improve strength.",
  "Estimated 1RM is never a verified PR. Relative strength here is a simple e1RM ÷ bodyweight ratio, not Wilks/DOTS.",
  "Trends need enough logged bodyweight points and multi-rep sets. Missing data stays missing.",
  "Weight change and strength change can move independently (e.g. BW down, strength flat → relative strength up).",
] as const;

export const BODYWEIGHT_PERFORMANCE_TREND_LABELS = {
  up: "Improved",
  down: "Decreased",
  stable: "Stable",
  unknown: "Unknown",
} as const;
