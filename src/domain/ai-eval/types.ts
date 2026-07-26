import type {
  CoachAiAthleteSignals,
  CoachAiDraftSuggestion,
  CoachAiSuggestionKind,
  CoachAiConfidence,
} from "@/domain/coach-ai";
import type {
  AiEvalDimension,
  AiEvalScenarioId,
} from "@/domain/ai-eval/constants";

export type AiEvalDimensionResult = {
  dimension: AiEvalDimension;
  passed: boolean;
  detail: string;
};

export type AiEvalScenarioResult = {
  scenarioId: AiEvalScenarioId;
  title: string;
  passed: boolean;
  drafts: CoachAiDraftSuggestion[];
  dimensions: AiEvalDimensionResult[];
};

export type AiEvalScenario = {
  id: AiEvalScenarioId;
  title: string;
  description: string;
  signals: CoachAiAthleteSignals;
  /** Kinds that must appear. */
  expectKinds: CoachAiSuggestionKind[];
  /** Kinds that must not appear. */
  forbidKinds?: CoachAiSuggestionKind[];
  /** Substring that must appear in some title or supportingData. */
  expectTextIncludes?: string[];
  /** Substring that must never appear in any draft text. */
  forbidTextIncludes?: string[];
  /** When set, at least one draft of this kind must have this confidence. */
  expectConfidence?: {
    kind: CoachAiSuggestionKind;
    confidence: CoachAiConfidence;
  };
  /** Require autoApply !== true on all proposedChangeJson. */
  requireNoAutoApply?: boolean;
};
