export {
  RECORDING_GUIDE_ENGINE_VERSION,
  RECORDING_GUIDE_HONESTY,
  RECORDING_GUIDE_LIFT_KINDS,
} from "@/domain/recording-guide/constants";
export type { RecordingGuideLiftKind } from "@/domain/recording-guide/constants";
export type {
  RecordingGuide,
  RecordingGuideAngleOption,
  RecordingGuideLookup,
  RecordingGuideVisual,
} from "@/domain/recording-guide/types";
export {
  DEADLIFT_RECORDING_GUIDE,
  SQUAT_RECORDING_GUIDE,
  BENCH_RECORDING_GUIDE,
  GENERAL_RECORDING_GUIDE,
} from "@/domain/recording-guide/catalog";
export {
  getRecordingGuide,
  recordingGuideForKind,
} from "@/domain/recording-guide/lookup";
