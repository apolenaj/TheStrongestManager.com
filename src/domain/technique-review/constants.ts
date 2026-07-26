/**
 * Optional expert review of technique analyses (Prompt 95).
 * AI analysis is never presented as expert-reviewed until an expert decides.
 */

export const TECHNIQUE_REVIEW_ENGINE_VERSION = "technique_review.v1" as const;

/** Cached on TechniqueAnalysis + review row status. */
export const TECHNIQUE_EXPERT_REVIEW_STATUSES = [
  "none",
  "pending_review",
  "confirmed",
  "corrected",
  "commented",
  "withdrawn",
] as const;
export type TechniqueExpertReviewStatus =
  (typeof TECHNIQUE_EXPERT_REVIEW_STATUSES)[number];

export const TECHNIQUE_EXPERT_DECISIONS = [
  "confirm",
  "correct",
  "comment",
] as const;
export type TechniqueExpertDecision =
  (typeof TECHNIQUE_EXPERT_DECISIONS)[number];

export const TECHNIQUE_EXPERT_DECISION_LABELS: Record<
  TechniqueExpertDecision,
  string
> = {
  confirm: "Confirm",
  correct: "Correct",
  comment: "Comment",
};

export const TECHNIQUE_DISAGREEMENT_KINDS = [
  "none",
  "score",
  "summary",
  "qualitative",
  "mixed",
] as const;
export type TechniqueDisagreementKind =
  (typeof TECHNIQUE_DISAGREEMENT_KINDS)[number];

export const TECHNIQUE_REVIEW_HONESTY = [
  "Technique reports always include AI analysis. Expert review is optional.",
  "AI analysis is never labeled expert-reviewed until a verified expert confirms, corrects, or comments.",
  "AI vs expert disagreement is stored for future offline model improvement — never auto-retrains production models.",
  "Requesting review shares this analysis with verified expert reviewers (consent required).",
] as const;

export function isTechniqueExpertReviewStatus(
  value: string,
): value is TechniqueExpertReviewStatus {
  return (TECHNIQUE_EXPERT_REVIEW_STATUSES as readonly string[]).includes(
    value,
  );
}

export function isTechniqueExpertDecision(
  value: string,
): value is TechniqueExpertDecision {
  return (TECHNIQUE_EXPERT_DECISIONS as readonly string[]).includes(value);
}
