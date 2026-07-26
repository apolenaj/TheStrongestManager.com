/**
 * Goal progress estimation types (Prompt 69).
 * Deliberately no probability percentage — validation does not exist yet.
 */

export type GoalTrajectoryStatus =
  | "on_track"
  | "possible_but_aggressive"
  | "below_target"
  | "target_reached"
  | "past_deadline"
  | "insufficient_data";

export type GoalLiftHint =
  | "back-squat"
  | "bench-press"
  | "deadlift"
  | "overhead-press"
  | null;

export type GoalDefinitionInput = {
  id: string;
  title: string;
  category: string;
  targetValue: number | null;
  targetUnit: string | null;
  targetDate: Date | null;
  status: string;
  /** Optional lift binding when known from title / metric. */
  liftSlug?: GoalLiftHint;
};

export type EstimateRangeKg = {
  low: number;
  high: number;
};

export type TrajectorySample = {
  at: Date;
  estimateKg: number;
};

export type GoalProgressInput = {
  goal: GoalDefinitionInput;
  /** Current conservative capacity range (e.g. from PR prediction). */
  currentEstimateKg: EstimateRangeKg | null;
  /** Historical estimates for slope — thin history → insufficient. */
  trajectorySamples: TrajectorySample[];
};

export type GoalProgressAssessment = {
  goalId: string;
  goalTitle: string;
  /** Resolved numeric target when known (kg preferred). */
  targetKg: number | null;
  targetDate: string | null;
  liftSlug: GoalLiftHint;
  status: GoalTrajectoryStatus;
  /** Athlete-facing status line — never a % probability. */
  statusLabel: string;
  currentEstimateKg: EstimateRangeKg | null;
  /** kg still needed vs current high / low (positive = still short). */
  requiredImprovementKg: { vsHigh: number; vsLow: number } | null;
  timeRemaining: {
    days: number;
    weeks: number;
    label: string;
  } | null;
  trajectory: {
    /** Observed kg/week from samples; null when untrustworthy. */
    kgPerWeek: number | null;
    /** Projected estimate at target date from current mid + slope. */
    projectedKgAtTarget: number | null;
    /** Required kg/week to hit target from current mid. */
    requiredKgPerWeek: number | null;
    sampleCount: number;
    summary: string;
  };
  /** Why this status — honest, non-probabilistic. */
  reasons: string[];
  /** Explicit honesty notice. */
  honestyNote: string;
};

export type GoalProgressResult = {
  assessments: GoalProgressAssessment[];
  generatedAt: string;
};
