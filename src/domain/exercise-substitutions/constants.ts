/**
 * Smart Exercise Substitutions (Prompt 127).
 * Replacement engine — goal, pattern, fatigue, and skill aware tradeoffs.
 */

export const EXERCISE_SUBSTITUTION_ENGINE_VERSION =
  "exercise_substitutions.v1" as const;

export const EXERCISE_SUBSTITUTION_HONESTY = [
  "Substitutions are coaching suggestions from the published catalog — not medical advice and not auto-applied to your program.",
  "Tradeoffs compare goal fit, movement pattern, fatigue demand, and skill demand versus the unavailable lift.",
  "Equipment filters use what you have available; missing catalog coverage stays empty rather than inventing lifts.",
  "When fatigue is elevated or skill is limited, lower-demand options are preferred — you still decide what to train.",
] as const;

export const EXERCISE_SUBSTITUTION_MAX_RESULTS = 5;

export const EXERCISE_SUBSTITUTION_GOALS = [
  "chest_strength",
  "strength",
  "hypertrophy",
  "powerlifting",
  "general",
  "other",
] as const;

export type ExerciseSubstitutionGoal =
  (typeof EXERCISE_SUBSTITUTION_GOALS)[number];

export const EXERCISE_SUBSTITUTION_GOAL_LABELS: Record<
  ExerciseSubstitutionGoal,
  string
> = {
  chest_strength: "Chest strength",
  strength: "Strength",
  hypertrophy: "Hypertrophy",
  powerlifting: "Powerlifting",
  general: "General",
  other: "Other",
};
