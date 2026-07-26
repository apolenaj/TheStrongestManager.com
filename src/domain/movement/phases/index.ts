export {
  LIFT_PHASE_ANALYSIS_VERSION,
  LIFT_PHASE_HONESTY,
  LIFT_PHASE_LABELS,
  DEADLIFT_PRIMARY_PHASES,
  DEADLIFT_PULL_SCOPE_PHASES,
  SQUAT_PHASE_CATALOG,
  BENCH_PHASE_CATALOG,
  KNEE_LEVEL_MIN_COVERAGE,
  isDeadliftPullScopePhase,
} from "@/domain/movement/phases/constants";
export {
  buildLiftPhaseAnalysis,
  type LiftPhaseAnalysisView,
  type LiftPhaseInsight,
} from "@/domain/movement/phases/insights";
