/**
 * Re-exports used by the goal-probability service so imports stay stable.
 * Prefer importing domain modules directly from callers outside services.
 */
export { assessGoalsProgress } from "@/domain/goal-probability";
export {
  GOAL_TRAJECTORY_LOOKBACK_DAYS,
  inferLiftFromTitle,
} from "@/domain/goal-probability";
export type {
  GoalProgressInput,
  GoalProgressResult,
  TrajectorySample,
} from "@/domain/goal-probability";
export {
  estimateSetE1rmKg,
  inferTrainingPhase,
  mapTrendDirection,
  predictOneRmRange,
} from "@/domain/pr-prediction";
export type { WorkingSetInput } from "@/domain/pr-prediction";
