export {
  AB_PROGRAMMING_INSIGHTS_ENGINE_VERSION,
  AB_PROGRAMMING_DIMENSIONS,
  AB_PROGRAMMING_DIMENSION_LABELS,
  AB_PROGRAMMING_DIMENSION_DESCRIPTIONS,
  AB_INSIGHT_MIN_SAMPLE,
  AB_PROGRAMMING_INSIGHTS_HONESTY,
  AB_CORRELATION_NOT_CAUSATION,
  AB_INSUFFICIENT_SAMPLE_MESSAGE,
  type AbProgrammingDimension,
} from "@/domain/ab-programming-insights/constants";

export type {
  AbInsightArmObservation,
  AbProgrammingInsight,
  AbProgrammingInsightsOverview,
} from "@/domain/ab-programming-insights/types";

export {
  canPublishAggregateInsight,
  canPublishPairwiseComparison,
  minSampleForDimension,
} from "@/domain/ab-programming-insights/gate";

export {
  buildAbProgrammingInsight,
  aggregateAbProgrammingInsightsStub,
  overviewHonesty,
  type RawAbCohortInput,
} from "@/domain/ab-programming-insights/aggregate";
