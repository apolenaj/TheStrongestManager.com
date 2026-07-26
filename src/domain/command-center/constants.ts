/**
 * Performance OS Command Center (Prompt 188).
 * Ultimate dashboard shell: sectioned widgets, adaptive layout, user customization.
 * Never invent scores — widgets show observed data or honest empty states.
 */

export const COMMAND_CENTER_ENGINE_VERSION = "command_center.v1" as const;

export const COMMAND_CENTER_HONESTY = [
  "The Command Center organizes existing Performance OS surfaces — it does not invent scores, macros, or medical claims.",
  "Only TODAY is above the fold by default; other sections scroll into view so the first viewport stays focused.",
  "Widget visibility and order are user preferences (device-local until a synced prefs store exists) — never silently reintroduce hidden widgets as fake “insights”.",
  "Adaptive density follows viewport width (and optional user override); empty widgets stay empty.",
] as const;

/** Canonical section ids for the ultimate dashboard. */
export const COMMAND_CENTER_SECTIONS = [
  "today",
  "performance",
  "training",
  "technique",
  "recovery",
  "nutrition",
  "goal_trajectory",
  "ai_coach",
] as const;

export type CommandCenterSectionId =
  (typeof COMMAND_CENTER_SECTIONS)[number];

export const COMMAND_CENTER_SECTION_LABELS: Record<
  CommandCenterSectionId,
  string
> = {
  today: "TODAY",
  performance: "Performance",
  training: "Training",
  technique: "Technique",
  recovery: "Recovery",
  nutrition: "Nutrition",
  goal_trajectory: "Goal trajectory",
  ai_coach: "AI Coach",
};

export const COMMAND_CENTER_SECTION_HREFS: Record<
  CommandCenterSectionId,
  string
> = {
  today: "/app/today",
  performance: "/app/progress",
  training: "/app/programs",
  technique: "/app/technique",
  recovery: "/app/recovery",
  nutrition: "/app/nutrition",
  goal_trajectory: "/app/goal-progress",
  ai_coach: "/app/coach-brain",
};

/** Fold placement — above fold is intentionally sparse. */
export const COMMAND_CENTER_FOLD = ["above", "below"] as const;
export type CommandCenterFold = (typeof COMMAND_CENTER_FOLD)[number];

export const COMMAND_CENTER_DENSITIES = [
  "compact",
  "comfortable",
  "spacious",
] as const;
export type CommandCenterDensity = (typeof COMMAND_CENTER_DENSITIES)[number];

/** Auto density from viewport width (adaptive layout). */
export const COMMAND_CENTER_VIEWPORT_BREAKPOINTS = {
  /** < sm → compact */
  compactMaxPx: 639,
  /** sm–lg → comfortable */
  comfortableMaxPx: 1023,
  /** ≥ xl → spacious */
} as const;

export const COMMAND_CENTER_PREFS_STORAGE_KEY =
  "tsm.command_center.layout.v1" as const;

export const COMMAND_CENTER_PREFS_VERSION = 1 as const;
