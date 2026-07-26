export {
  MOVEMENT_DISCLAIMERS,
  MOVEMENT_MAX_POSE_FRAMES,
  MOVEMENT_MVP_EXERCISE_SLUGS,
  MOVEMENT_PIPELINE_VERSION,
} from "@/domain/movement/constants";
export { assessDeadliftCameraSuitability } from "@/domain/movement/camera-suitability";
export { buildDeadliftFixtureFrames } from "@/domain/movement/fixture";
export { runMovementPipeline } from "@/domain/movement/pipeline";
export { analyzeDeadliftTechnique } from "@/domain/movement/deadlift/score";
export {
  buildLiftPhaseAnalysis,
  LIFT_PHASE_ANALYSIS_VERSION,
  LIFT_PHASE_LABELS,
} from "@/domain/movement/phases";
export type {
  LiftPhaseAnalysisView,
  LiftPhaseInsight,
} from "@/domain/movement/phases";
export {
  analyzeBarPath,
  BAR_PATH_ENGINE_VERSION,
} from "@/domain/movement/bar-path";
export type { BarPathAnalysis } from "@/domain/movement/bar-path";
export type {
  CameraSuitability,
  LandmarkName,
  LandmarkPoint,
  MovementDiagnostics,
  MovementPhaseSegment,
  MovementReport,
  ObservableMetric,
  PoseFrame,
  TechniqueHeuristic,
} from "@/domain/movement/types";
export type {
  DeadliftComponentResult,
  DeadliftTechniqueAssessment,
} from "@/domain/movement/deadlift/score/types";
