export {
  BODYWEIGHT_PERFORMANCE_ENGINE_VERSION,
  BODYWEIGHT_PERFORMANCE_STABLE_PCT,
  BODYWEIGHT_PERFORMANCE_STABLE_STRENGTH_KG,
  BODYWEIGHT_PERFORMANCE_HONESTY,
  BODYWEIGHT_PERFORMANCE_TREND_LABELS,
} from "@/domain/bodyweight-performance/constants";

export type {
  BwPerfTrendDirection,
  BwPerfSample,
  BwPerfWindowSummary,
  BodyweightPerformanceAnalysis,
} from "@/domain/bodyweight-performance/types";

export {
  classifyDeltaTrend,
  formatSignedKg,
  summarizeWindow,
  nearestBodyweightKg,
  relativeStrengthAt,
  sortSamples,
} from "@/domain/bodyweight-performance/trends";

export { analyzeBodyweightPerformance } from "@/domain/bodyweight-performance/analyze";
