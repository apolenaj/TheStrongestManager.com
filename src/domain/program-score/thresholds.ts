/**
 * Training Program Score — Prompt 57.
 * Deterministic weighted components. Not the athlete “programming” adherence pillar.
 */

export const PROGRAM_SCORE_FORMULA_ID = "program.quality.weighted_v1" as const;
export const PROGRAM_SCORE_FORMULA_VERSION = "1.0.0" as const;

/**
 * Nominal component weights (sum = 1.0).
 * Unavailable components are dropped; remaining weights are renormalized.
 *
 * Rationale:
 * - Goal alignment & specificity carry the most weight because a high-volume
 *   program that misses the athlete’s goal is still a poor fit.
 * - Progression, volume, and recovery are next — they govern whether the plan
 *   can be executed sustainably.
 * - Fatigue management and exercise balance close the model for weekly structure.
 */
export const PROGRAM_SCORE_WEIGHTS = {
  goal_alignment: 0.18,
  specificity: 0.16,
  progression: 0.14,
  volume_suitability: 0.14,
  fatigue_management: 0.13,
  exercise_balance: 0.12,
  recovery_compatibility: 0.13,
} as const;

export type ProgramScoreComponentId = keyof typeof PROGRAM_SCORE_WEIGHTS;

export const PROGRAM_SCORE_COMPONENT_LABELS: Record<
  ProgramScoreComponentId,
  string
> = {
  goal_alignment: "Goal alignment",
  specificity: "Specificity",
  progression: "Progression",
  volume_suitability: "Volume suitability",
  fatigue_management: "Fatigue management",
  exercise_balance: "Exercise balance",
  recovery_compatibility: "Recovery compatibility",
};

/** Minimum observed components required to emit overallScore. */
export const PROGRAM_SCORE_MIN_COMPONENTS_FOR_SCORE = 4;
/** Rationale: fewer than 4 of 7 is too sparse to claim a program quality score. */

export const PROGRAM_SCORE_MIN_COMPONENTS_FOR_MEDIUM = 5;
export const PROGRAM_SCORE_MIN_COMPONENTS_FOR_HIGH = 6;

/**
 * Volume suitability bands (estimated weekly sets from targetSets).
 * Tuned as coaching-practice heuristics — not laboratory dose-response curves.
 */
export const VOLUME_SETS_BEGINNER_MAX = 40;
export const VOLUME_SETS_INTERMEDIATE_MAX = 60;
export const VOLUME_SETS_ADVANCED_MAX = 80;
export const VOLUME_SETS_LIGHT_MIN = 12;
/** Rationale: below LIGHT_MIN with ≥3 training days usually means incomplete targets. */

/** Fatigue: estimated sets on a day counted as “dense”. */
export const FATIGUE_DENSE_SETS = 12;
/** Consecutive dense days reduce fatigue-management score. */

/** Recovery: high-demand day threshold (sets or RPE). */
export const RECOVERY_HIGH_SETS = 15;
export const RECOVERY_HIGH_RPE = 8;

export const PROGRAM_SCORE_FORMULA_DESCRIPTION =
  "Training Program Score = renormalized weighted mean of observed components " +
  "(goal_alignment, specificity, progression, volume_suitability, fatigue_management, " +
  "exercise_balance, recovery_compatibility). Weights in PROGRAM_SCORE_WEIGHTS. " +
  "overallScore is null when fewer than PROGRAM_SCORE_MIN_COMPONENTS_FOR_SCORE components are observed.";

export const PROGRAM_SCORE_ASSUMPTIONS = [
  "Scores the prescribed program graph plus athlete profile context — not logged adherence.",
  "Distinct from the athlete Scoring System “programming” pillar (session adherence).",
  "Component weights are named constants; unavailable components are omitted and weights renormalized.",
  "Volume uses prescribed targetSets — not measured tonnage.",
  "A program is never labelled “bad” by the score alone; low scores cite missing fit or sparse data.",
  "Not medical advice and not an injury-risk model.",
] as const;

export const PROGRAM_SCORE_MINIMUM_DATA = [
  "Program days with linked workouts and exercises",
  "Primary goal (for goal alignment)",
  "Experience level and/or recovery capacity (for volume & recovery components)",
  "Movement-pattern tags on catalog exercises (for balance & specificity)",
] as const;
