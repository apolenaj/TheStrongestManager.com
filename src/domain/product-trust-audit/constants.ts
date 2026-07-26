/**
 * Product Trust Audit (Prompt 182).
 * Every AI feature must answer provenance, confidence, certainty risk, challenge.
 */

export const PRODUCT_TRUST_AUDIT_ENGINE_VERSION =
  "product_trust_audit.v1" as const;

export const PRODUCT_TRUST_CERTAINTY_DISCLAIMER =
  "Coaching estimate from your logged data and product rules — not medical advice, diagnosis, or scientific certainty." as const;

export const PRODUCT_TRUST_AUDIT_HONESTY = [
  "This audit reviews athlete-facing AI surfaces for provenance, confidence, certainty risk, and challenge paths.",
  "Fail closed: if a surface cannot show where a result came from or could be read as medical/scientific certainty, it fails until fixed.",
  "Challenge paths include helpful/not helpful feedback, Accept/Modify/Decline, expert review, or correcting source logs — never silent auto-apply.",
] as const;

export const PRODUCT_TRUST_CRITERIA = [
  "provenance",
  "confidence",
  "certainty_risk",
  "challenge",
] as const;

export type ProductTrustCriterionId = (typeof PRODUCT_TRUST_CRITERIA)[number];

export const PRODUCT_TRUST_CRITERION_QUESTIONS: Record<
  ProductTrustCriterionId,
  string
> = {
  provenance: "Does the user understand where the result came from?",
  confidence: "Is confidence shown?",
  certainty_risk:
    "Could this be mistaken for medical or scientific certainty?",
  challenge: "Can the user challenge or correct it?",
};

export type ProductTrustStatus = "pass" | "partial" | "fail";

/** Lower is worse for rollups. certainty_risk pass = risk controlled. */
export const PRODUCT_TRUST_STATUS_RANK: Record<ProductTrustStatus, number> = {
  pass: 2,
  partial: 1,
  fail: 0,
};
