export {
  PR_LOOKBACK_DAYS,
  PR_MIN_QUALIFYING_SETS,
  PR_HARD_SET_RPE_MIN,
} from "@/domain/pr-prediction/constants";
export {
  inferTrainingPhase,
  mapTrendDirection,
} from "@/domain/pr-prediction/phase";
export {
  estimateSetE1rmKg,
  predictOneRmRange,
  predictPrRanges,
} from "@/domain/pr-prediction/predict";
export type {
  PerformanceTrendHint,
  PrPrediction,
  PrPredictionConfidence,
  PrPredictionContext,
  PrPredictionResult,
  PrPredictionWithheld,
  TrainingPhaseHint,
  WorkingSetInput,
} from "@/domain/pr-prediction/types";
