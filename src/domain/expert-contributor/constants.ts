/**
 * Expert Contributor System (Prompt 82).
 * Roles are explicit — never auto-label someone an expert.
 */

export const CONTRIBUTOR_ROLES = [
  "coach",
  "verified_coach",
  "expert_contributor",
] as const;
export type ContributorRole = (typeof CONTRIBUTOR_ROLES)[number];

export const CONTRIBUTOR_ROLE_LABELS: Record<ContributorRole, string> = {
  coach: "Coach",
  verified_coach: "Verified Coach",
  expert_contributor: "Expert Contributor",
};

export const EXPERT_VERIFICATION_STATUSES = [
  "none",
  "pending_review",
  "verified",
  "rejected",
  "revoked",
] as const;
export type ExpertVerificationStatus =
  (typeof EXPERT_VERIFICATION_STATUSES)[number];

export const EXPERT_ARTICLE_STATUSES = [
  "draft",
  "published",
  "archived",
] as const;
export type ExpertArticleStatus = (typeof EXPERT_ARTICLE_STATUSES)[number];

export const EXPERT_CONTRIBUTOR_HONESTY = [
  "Coach Mode and marketplace credentials do not automatically make someone an Expert Contributor.",
  "Expert Contributor is granted only after explicit staff verification.",
  "Verified Coach means at least one coach credential is verified — still not Expert Contributor by default.",
  "Expert-written articles attribute a real Person author in SEO only when the contributor is verified.",
] as const;

export const EXPERT_VERIFICATION_LABELS: Record<
  ExpertVerificationStatus,
  string
> = {
  none: "Not applied",
  pending_review: "Pending review",
  verified: "Verified Expert Contributor",
  rejected: "Rejected",
  revoked: "Revoked",
};

export function isExpertVerificationStatus(
  value: string,
): value is ExpertVerificationStatus {
  return (EXPERT_VERIFICATION_STATUSES as readonly string[]).includes(value);
}

export function isExpertArticleStatus(
  value: string,
): value is ExpertArticleStatus {
  return (EXPERT_ARTICLE_STATUSES as readonly string[]).includes(value);
}
