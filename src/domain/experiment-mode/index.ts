export {
  EXPERIMENT_MODE_ENGINE_VERSION,
  EXPERIMENT_STATUSES,
  EXPERIMENT_STATUS_LABELS,
  EXPERIMENT_MEASURES,
  EXPERIMENT_MEASURE_LABELS,
  EXPERIMENT_MODE_HONESTY,
  EXPERIMENT_MODE_PRODUCT_NAME,
  EXPERIMENT_DURATION_WEEKS_MIN,
  EXPERIMENT_DURATION_WEEKS_MAX,
  type ExperimentStatus,
  type ExperimentMeasure,
} from "@/domain/experiment-mode/constants";

export type {
  ExperimentMeasureValue,
  ExperimentSnapshot,
  ExperimentCompareRow,
  ExperimentCompareResult,
  PersonalTrainingExperimentView,
  CreateExperimentInput,
} from "@/domain/experiment-mode/types";

export { validateCreateExperimentInput } from "@/domain/experiment-mode/validate";

export {
  compareExperimentSnapshots,
  experimentWindow,
  baselineWindow,
  parseMeasuresJson,
  parseSnapshotJson,
} from "@/domain/experiment-mode/compare";

export {
  buildExperimentSnapshot,
  type ExperimentSignalBag,
} from "@/domain/experiment-mode/snapshot";
