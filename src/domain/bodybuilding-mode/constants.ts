/**
 * Bodybuilding Mode (Prompt 105).
 * Muscle-group workload, volume, progression — never fake muscle-growth scores or photo body-fat.
 */

export const BODYBUILDING_MODE_ENGINE_VERSION = "bodybuilding_mode.v1" as const;

export const BODYBUILDING_DASHBOARD_PRIORITIES = [
  "muscle_groups",
  "weekly_volume",
  "exercise_progression",
  "bodyweight",
  "training_performance",
] as const;
export type BodybuildingDashboardPriority =
  (typeof BODYBUILDING_DASHBOARD_PRIORITIES)[number];

export const BODYBUILDING_PRIORITY_LABELS: Record<
  BodybuildingDashboardPriority,
  string
> = {
  muscle_groups: "Muscle groups",
  weekly_volume: "Weekly training volume",
  exercise_progression: "Exercise progression",
  bodyweight: "Bodyweight",
  training_performance: "Training performance",
};

/** Supporting modules composed into the mode. */
export const BODYBUILDING_SUPPORT_MODULES = [
  "muscle_workload",
  "exercise_progression",
  "recovery",
  "physique_photos",
] as const;
export type BodybuildingSupportModule =
  (typeof BODYBUILDING_SUPPORT_MODULES)[number];

export const BODYBUILDING_SUPPORT_LABELS: Record<
  BodybuildingSupportModule,
  string
> = {
  muscle_workload: "Muscle-group workload overview",
  exercise_progression: "Exercise progression",
  recovery: "Recovery",
  physique_photos: "Physique photos",
};

/**
 * Patterns we refuse — parallel to PL deferred DOTS honesty.
 */
export const BODYBUILDING_FORBIDDEN_CLAIMS = [
  "muscle_growth_score",
  "hypertrophy_percent",
  "stage_readiness_score",
  "symmetry_ai_score",
  "body_fat_from_photo",
  "medical_bodyfat_estimate",
] as const;

export const BODYBUILDING_MODE_HONESTY = [
  "Bodybuilding Mode prioritizes muscle groups, weekly volume, exercise progression, bodyweight, and training performance.",
  "There is no muscle-growth score. Workload is observed sets and tonnage — not predicted hypertrophy.",
  "Physique photos are optional and private. Body-fat is never estimated from photos unless a validated method ships.",
  "Recovery and progression link to existing modules; missing data stays labeled missing.",
] as const;

export const DEFAULT_BODYBUILDING_LOOKBACK_DAYS = 7;

/** Display labels for common hypertrophy muscle keys. */
export const BODYBUILDING_MUSCLE_LABELS: Record<string, string> = {
  quads: "Quads",
  glutes: "Glutes",
  hamstrings: "Hamstrings",
  chest: "Chest",
  upper_back: "Upper back",
  lats: "Lats",
  traps: "Traps",
  rear_delts: "Rear delts",
  side_delts: "Side delts",
  front_delts: "Front delts",
  biceps: "Biceps",
  triceps: "Triceps",
  abs: "Abs",
  calves: "Calves",
  erectors: "Erectors",
  forearms: "Forearms",
};
