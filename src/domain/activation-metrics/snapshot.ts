import {
  ACTIVATION_CRITERIA,
  ACTIVATION_DEFAULT_COHORT_DAYS,
  ACTIVATION_ENGINE_VERSION,
  ACTIVATION_FUNNEL_STEPS,
  ACTIVATION_HONESTY,
  ACTIVATION_MIN_COHORT_FOR_RATES,
  ACTIVATION_RETURN_WINDOW_DAYS,
  ACTIVATION_VANITY_METRICS,
} from "@/domain/activation-metrics/constants";
import {
  summarizeActivationCohort,
  type ActivationCohortSummary,
  type AthleteActivationResult,
} from "@/domain/activation-metrics/evaluate";

export type ActivationMetricsSnapshot = {
  engineVersion: typeof ACTIVATION_ENGINE_VERSION;
  honesty: typeof ACTIVATION_HONESTY;
  criteria: typeof ACTIVATION_CRITERIA;
  funnelSteps: typeof ACTIVATION_FUNNEL_STEPS;
  vanityMetrics: typeof ACTIVATION_VANITY_METRICS;
  returnWindowDays: number;
  cohortDays: number;
  minCohortForRates: number;
  cohort: ActivationCohortSummary;
  /** Sample of recent evaluations (capped) for admin inspection. */
  sampleAthletes: AthleteActivationResult[];
  generatedAt: string;
};

export function buildActivationMetricsSnapshot(input: {
  cohortDays?: number;
  results: AthleteActivationResult[];
  generatedAt?: string;
}): ActivationMetricsSnapshot {
  const cohort = summarizeActivationCohort(input.results);
  return {
    engineVersion: ACTIVATION_ENGINE_VERSION,
    honesty: ACTIVATION_HONESTY,
    criteria: ACTIVATION_CRITERIA,
    funnelSteps: ACTIVATION_FUNNEL_STEPS,
    vanityMetrics: ACTIVATION_VANITY_METRICS,
    returnWindowDays: ACTIVATION_RETURN_WINDOW_DAYS,
    cohortDays: input.cohortDays ?? ACTIVATION_DEFAULT_COHORT_DAYS,
    minCohortForRates: ACTIVATION_MIN_COHORT_FOR_RATES,
    cohort,
    sampleAthletes: input.results.slice(0, 25),
    generatedAt: input.generatedAt ?? new Date().toISOString(),
  };
}
