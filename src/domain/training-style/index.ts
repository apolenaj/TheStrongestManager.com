export {
  TRAINING_STYLE_ENGINE_VERSION,
  TRAINING_STYLE_DIMENSION_IDS,
  TRAINING_STYLE_DIMENSION_LABELS,
  INTENSITY_BANDS,
  FREQUENCY_BANDS,
  VOLUME_TOLERANCE_BANDS,
  TRAINING_STYLE_BAND_LABELS,
  TRAINING_STYLE_SOURCE_KINDS,
  TRAINING_STYLE_HONESTY,
  TRAINING_STYLE_FORBIDDEN_CLAIMS,
  DEFAULT_TRAINING_STYLE_LOOKBACK_DAYS,
} from "@/domain/training-style/constants";
export type {
  TrainingStyleDimensionId,
  IntensityBand,
  FrequencyBand,
  VolumeToleranceBand,
  TrainingStyleSourceKind,
} from "@/domain/training-style/constants";

export type {
  TrainingStyleDimension,
  TrainingStyleProfilePayload,
  TrainingStyleSignals,
} from "@/domain/training-style/types";

export {
  assembleTrainingStyleProfile,
  trainingStyleProfileText,
} from "@/domain/training-style/assemble";
