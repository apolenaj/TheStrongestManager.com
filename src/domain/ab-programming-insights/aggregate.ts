/**
 * Build or suppress insight rows from raw cohort stats.
 * Never invents winners; never presents correlation as causation.
 */

import {
  AB_CORRELATION_NOT_CAUSATION,
  AB_INSIGHT_MIN_SAMPLE,
  AB_INSUFFICIENT_SAMPLE_MESSAGE,
  AB_PROGRAMMING_DIMENSION_LABELS,
  AB_PROGRAMMING_INSIGHTS_HONESTY,
  type AbProgrammingDimension,
} from "@/domain/ab-programming-insights/constants";
import {
  canPublishAggregateInsight,
  canPublishPairwiseComparison,
  minSampleForDimension,
} from "@/domain/ab-programming-insights/gate";
import type {
  AbInsightArmObservation,
  AbProgrammingInsight,
} from "@/domain/ab-programming-insights/types";

export type RawAbCohortInput = {
  id: string;
  dimension: AbProgrammingDimension;
  title: string;
  cohortSize: number;
  observations: AbInsightArmObservation[];
};

/**
 * Apply sample thresholds. Under-threshold cohorts become suppressed shells.
 */
export function buildAbProgrammingInsight(
  raw: RawAbCohortInput,
): AbProgrammingInsight {
  const publishable = canPublishAggregateInsight(
    raw.cohortSize,
    raw.dimension,
  );

  const armsOk =
    raw.observations.length < 2 ||
    canPublishPairwiseComparison({
      armASize: raw.observations[0]?.armSampleSize ?? 0,
      armBSize: raw.observations[1]?.armSampleSize ?? 0,
    });

  const allowed = publishable && armsOk;

  return {
    id: raw.id,
    dimension: raw.dimension,
    title: raw.title,
    cohortSize: raw.cohortSize,
    publishable: allowed,
    observations: allowed ? raw.observations : [],
    correlationNotCausation: true,
    disclaimer: AB_CORRELATION_NOT_CAUSATION,
    suppressedReason: allowed
      ? null
      : !publishable
        ? `${AB_INSUFFICIENT_SAMPLE_MESSAGE} (need ≥${minSampleForDimension(raw.dimension)}; have ${raw.cohortSize}).`
        : `${AB_INSUFFICIENT_SAMPLE_MESSAGE} Pairwise arms need ≥${AB_INSIGHT_MIN_SAMPLE.pairwiseComparison} each.`,
  };
}

/**
 * Stub aggregator for architecture readiness.
 * Returns empty published insights until real anonymized jobs exist.
 * May include suppressed placeholder rows to document thresholds.
 */
export function aggregateAbProgrammingInsightsStub(input?: {
  /** Optional future raw cohorts from AggregationJob — default none. */
  rawCohorts?: RawAbCohortInput[];
}): {
  insights: AbProgrammingInsight[];
  suppressedCohortCount: number;
  pipelineStatus: "architecture_ready";
} {
  const raw = input?.rawCohorts ?? [];
  const built = raw.map(buildAbProgrammingInsight);

  // Architecture placeholders: one suppressed shell per dimension so UI can
  // explain thresholds without inventing fake correlations.
  if (raw.length === 0) {
    const placeholders: AbProgrammingInsight[] = (
      Object.keys(AB_PROGRAMMING_DIMENSION_LABELS) as AbProgrammingDimension[]
    ).map((dimension) =>
      buildAbProgrammingInsight({
        id: `placeholder.${dimension}`,
        dimension,
        title: `${AB_PROGRAMMING_DIMENSION_LABELS[dimension]} — awaiting anonymized outcomes`,
        cohortSize: 0,
        observations: [],
      }),
    );
    return {
      insights: placeholders,
      suppressedCohortCount: placeholders.length,
      pipelineStatus: "architecture_ready",
    };
  }

  return {
    insights: built,
    suppressedCohortCount: built.filter((i) => !i.publishable).length,
    pipelineStatus: "architecture_ready",
  };
}

export function overviewHonesty(): readonly string[] {
  return AB_PROGRAMMING_INSIGHTS_HONESTY;
}
