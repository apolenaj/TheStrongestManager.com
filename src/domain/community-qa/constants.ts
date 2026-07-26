/**
 * Community Knowledge Q&A (Prompt 81).
 * Human answers only — AI may summarize, never impersonate humans.
 */

export const QA_CATEGORIES = [
  "technique",
  "programming",
  "powerlifting",
  "bodybuilding",
  "strongman",
  "nutrition",
  "recovery",
] as const;
export type QaCategory = (typeof QA_CATEGORIES)[number];

export const QA_CATEGORY_LABELS: Record<QaCategory, string> = {
  technique: "Technique",
  programming: "Programming",
  powerlifting: "Powerlifting",
  bodybuilding: "Bodybuilding",
  strongman: "Strongman",
  nutrition: "Nutrition",
  recovery: "Recovery",
};

export const QA_QUESTION_STATUSES = [
  "open",
  "closed",
  "hidden",
  "removed",
] as const;
export type QaQuestionStatus = (typeof QA_QUESTION_STATUSES)[number];

export const QA_ANSWER_STATUSES = [
  "published",
  "hidden",
  "removed",
] as const;
export type QaAnswerStatus = (typeof QA_ANSWER_STATUSES)[number];

/** Answer authorship — AI is never a valid answer author. */
export const QA_ANSWER_AUTHORSHIP = [
  "human_athlete",
  "human_coach",
] as const;
export type QaAnswerAuthorship = (typeof QA_ANSWER_AUTHORSHIP)[number];

export const QA_MODERATION_ACTIONS = [
  "flag",
  "hide",
  "restore",
  "remove",
  "note",
] as const;
export type QaModerationAction = (typeof QA_MODERATION_ACTIONS)[number];

export const QA_HONESTY = [
  "Answers are written by humans. AI may summarize a thread but never posts as a person.",
  "Expert badges appear only when the author has a verified coach credential at answer time.",
  "Votes and accepted answers reflect community judgment — not invented rankings.",
  "Nutrition and recovery answers are educational, not medical diagnoses.",
] as const;

export const QA_AI_SUMMARY_LABEL = "AI summary";
export const QA_AI_SUMMARY_DISCLAIMER =
  "Generated overview of the discussion — not a human answer and not medical advice.";

export function isQaCategory(value: string): value is QaCategory {
  return (QA_CATEGORIES as readonly string[]).includes(value);
}

export function isQaModerationAction(
  value: string,
): value is QaModerationAction {
  return (QA_MODERATION_ACTIONS as readonly string[]).includes(value);
}

export function parseQaCategory(
  value: string | null | undefined,
): QaCategory | null {
  if (value && isQaCategory(value)) return value;
  return null;
}
