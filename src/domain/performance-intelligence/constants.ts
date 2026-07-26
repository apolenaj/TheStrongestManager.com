export const PERFORMANCE_INTELLIGENCE_ENGINE_VERSION =
  "performance_intelligence.v1" as const;

/** Newest signal within this window counts as fresh (re-export from data-freshness). */
export {
  OVERALL_FRESH_HOURS as FRESHNESS_FRESH_HOURS,
  OVERALL_STALE_HOURS as FRESHNESS_STALE_HOURS,
} from "@/domain/data-freshness";

/** Bodyweight slope thresholds (kg/week) for direction labels. */
export const BW_TREND_FLAT_KG_PER_WEEK = 0.15;

export const PI_HONESTY = [
  "AthleteState is assembled by PerformanceIntelligenceService — UI must not recompute pillars independently.",
  "Missing inputs stay null with explicit missingDependencies — never invent scores, macros, or medical status.",
  "FatigueTrend is a load/recovery pressure heuristic, not an overreaching or injury diagnosis.",
  "GoalProgress is qualitative unless a measurable target exists on the goal record.",
  "Nutrition fields report connection availability only until a real sync adapter ships.",
  "Data freshness shows Technique / Recovery / Strength age from real timestamps — never invents ages.",
] as const;
