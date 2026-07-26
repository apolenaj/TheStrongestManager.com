/**
 * Weightlifting Mode (Prompt 107).
 * Olympic lifts + competition total — technique analysis deferred until models exist.
 */

export const WEIGHTLIFTING_MODE_ENGINE_VERSION = "weightlifting_mode.v1" as const;

export const WEIGHTLIFTING_LIFT_IDS = [
  "snatch",
  "clean",
  "jerk",
  "clean_and_jerk",
] as const;
export type WeightliftingLiftId = (typeof WEIGHTLIFTING_LIFT_IDS)[number];

export const WEIGHTLIFTING_LIFT_LABELS: Record<WeightliftingLiftId, string> = {
  snatch: "Snatch",
  clean: "Clean",
  jerk: "Jerk",
  clean_and_jerk: "Clean & Jerk",
};

/** ProgressMetric key: wl_<liftId>_weight */
export function weightliftingPrMetricKey(liftId: WeightliftingLiftId): string {
  return `wl_${liftId}_weight`;
}

export function parseWeightliftingPrMetricKey(
  key: string,
): WeightliftingLiftId | null {
  for (const id of WEIGHTLIFTING_LIFT_IDS) {
    if (key === weightliftingPrMetricKey(id)) return id;
  }
  return null;
}

/** What the mode tracks (technique analysis is deferred). */
export const WEIGHTLIFTING_TRACKING_AREAS = [
  "technique",
  "positions",
  "attempts",
  "competition_total",
] as const;
export type WeightliftingTrackingArea =
  (typeof WEIGHTLIFTING_TRACKING_AREAS)[number];

export const WEIGHTLIFTING_TRACKING_LABELS: Record<
  WeightliftingTrackingArea,
  string
> = {
  technique: "Technique",
  positions: "Positions",
  attempts: "Attempts",
  competition_total: "Competition total",
};

export const WEIGHTLIFTING_DASHBOARD_PRIORITIES = [
  "snatch",
  "clean",
  "jerk",
  "clean_and_jerk",
  "competition_total",
  "attempts",
  "positions",
  "technique",
] as const;
export type WeightliftingDashboardPriority =
  (typeof WEIGHTLIFTING_DASHBOARD_PRIORITIES)[number];

export const WEIGHTLIFTING_PRIORITY_LABELS: Record<
  WeightliftingDashboardPriority,
  string
> = {
  snatch: "Snatch",
  clean: "Clean",
  jerk: "Jerk",
  clean_and_jerk: "Clean & Jerk",
  competition_total: "Competition total",
  attempts: "Attempts",
  positions: "Positions",
  technique: "Technique",
};

/**
 * Classic position checklist — educational labels only.
 * Not scored video analysis.
 */
export const WEIGHTLIFTING_POSITION_CUES = [
  { id: "start", label: "Start position", lifts: ["snatch", "clean"] as const },
  { id: "first_pull", label: "First pull", lifts: ["snatch", "clean"] as const },
  {
    id: "second_pull",
    label: "Second pull / extension",
    lifts: ["snatch", "clean"] as const,
  },
  {
    id: "turnover_catch",
    label: "Turnover / catch",
    lifts: ["snatch", "clean"] as const,
  },
  { id: "jerk_dip", label: "Jerk dip", lifts: ["jerk"] as const },
  { id: "jerk_drive", label: "Jerk drive", lifts: ["jerk"] as const },
  {
    id: "jerk_lockout",
    label: "Jerk lockout",
    lifts: ["jerk", "clean_and_jerk"] as const,
  },
] as const;

/**
 * Technique / video analysis is not implemented until lift-specific models exist.
 * Advanced video analysis is separately feature-flagged (default off).
 */
export const WEIGHTLIFTING_TECHNIQUE_ANALYSIS_STATUS = {
  implemented: false as const,
  reason:
    "Weightlifting technique analysis is not implemented until snatch / clean / jerk–specific models exist. Advanced video analysis stays behind its own feature flag.",
};

export const WEIGHTLIFTING_MODE_HONESTY = [
  "Weightlifting Mode centers snatch, clean, jerk, and clean & jerk — plus competition total when both competition lifts are known.",
  "Technique and position tracking are structural: position cues are educational checklists, not scored video analysis.",
  "Do not run weightlifting technique analysis until specific models exist. Advanced video analysis is feature-flagged separately and defaults off.",
  "Missing loads stay labeled missing — competition totals are never invented.",
] as const;
