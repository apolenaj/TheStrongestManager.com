import {
  RETENTION_CORRELATION_ACTIONS,
  RETENTION_DEFAULT_COHORT_DAYS,
  RETENTION_ENGINE_VERSION,
  RETENTION_FEATURES,
  RETENTION_HONESTY,
  RETENTION_MIN_CELL_FOR_CORRELATION,
  RETENTION_MIN_COHORT_FOR_RATES,
  RETENTION_WINDOWS,
} from "@/domain/retention-analytics/constants";
import {
  summarizeRetentionCohort,
  type RetentionAthleteResult,
  type RetentionCohortSummary,
} from "@/domain/retention-analytics/evaluate";

export type RetentionAnalyticsSnapshot = {
  engineVersion: typeof RETENTION_ENGINE_VERSION;
  honesty: typeof RETENTION_HONESTY;
  windows: typeof RETENTION_WINDOWS;
  correlationActions: typeof RETENTION_CORRELATION_ACTIONS;
  features: typeof RETENTION_FEATURES;
  cohortDays: number;
  minCohortForRates: number;
  minCellForCorrelation: number;
  cohort: RetentionCohortSummary;
  sampleAthletes: RetentionAthleteResult[];
  generatedAt: string;
};

export function buildRetentionAnalyticsSnapshot(input: {
  cohortDays?: number;
  results: RetentionAthleteResult[];
  generatedAt?: string;
}): RetentionAnalyticsSnapshot {
  return {
    engineVersion: RETENTION_ENGINE_VERSION,
    honesty: RETENTION_HONESTY,
    windows: RETENTION_WINDOWS,
    correlationActions: RETENTION_CORRELATION_ACTIONS,
    features: RETENTION_FEATURES,
    cohortDays: input.cohortDays ?? RETENTION_DEFAULT_COHORT_DAYS,
    minCohortForRates: RETENTION_MIN_COHORT_FOR_RATES,
    minCellForCorrelation: RETENTION_MIN_CELL_FOR_CORRELATION,
    cohort: summarizeRetentionCohort(input.results),
    sampleAthletes: input.results.slice(0, 25),
    generatedAt: input.generatedAt ?? new Date().toISOString(),
  };
}
