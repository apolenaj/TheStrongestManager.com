/**
 * Training Consistency Intelligence (Prompt 123).
 * Plan adherence — not days in the gym.
 */

export const TRAINING_CONSISTENCY_ENGINE_VERSION =
  "training_consistency_intelligence.v1" as const;

export const TRAINING_CONSISTENCY_HONESTY = [
  "Measures adherence to the plan — not days in the gym.",
  "Planned rest, structured deloads, injury breaks, and program changes adjust expectations; they are not failures.",
  "Completing every scheduled session blindly is not rewarded when the plan called for rest or reduced training.",
  "Extra unscheduled sessions are tracked separately and do not inflate adherence.",
  "This is coaching intelligence, not a moral score or medical clearance.",
] as const;

/** Minimum plan days with a resolvable outcome before publishing a score. */
export const TCI_MIN_RESOLVED_PLAN_DAYS = 4;

/** Default analysis window. */
export const TCI_DEFAULT_WINDOW_DAYS = 28;

/** Days around an accepted deload adaptation treated as deload context. */
export const TCI_DELOAD_CONTEXT_DAYS = 7;

/** Days around a program version save treated as program-change transition. */
export const TCI_PROGRAM_CHANGE_CONTEXT_DAYS = 5;

/** Consecutive skipped scheduled days that may signal an injury/pause break (with note). */
export const TCI_INJURY_BREAK_MIN_SKIPPED_DAYS = 3;

export const TCI_CONTEXT_KINDS = [
  "planned_rest",
  "deload",
  "injury_break",
  "program_change",
] as const;

export type TciContextKind = (typeof TCI_CONTEXT_KINDS)[number];

export const TCI_CONTEXT_LABELS: Record<TciContextKind, string> = {
  planned_rest: "Planned rest",
  deload: "Deload",
  injury_break: "Injury break",
  program_change: "Program change",
};

export const TCI_DAY_OUTCOMES = [
  "adhered_training",
  "adhered_rest",
  "missed",
  "context_adjusted",
  "pending",
  "extra_session",
  "excluded",
] as const;

export type TciDayOutcome = (typeof TCI_DAY_OUTCOMES)[number];
