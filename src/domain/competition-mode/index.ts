export {
  COMP_WEIGHT_CUT_SAFETY_WARNINGS,
  COMP_STRONGMAN_COMING_LATER,
  COMP_HEAVY_RPE_MIN,
} from "@/domain/competition-mode/constants";
export { assembleCompetitionMode } from "@/domain/competition-mode/assemble";
export { buildAttemptPlans } from "@/domain/competition-mode/attempts";
export {
  buildTaperGuidance,
  daysUntil,
  formatCountdown,
  resolveCompetitionPhase,
  phaseLabel,
} from "@/domain/competition-mode/phases";
export { buildWeightCutGuidance } from "@/domain/competition-mode/weight-cut";
export type {
  AttemptPlan,
  CompetitionDefinition,
  CompetitionModeSignals,
  CompetitionModeView,
  CompetitionSport,
  CompetitionTargetLifts,
  LiftEstimateKg,
  WeightCutGuidance,
  WeightCutStance,
} from "@/domain/competition-mode/types";
