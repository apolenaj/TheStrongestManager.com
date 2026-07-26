export {
  PERFORMANCE_ENGINE_VERSION,
  PERFORMANCE_HONESTY,
  PERFORMANCE_SURFACES,
  PERFORMANCE_BUDGETS,
  CWV_GOOD_THRESHOLDS,
} from "@/domain/performance-system/constants";
export type {
  PerformanceSurfaceId,
  CwVMetricId,
  PerformanceBudget,
  OptimizationPillar,
  OptimizationAction,
} from "@/domain/performance-system/constants";

export {
  PERFORMANCE_OPTIMIZATIONS,
  budgetForSurface,
  classifyMetric,
  matchSurfaceForPath,
  buildPerformanceSystemSnapshot,
  type PerformanceSystemSnapshot,
} from "@/domain/performance-system/budget";
