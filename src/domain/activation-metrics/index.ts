export {
  ACTIVATION_ENGINE_VERSION,
  ACTIVATION_HONESTY,
  ACTIVATION_RETURN_WINDOW_DAYS,
  ACTIVATION_DEFAULT_COHORT_DAYS,
  ACTIVATION_MIN_COHORT_FOR_RATES,
  ACTIVATION_CRITERIA,
  ACTIVATION_FUNNEL_STEPS,
  ACTIVATION_VANITY_METRICS,
} from "@/domain/activation-metrics/constants";
export type {
  ActivationCriterionId,
  ActivationFunnelStepId,
} from "@/domain/activation-metrics/constants";

export {
  hasReturnedWithinSevenDays,
  evaluateAthleteActivation,
  summarizeActivationCohort,
  medianMsToCriterion,
} from "@/domain/activation-metrics/evaluate";
export type {
  AthleteActivationInput,
  AthleteActivationResult,
  ActivationCohortTotals,
  ActivationRateRow,
  ActivationCohortSummary,
} from "@/domain/activation-metrics/evaluate";

export {
  buildActivationMetricsSnapshot,
  type ActivationMetricsSnapshot,
} from "@/domain/activation-metrics/snapshot";
