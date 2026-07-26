/** Weekly Athlete Review — Prompt 55 */

export const WEEKLY_REVIEW_ENGINE_VERSION = "weekly_review.v1" as const;

export const WEEKLY_REVIEW_HONESTY = [
  "Weekly reviews summarize logged training — they do not invent missing weeks.",
  "Comparisons use this week vs the previous calendar week when both have signals.",
  "Keep / Change / Watch are coaching-practice suggestions, not medical advice.",
  "Historical reviews are stored so you can revisit prior weeks without reloading raw logs.",
] as const;

export const WEEKLY_REVIEW_SECTION_IDS = [
  "trainingCompleted",
  "programAdherence",
  "strengthChanges",
  "volume",
  "technique",
  "recovery",
  "bodyweight",
  "prs",
] as const;

export type WeeklyReviewSectionId = (typeof WEEKLY_REVIEW_SECTION_IDS)[number];
