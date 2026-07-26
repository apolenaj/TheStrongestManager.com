export {
  COACH_AI_ENGINE_VERSION,
  COACH_AI_SUGGESTION_KINDS,
  COACH_AI_SUGGESTION_KIND_LABELS,
  COACH_AI_SUGGESTION_STATUSES,
  COACH_AI_DECISIONS,
  COACH_AI_EVENT_TYPES,
  COACH_AI_CONFIDENCE,
  COACH_AI_COPILOT_HONESTY,
  isCoachAiDecision,
  isCoachAiSuggestionKind,
} from "@/domain/coach-ai/constants";
export type {
  CoachAiSuggestionKind,
  CoachAiSuggestionStatus,
  CoachAiDecision,
  CoachAiEventType,
  CoachAiConfidence,
} from "@/domain/coach-ai/constants";

export {
  draftCoachAiSuggestions,
  decisionEventType,
  statusAfterDecision,
} from "@/domain/coach-ai/draft";
export type {
  CoachAiAthleteSignals,
  CoachAiDraftSuggestion,
} from "@/domain/coach-ai/draft";
