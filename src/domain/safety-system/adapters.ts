/**
 * Map Coach Brain structured recommendations into Safety System 2.0 inputs.
 */

import type { CoachBrainRecommendation } from "@/domain/coach-brain/types";
import type { RecommendationSafetyInput } from "@/domain/safety-system/types";

const AGGRESSIVE_RULE_HINT =
  /increase_(load|volume|intensity)|add_volume|push_intensity|aggressive|max_out/i;

/**
 * Heuristic: adaptation confirmations or load/volume increase rules count as
 * aggressive progression for pain-safe / Safety System gates.
 */
export function isCoachBrainAggressive(
  rec: CoachBrainRecommendation,
): boolean {
  if (rec.recommendedAction.kind === "confirm_adaptation") return true;
  return AGGRESSIVE_RULE_HINT.test(rec.ruleId);
}

export function coachBrainRecommendationToSafetyInput(
  rec: CoachBrainRecommendation,
  opts?: {
    painSafeModeActive?: boolean;
    sessionsPerWeek?: number | null;
    hardSetsPerLiftPerWeek?: number | null;
    weeklyHardSetsTotal?: number | null;
    proposedWeightLossKgPerWeek?: number | null;
  },
): RecommendationSafetyInput {
  const text = [
    rec.recommendation,
    rec.reasoningSummary,
    ...rec.risks,
    rec.recommendedAction.label,
  ].join("\n");

  return {
    id: rec.id,
    text,
    kind: rec.ruleId,
    sessionsPerWeek: opts?.sessionsPerWeek ?? null,
    hardSetsPerLiftPerWeek: opts?.hardSetsPerLiftPerWeek ?? null,
    weeklyHardSetsTotal: opts?.weeklyHardSetsTotal ?? null,
    proposedWeightLossKgPerWeek: opts?.proposedWeightLossKgPerWeek ?? null,
    painSafeModeActive: opts?.painSafeModeActive ?? false,
    aggressiveProgression: isCoachBrainAggressive(rec),
    ignoresReportedPain: false,
  };
}
