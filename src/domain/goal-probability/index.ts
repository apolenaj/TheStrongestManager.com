export {
  GOAL_TRAJECTORY_LOOKBACK_DAYS,
  GOAL_MIN_TRAJECTORY_SAMPLES,
  GOAL_REASONABLE_KG_PER_WEEK,
} from "@/domain/goal-probability/constants";
export {
  inferLiftFromTitle,
  inferTargetDateFromTitle,
  inferTargetKgFromTitle,
  resolveTargetKg,
} from "@/domain/goal-probability/parse-goal";
export {
  assessGoalProgress,
  assessGoalsProgress,
  estimateKgPerWeek,
} from "@/domain/goal-probability/assess";
export type {
  EstimateRangeKg,
  GoalDefinitionInput,
  GoalLiftHint,
  GoalProgressAssessment,
  GoalProgressInput,
  GoalProgressResult,
  GoalTrajectoryStatus,
  TrajectorySample,
} from "@/domain/goal-probability/types";
