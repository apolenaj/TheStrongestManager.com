/**
 * Attempt planner — thin marketing wrapper over attempt-selector domain.
 * Sketches only; never a guarantee.
 */

import {
  ATTEMPT_HONESTY,
  selectAttempts,
  type AttemptLift,
  type AttemptRiskPreference,
  type AttemptSelection,
} from "@/domain/attempt-selector";

export type AttemptPlannerInput = {
  /** Planning day-max / e1RM ceiling in kg. */
  planningCeilingKg: number;
  risk: AttemptRiskPreference;
  lift?: AttemptLift;
  goalKg?: number | null;
};

export type AttemptPlannerResult = {
  selection: AttemptSelection;
  precisionNote: string;
};

export function computeAttemptPlan(
  input: AttemptPlannerInput,
): AttemptPlannerResult | null {
  if (!(input.planningCeilingKg > 0) || !Number.isFinite(input.planningCeilingKg)) {
    return null;
  }

  const mid = input.planningCeilingKg;
  const result = selectAttempts({
    lift: input.lift ?? "deadlift",
    risk: input.risk,
    confidence: "moderate",
    recentStrength: {
      lowKg: mid * 0.97,
      highKg: mid * 1.02,
      sourceLabel: "Calculator planning ceiling",
    },
    goalKg: input.goalKg ?? null,
    history: [],
  });

  if (!result.ok) return null;

  return {
    selection: result.selection,
    precisionNote: ATTEMPT_HONESTY,
  };
}

export function attemptPlannerRefusalReason(
  input: AttemptPlannerInput,
): string | null {
  if (!(input.planningCeilingKg > 0) || !Number.isFinite(input.planningCeilingKg)) {
    return "Enter a positive planning ceiling (recent day-max or honest e1RM) in kilograms.";
  }
  return null;
}
