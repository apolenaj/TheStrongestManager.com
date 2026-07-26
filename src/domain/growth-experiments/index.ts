export {
  GROWTH_EXPERIMENT_ENGINE_VERSION,
  GROWTH_EXPERIMENT_HONESTY,
  GROWTH_ALLOWLIST_SURFACES,
  GROWTH_DENYLIST_CATEGORIES,
  GROWTH_MIN_SAMPLE_PER_ARM,
  GROWTH_EXPERIMENTS,
  GROWTH_DENYLIST_EXAMPLES,
} from "@/domain/growth-experiments/constants";
export type {
  GrowthAllowlistSurface,
  GrowthDenylistCategory,
  GrowthExperimentArm,
  GrowthExperimentDefinition,
} from "@/domain/growth-experiments/constants";

export {
  getGrowthExperiment,
  listRunningGrowthExperiments,
  isAllowlistedSurface,
  isDenylistedCategory,
  assertExperimentSurfaceAllowed,
  assertCategoryNotDenied,
  assignmentBucket,
  assignArm,
  wilsonInterval,
  summarizeExperimentOutcomes,
} from "@/domain/growth-experiments/assign";
export type {
  ArmOutcomeStats,
  ExperimentOutcomeReport,
} from "@/domain/growth-experiments/assign";

export {
  buildGrowthExperimentSnapshot,
  type GrowthExperimentSnapshot,
} from "@/domain/growth-experiments/snapshot";
