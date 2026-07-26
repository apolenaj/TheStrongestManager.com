/**
 * Verified Lift System (Prompt 77).
 * Levels are honest labels — never call a lift “officially verified” unless criteria are met.
 */

export const LIFT_VERIFICATION_LEVELS = [
  "self_reported",
  "video_submitted",
  "competition_verified",
] as const;
export type LiftVerificationLevel = (typeof LIFT_VERIFICATION_LEVELS)[number];

export const LIFT_REVIEW_STATUSES = [
  "none",
  "pending_review",
  "approved",
  "rejected",
  "revoked",
] as const;
export type LiftReviewStatus = (typeof LIFT_REVIEW_STATUSES)[number];

/** What the athlete is asking reviewers to evaluate. */
export const LIFT_REVIEW_TARGETS = [
  "video_submitted",
  "competition_verified",
] as const;
export type LiftReviewTarget = (typeof LIFT_REVIEW_TARGETS)[number];

export const LIFT_KEYS = [
  "squat",
  "bench",
  "deadlift",
  "overhead_press",
  "other",
] as const;
export type LiftKey = (typeof LIFT_KEYS)[number];

export const LIFT_KEY_LABELS: Record<LiftKey, string> = {
  squat: "Squat",
  bench: "Bench press",
  deadlift: "Deadlift",
  overhead_press: "Overhead press",
  other: "Other lift",
};

export const LEVEL_LABELS: Record<LiftVerificationLevel, string> = {
  self_reported: "Self-reported",
  video_submitted: "Video submitted",
  competition_verified: "Competition verified",
};

export const REVIEW_STATUS_LABELS: Record<LiftReviewStatus, string> = {
  none: "Not in review",
  pending_review: "Pending review",
  approved: "Review approved",
  rejected: "Review rejected",
  revoked: "Revoked",
};

export const VERIFIED_LIFT_HONESTY = [
  "Self-reported lifts are athlete claims — not platform verification.",
  "Video submitted means evidence was attached; it is not “officially verified.”",
  "Competition verified / officially verified requires meet metadata, evidence, and an approved manual review.",
  "Never chase unsafe loads for a badge.",
] as const;

export function isLiftVerificationLevel(
  value: string,
): value is LiftVerificationLevel {
  return (LIFT_VERIFICATION_LEVELS as readonly string[]).includes(value);
}

export function isLiftReviewStatus(value: string): value is LiftReviewStatus {
  return (LIFT_REVIEW_STATUSES as readonly string[]).includes(value);
}

export function isLiftKey(value: string): value is LiftKey {
  return (LIFT_KEYS as readonly string[]).includes(value);
}

export function parseLiftKey(value: string | null | undefined): LiftKey {
  if (value && isLiftKey(value)) return value;
  return "other";
}
