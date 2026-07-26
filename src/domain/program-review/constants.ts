/** AI Program Review — Prompt 56 */

export const PROGRAM_REVIEW_ENGINE_VERSION = "program_review.v1" as const;

export const PROGRAM_REVIEW_HONESTY = [
  "Program review reasons from the prescribed graph plus your profile context — it does not invent missing weeks or loads.",
  "A program is never labelled “bad” in isolation; issues are framed against your goal, experience, schedule, equipment, and recovery capacity.",
  "Recommendations are coaching-practice suggestions — never auto-applied and never medical advice.",
] as const;

export const PROGRAM_REVIEW_DIMENSION_IDS = [
  "frequency",
  "volume",
  "intensity",
  "exercise_selection",
  "movement_balance",
  "fatigue_distribution",
  "specificity",
  "progression_strategy",
  "recovery_demands",
] as const;

export type ProgramReviewDimensionId =
  (typeof PROGRAM_REVIEW_DIMENSION_IDS)[number];

export const PROGRAM_REVIEW_DIMENSION_LABELS: Record<
  ProgramReviewDimensionId,
  string
> = {
  frequency: "Frequency",
  volume: "Volume",
  intensity: "Intensity",
  exercise_selection: "Exercise selection",
  movement_balance: "Movement balance",
  fatigue_distribution: "Fatigue distribution",
  specificity: "Specificity",
  progression_strategy: "Progression strategy",
  recovery_demands: "Recovery demands",
};
