/**
 * Program Builder 2.0 (Prompt 117).
 * Structured draft generation — never invents random exercise volume.
 */

export const PROGRAM_BUILDER_ENGINE_VERSION = "program_builder.v2" as const;

export const PROGRAM_BUILDER_HONESTY = [
  "Program Builder 2.0 drafts use structured volume tables and catalog exercises — not random AI set counts.",
  "Drafts are editable and never auto-apply to your live athlete program.",
  "Why, progression, deload, and adjustment rules ship with every draft so the plan stays explainable.",
  "This is coaching-practice education, not medical advice or a guarantee of results.",
] as const;

export const PROGRAM_BUILDER_VOLUME_TABLE_ID = "volume.program_builder.v2" as const;

/** Curated priority-lift options (catalog slugs only). */
export const PROGRAM_BUILDER_PRIORITY_LIFTS = [
  "back-squat",
  "front-squat",
  "bench-press",
  "overhead-press",
  "deadlift",
  "romanian-deadlift",
  "barbell-row",
  "pull-up",
] as const;

export type ProgramBuilderPriorityLift =
  (typeof PROGRAM_BUILDER_PRIORITY_LIFTS)[number];

export const PROGRAM_BUILDER_PRIORITY_LIFT_LABELS: Record<
  ProgramBuilderPriorityLift,
  string
> = {
  "back-squat": "Back squat",
  "front-squat": "Front squat",
  "bench-press": "Bench press",
  "overhead-press": "Overhead press",
  deadlift: "Deadlift",
  "romanian-deadlift": "Romanian deadlift",
  "barbell-row": "Barbell row",
  "pull-up": "Pull-up",
};

/** Max priority lifts a user can select. */
export const PROGRAM_BUILDER_MAX_PRIORITY_LIFTS = 4;

/** Hard floor/ceiling so edits cannot invent absurd volume. */
export const PROGRAM_BUILDER_SET_MIN = 1;
export const PROGRAM_BUILDER_SET_MAX = 8;
