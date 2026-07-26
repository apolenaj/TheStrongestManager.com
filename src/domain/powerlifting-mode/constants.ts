/**
 * Powerlifting Mode (Prompt 104).
 * Sport shell for SBD priorities — never invent federation rules or DOTS without a real calculator.
 */

export const POWERLIFTING_MODE_ENGINE_VERSION = "powerlifting_mode.v1" as const;

export const POWERLIFTING_LIFTS = ["squat", "bench", "deadlift"] as const;
export type PowerliftingLift = (typeof POWERLIFTING_LIFTS)[number];

export const POWERLIFTING_LIFT_LABELS: Record<PowerliftingLift, string> = {
  squat: "Squat",
  bench: "Bench",
  deadlift: "Deadlift",
};

/** Dashboard priority modules for Powerlifting Mode. */
export const POWERLIFTING_DASHBOARD_PRIORITIES = [
  "squat",
  "bench",
  "deadlift",
  "total",
  "relative_score",
  "competition",
  "weight_class",
  "attempt_planning",
] as const;
export type PowerliftingDashboardPriority =
  (typeof POWERLIFTING_DASHBOARD_PRIORITIES)[number];

export const POWERLIFTING_PRIORITY_LABELS: Record<
  PowerliftingDashboardPriority,
  string
> = {
  squat: "Squat",
  bench: "Bench",
  deadlift: "Deadlift",
  total: "Total",
  relative_score: "Relative score (DOTS / similar)",
  competition: "Competition",
  weight_class: "Weight class",
  attempt_planning: "Attempt planning",
};

/** Training focus areas — coaching language, not federation rulebooks. */
export const POWERLIFTING_TRAINING_FOCI = [
  "specificity",
  "peaking",
  "competition_commands",
] as const;
export type PowerliftingTrainingFocus =
  (typeof POWERLIFTING_TRAINING_FOCI)[number];

export const POWERLIFTING_TRAINING_FOCUS_LABELS: Record<
  PowerliftingTrainingFocus,
  string
> = {
  specificity: "Specificity",
  peaking: "Peaking",
  competition_commands: "Competition commands",
};

/**
 * Common meet command cues — illustrative coaching language only.
 * Not federation-specific rule text.
 */
export const POWERLIFTING_MEET_COMMAND_CUES = [
  {
    lift: "squat" as const,
    cues: ["Squat", "Rack"],
    note: "Common squat commands — confirm with your federation’s rulebook on meet day.",
  },
  {
    lift: "bench" as const,
    cues: ["Start", "Press", "Rack"],
    note: "Common bench commands — timing and legal pause vary by federation.",
  },
  {
    lift: "deadlift" as const,
    cues: ["Down"],
    note: "Common deadlift down signal — start rules and lockout standards vary by federation.",
  },
] as const;

/** Canonical technique library slugs for PL (catalog). */
export const POWERLIFTING_TECHNIQUE_SLUGS = [
  { slug: "back-squat", label: "Back squat", lift: "squat" as const },
  { slug: "bench-press", label: "Bench press", lift: "bench" as const },
  { slug: "deadlift", label: "Deadlift", lift: "deadlift" as const },
] as const;

export const POWERLIFTING_MODE_HONESTY = [
  "Powerlifting Mode prioritizes squat, bench, deadlift, total, competition, weight class, and attempt planning.",
  "DOTS is available via the cited calculator at /tools/dots. Wilks and IPF GL Points remain deferred — never invented coefficients.",
  "Federation-specific rules are not applied here. Federation selection is deferred so we do not mix rulebooks.",
  "Meet command cues are common coaching language, not official federation text.",
] as const;

/**
 * Relative scoring: DOTS calculator shipped (Prompt 168).
 * Mode still does not invent an inline score without athlete inputs —
 * it links to the cited calculator. Wilks / IPF GL stay deferred.
 */
export const POWERLIFTING_RELATIVE_SCORE_STATUS = {
  available: true as const,
  calculatorHref: "/tools/dots",
  systemsAvailable: ["dots"] as const,
  systemsDeferred: ["wilks", "ipf_gl"] as const,
  reason:
    "DOTS uses cited OpenPowerlifting coefficients at /tools/dots. Wilks and IPF GL Points are not computed. Powerlifting Mode does not invent a score without your inputs.",
};
