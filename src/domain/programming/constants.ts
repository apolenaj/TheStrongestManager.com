/**
 * Programming architecture constants (Prompt 21).
 */

export const PROGRAM_KINDS = ["template", "athlete"] as const;
export type ProgramKind = (typeof PROGRAM_KINDS)[number];

export const WORKOUT_KINDS = ["template", "athlete"] as const;
export type WorkoutKind = (typeof WORKOUT_KINDS)[number];

export const PROGRAM_STATUSES = [
  "draft",
  "active",
  "completed",
  "archived",
] as const;
export type ProgramStatus = (typeof PROGRAM_STATUSES)[number];

export const SESSION_STATUSES = [
  "planned",
  "in_progress",
  "completed",
  "skipped",
] as const;
export type SessionStatus = (typeof SESSION_STATUSES)[number];

export const PROGRESSION_RULE_KINDS = [
  "add_load",
  "add_reps",
  "double_progression",
  "percent_wave",
  "custom",
] as const;
export type ProgressionRuleKind = (typeof PROGRESSION_RULE_KINDS)[number];

/** Statuses that allow editing the live program graph (not historical sessions). */
export const PROGRAM_EDITABLE_STATUSES: readonly ProgramStatus[] = [
  "draft",
  "active",
];

/** Session statuses whose prescription ledger must not be rewritten. */
export const SESSION_PRESCRIPTION_LOCKED_STATUSES: readonly SessionStatus[] = [
  "completed",
];
