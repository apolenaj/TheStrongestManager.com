/**
 * Sample-size gates for A/B Programming Insights.
 */

import {
  AB_INSIGHT_MIN_SAMPLE,
  type AbProgrammingDimension,
} from "@/domain/ab-programming-insights/constants";

export function minSampleForDimension(
  dimension: AbProgrammingDimension,
): number {
  return AB_INSIGHT_MIN_SAMPLE[dimension];
}

/**
 * Only use aggregate data when sample size is sufficient.
 */
export function canPublishAggregateInsight(
  cohortSize: number,
  dimension?: AbProgrammingDimension,
): boolean {
  const min =
    dimension != null
      ? minSampleForDimension(dimension)
      : AB_INSIGHT_MIN_SAMPLE.default;
  return Number.isFinite(cohortSize) && cohortSize >= min;
}

/**
 * Pairwise arm comparison needs a higher bar than a single descriptive cohort.
 */
export function canPublishPairwiseComparison(input: {
  armASize: number;
  armBSize: number;
}): boolean {
  const min = AB_INSIGHT_MIN_SAMPLE.pairwiseComparison;
  return input.armASize >= min && input.armBSize >= min;
}
