import {
  COACH_BRAIN_STUB_ADAPTER_ID,
} from "@/domain/coach-brain/constants";
import type {
  CoachBrainReasoningResult,
  CoachBrainRecommendation,
  CoachBrainRuleHit,
} from "@/domain/coach-brain/types";

/**
 * Reasoning adapter contract.
 * Stub composes rule hits into structured outputs.
 * Future LLM adapters must return the same shape — never expose CoT to clients.
 */
export type CoachBrainReasoningAdapter = {
  id: string;
  reason(input: {
    ruleHits: CoachBrainRuleHit[];
    maxRecommendations?: number;
  }): Promise<CoachBrainReasoningResult>;
};

function hitToRecommendation(hit: CoachBrainRuleHit): CoachBrainRecommendation {
  return {
    id: `coach_${hit.ruleId}`,
    recommendation: hit.draftRecommendation,
    reasoningSummary: hit.draftReasoning,
    supportingData: hit.supportingData,
    confidence: hit.confidence,
    risks: hit.risks,
    missingInformation: hit.missingInformation,
    recommendedAction: hit.recommendedAction,
    ruleId: hit.ruleId,
  };
}

/**
 * Deterministic stub — AI reasoning layer placeholder that stays structured.
 * Does not call external LLMs; does not invent medical claims.
 */
export const stubCoachBrainReasoningAdapter: CoachBrainReasoningAdapter = {
  id: COACH_BRAIN_STUB_ADAPTER_ID,
  async reason(input) {
    const max = input.maxRecommendations ?? 3;
    const recommendations = input.ruleHits
      .slice(0, max)
      .map(hitToRecommendation);

    return {
      adapterId: COACH_BRAIN_STUB_ADAPTER_ID,
      recommendations,
      adapterNotes: [
        "stub.deterministic: mapped rule hits to structured CoachBrainRecommendation objects.",
        "No external LLM call; no chain-of-thought stored.",
      ],
    };
  },
};

let activeAdapter: CoachBrainReasoningAdapter = stubCoachBrainReasoningAdapter;

export function getCoachBrainReasoningAdapter(): CoachBrainReasoningAdapter {
  return activeAdapter;
}

/** Tests / future LLM wiring — production stays on stub until a real adapter is ready. */
export function registerCoachBrainReasoningAdapter(
  adapter: CoachBrainReasoningAdapter,
): void {
  activeAdapter = adapter;
}

export function resetCoachBrainReasoningAdapterForTests(): void {
  activeAdapter = stubCoachBrainReasoningAdapter;
}
