/**
 * Coach AI Copilot (Prompt 85).
 * AI suggests; coach decides. Never auto-applies. Never presented as a coach decision until accepted/edited.
 */

export const COACH_AI_ENGINE_VERSION = "coach_ai_copilot.v1" as const;

export const COACH_AI_SUGGESTION_KINDS = [
  "week_summary",
  "performance_change",
  "program_adjustment_draft",
  "missing_data",
] as const;
export type CoachAiSuggestionKind = (typeof COACH_AI_SUGGESTION_KINDS)[number];

export const COACH_AI_SUGGESTION_KIND_LABELS: Record<
  CoachAiSuggestionKind,
  string
> = {
  week_summary: "Athlete week summary",
  performance_change: "Performance change",
  program_adjustment_draft: "Program adjustment draft",
  missing_data: "Missing data flag",
};

export const COACH_AI_SUGGESTION_STATUSES = [
  "pending",
  "accepted",
  "edited",
  "rejected",
  "withdrawn",
  "superseded",
] as const;
export type CoachAiSuggestionStatus =
  (typeof COACH_AI_SUGGESTION_STATUSES)[number];

export const COACH_AI_DECISIONS = ["accept", "edit", "reject"] as const;
export type CoachAiDecision = (typeof COACH_AI_DECISIONS)[number];

export const COACH_AI_EVENT_TYPES = [
  "proposed",
  "accepted",
  "edited",
  "rejected",
  "superseded",
] as const;
export type CoachAiEventType = (typeof COACH_AI_EVENT_TYPES)[number];

export const COACH_AI_CONFIDENCE = ["low", "medium", "high"] as const;
export type CoachAiConfidence = (typeof COACH_AI_CONFIDENCE)[number];

export const COACH_AI_COPILOT_HONESTY = [
  "AI Copilot drafts suggestions only — it never replaces the coach’s decision.",
  "Every suggestion shows the proposed change, why, and supporting data.",
  "Accept, edit, or reject is required before anything becomes a coach action.",
  "Authorship stays AI until the coach accepts or edits; then it is tracked as a coach decision.",
] as const;

export function isCoachAiDecision(value: string): value is CoachAiDecision {
  return (COACH_AI_DECISIONS as readonly string[]).includes(value);
}

export function isCoachAiSuggestionKind(
  value: string,
): value is CoachAiSuggestionKind {
  return (COACH_AI_SUGGESTION_KINDS as readonly string[]).includes(value);
}
