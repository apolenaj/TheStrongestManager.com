/**
 * Exercise Comparison Engine (Prompt 166).
 * Exercise A vs B — qualitative, SEO-safe allowlisted pairs.
 */

export const EXERCISE_COMPARISON_ENGINE_VERSION =
  "exercise_comparison.v1" as const;

export const EXERCISE_COMPARISON_HONESTY = [
  "Comparisons are qualitative coaching contrast — not numeric superiority scores.",
  "Only exercises with curated profiles can enter the interactive tool.",
  "SEO pages exist only for allowlisted pairs with unique editorial value — not every A×B combination.",
  "Arbitrary query comparisons canonicalize to the hub and stay noindex.",
] as const;

export const EXERCISE_COMPARE_MIN = 2;
export const EXERCISE_COMPARE_MAX = 2;

/** Prompt 166 comparison dimensions. */
export const EXERCISE_COMPARISON_DIMENSIONS = [
  {
    id: "purpose",
    label: "Purpose",
    description: "What each exercise is mainly used for in training.",
  },
  {
    id: "technique",
    label: "Technique",
    description: "Start position, joint actions, and execution character.",
  },
  {
    id: "muscles",
    label: "Muscles",
    description: "Primary emphasis — not a complete anatomy map.",
  },
  {
    id: "fatigue",
    label: "Fatigue",
    description: "Qualitative recovery / systemic cost when dosed similarly.",
  },
  {
    id: "programming",
    label: "Programming",
    description: "How the lift typically sits in a week or block.",
  },
  {
    id: "whoShouldChoose",
    label: "Who should choose which",
    description: "Practical selection guidance — not medical advice.",
  },
] as const;

export type ExerciseComparisonDimensionId =
  (typeof EXERCISE_COMPARISON_DIMENSIONS)[number]["id"];

export const EXERCISE_FATIGUE_BANDS = [
  "low",
  "low_moderate",
  "moderate",
  "moderate_high",
  "high",
] as const;

export type ExerciseFatigueBand = (typeof EXERCISE_FATIGUE_BANDS)[number];

export const EXERCISE_FATIGUE_BAND_LABELS: Record<ExerciseFatigueBand, string> =
  {
    low: "Low",
    low_moderate: "Low–moderate",
    moderate: "Moderate",
    moderate_high: "Moderate–high",
    high: "High",
  };
