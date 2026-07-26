/**
 * Creator Program (Prompt 137).
 * Future creator partnership architecture — capabilities unlock only after approval.
 * Do not imply partnership until approved.
 */

export const CREATOR_ENGINE_VERSION = "creator_program.v1" as const;

export const CREATOR_HONESTY = [
  "Applying to the Creator Program does not mean you are a partner.",
  "Creator capabilities unlock only after staff approval — never before.",
  "Until approved, this surface is an application status page, not a partnership badge.",
  "Referral revenue paths (personal referral / affiliate ledger) stay separate programs and still require their own rules.",
] as const;

export const CREATOR_NO_PARTNERSHIP_PROMISE =
  "Application received. This does not mean you are an approved creator partner." as const;

/** Catalog of future creator capabilities. */
export const CREATOR_CAPABILITIES = [
  "share_technique_score",
  "publish_programs",
  "share_content",
  "earn_referral_revenue",
] as const;

export type CreatorCapability = (typeof CREATOR_CAPABILITIES)[number];

export const CREATOR_CAPABILITY_LABELS: Record<CreatorCapability, string> = {
  share_technique_score: "Share technique score",
  publish_programs: "Publish programs",
  share_content: "Share content",
  earn_referral_revenue: "Earn referral revenue",
};

export const CREATOR_CAPABILITY_DESCRIPTIONS: Record<CreatorCapability, string> =
  {
    share_technique_score:
      "Publish technique score cards with creator branding once approved.",
    publish_programs:
      "Submit training programs for public/creator marketplace listing (future publish path).",
    share_content:
      "Share educational content through approved creator channels.",
    earn_referral_revenue:
      "Access creator-linked referral / affiliate revenue paths after approval — ledger estimates only, not guaranteed income.",
  };

/** Application lifecycle — partnership only when approved. */
export const CREATOR_PARTNERSHIP_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "suspended",
] as const;

export type CreatorPartnershipStatus =
  (typeof CREATOR_PARTNERSHIP_STATUSES)[number];

export const CREATOR_PARTNERSHIP_STATUS_LABELS: Record<
  CreatorPartnershipStatus,
  string
> = {
  pending: "Application pending",
  approved: "Approved partner",
  rejected: "Application rejected",
  suspended: "Partnership suspended",
};

/**
 * Public-facing role label by status.
 * Never call pending applicants "partners".
 */
export function creatorRoleLabel(status: CreatorPartnershipStatus): string {
  if (status === "approved") return "Creator partner";
  if (status === "suspended") return "Former creator partner (suspended)";
  if (status === "rejected") return "Applicant (not approved)";
  return "Creator applicant";
}

export function isCreatorCapability(
  value: string,
): value is CreatorCapability {
  return (CREATOR_CAPABILITIES as readonly string[]).includes(value);
}

export function isCreatorPartnershipStatus(
  value: string,
): value is CreatorPartnershipStatus {
  return (CREATOR_PARTNERSHIP_STATUSES as readonly string[]).includes(value);
}

/**
 * Capabilities are live only for approved partnerships.
 * Fail closed for pending / rejected / suspended.
 */
export function isCreatorPartnershipApproved(
  status: CreatorPartnershipStatus | string,
): boolean {
  return status === "approved";
}

export function resolveCreatorCapabilities(
  status: CreatorPartnershipStatus | string,
  requested: readonly CreatorCapability[] = CREATOR_CAPABILITIES,
): CreatorCapability[] {
  if (!isCreatorPartnershipApproved(status)) return [];
  return requested.filter((c) => isCreatorCapability(c));
}

export function hasCreatorCapability(
  status: CreatorPartnershipStatus | string,
  capability: CreatorCapability,
): boolean {
  return resolveCreatorCapabilities(status).includes(capability);
}

/** Deep links for unlocked capabilities (architecture wiring). */
export const CREATOR_CAPABILITY_HREFS: Record<CreatorCapability, string> = {
  share_technique_score: "/app/technique",
  publish_programs: "/app/program-marketplace",
  share_content: "/app/community-qa",
  earn_referral_revenue: "/app/referral",
};

export const CREATOR_CAPABILITY_SECONDARY_HREFS: Partial<
  Record<CreatorCapability, string>
> = {
  publish_programs: "/programs/marketplace",
  earn_referral_revenue: "/app/affiliate",
};
