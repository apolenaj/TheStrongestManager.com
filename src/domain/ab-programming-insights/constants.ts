/**
 * A/B Programming Insights (Prompt 120).
 * Architecture for future anonymized outcome analysis — not causal claims.
 */

import { DATA_MOAT_MIN_COHORT_SIZE } from "@/domain/data-moat/constants";

export const AB_PROGRAMMING_INSIGHTS_ENGINE_VERSION =
  "ab_programming_insights.v1" as const;

/** Comparison dimensions for future aggregate analysis. */
export const AB_PROGRAMMING_DIMENSIONS = [
  "program_approach",
  "exercise_choice",
  "progression_style",
] as const;

export type AbProgrammingDimension =
  (typeof AB_PROGRAMMING_DIMENSIONS)[number];

export const AB_PROGRAMMING_DIMENSION_LABELS: Record<
  AbProgrammingDimension,
  string
> = {
  program_approach: "Program approaches",
  exercise_choice: "Exercise choices",
  progression_style: "Progression styles",
};

export const AB_PROGRAMMING_DIMENSION_DESCRIPTIONS: Record<
  AbProgrammingDimension,
  string
> = {
  program_approach:
    "Future aggregates across training approaches (e.g. frequency splits, method families) — anonymized counts only.",
  exercise_choice:
    "Future aggregates across primary lift / accessory choices — never individual athlete lists.",
  progression_style:
    "Future aggregates across progression rule styles (add load, double progression, …) — observational only.",
};

/**
 * Minimum sample thresholds (k-anonymity style).
 * Aligns with data-moat floor; dimension-specific floors can rise later.
 */
export const AB_INSIGHT_MIN_SAMPLE = {
  /** Global floor — never publish below this. */
  default: DATA_MOAT_MIN_COHORT_SIZE,
  program_approach: DATA_MOAT_MIN_COHORT_SIZE,
  exercise_choice: DATA_MOAT_MIN_COHORT_SIZE,
  progression_style: DATA_MOAT_MIN_COHORT_SIZE,
  /** Prefer a higher bar before comparing two arms head-to-head. */
  pairwiseComparison: 20,
} as const;

export const AB_PROGRAMMING_INSIGHTS_HONESTY = [
  "A/B Programming Insights is architecture for future anonymized, consent-gated outcome analysis — pipelines are not publishing live winners yet.",
  "Aggregate observations are shown only when sample size meets minimum thresholds. Small cohorts are suppressed.",
  "Correlation is not causation. Confounders (sleep, stress, adherence, selection bias) can explain differences between approaches.",
  "This is not Experiment Mode (personal n=1 checks), not an online A/B judge, and not scientific research.",
] as const;

export const AB_CORRELATION_NOT_CAUSATION =
  "Observational association only — correlation is not causation." as const;

export const AB_INSUFFICIENT_SAMPLE_MESSAGE =
  "Not enough anonymized outcomes yet. Insights stay hidden until the minimum sample threshold is met." as const;
