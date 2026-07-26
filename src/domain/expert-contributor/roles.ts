/**
 * Role resolution — Expert Contributor never inferred from coach flags alone.
 */

import {
  CONTRIBUTOR_ROLE_LABELS,
  type ContributorRole,
  type ExpertVerificationStatus,
} from "@/domain/expert-contributor/constants";

export type ContributorRoleInput = {
  isCoach: boolean;
  /** Marketplace: at least one CoachCredential currently verified. */
  hasVerifiedCoachCredential: boolean;
  /** Explicit Expert Contributor grant status. */
  expertVerificationStatus: ExpertVerificationStatus | string;
};

/**
 * True only when staff set verificationStatus to verified.
 * Never true from isCoach or credentials alone.
 */
export function isVerifiedExpertContributor(
  status: string | null | undefined,
): boolean {
  return status === "verified";
}

/**
 * Resolve display roles. Expert Contributor is additive and never automatic.
 */
export function resolveContributorRoles(
  input: ContributorRoleInput,
): ContributorRole[] {
  const roles: ContributorRole[] = [];
  if (input.isCoach) {
    roles.push("coach");
    if (input.hasVerifiedCoachCredential) {
      roles.push("verified_coach");
    }
  }
  if (isVerifiedExpertContributor(input.expertVerificationStatus)) {
    roles.push("expert_contributor");
  }
  return roles;
}

export function contributorRoleLabels(roles: ContributorRole[]): string[] {
  return roles.map((r) => CONTRIBUTOR_ROLE_LABELS[r]);
}

/**
 * Q&A / content Expert badge — requires explicit Expert Contributor verification.
 * Verified Coach alone is insufficient (Prompt 82: never auto-label expert).
 */
export function shouldShowExpertContributorBadge(input: {
  expertVerificationStatus: string | null | undefined;
}): boolean {
  return isVerifiedExpertContributor(input.expertVerificationStatus);
}

export function canPublishExpertArticle(input: {
  expertVerificationStatus: string | null | undefined;
}): boolean {
  return isVerifiedExpertContributor(input.expertVerificationStatus);
}

export function canSubmitExpertApplication(input: {
  currentStatus: string | null | undefined;
}): boolean {
  const s = input.currentStatus ?? "none";
  return s === "none" || s === "rejected" || s === "revoked";
}
