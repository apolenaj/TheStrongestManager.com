/**
 * Verification badges — display only; “officially verified” is gated by criteria.
 */

import type { BadgeVariant } from "@/design-system/components/Badge";
import {
  type LiftReviewStatus,
  type LiftVerificationLevel,
} from "@/domain/verified-lift/constants";
import {
  isOfficiallyVerified,
  type LiftClaimEvidenceInput,
} from "@/domain/verified-lift/criteria";

export type LiftVerificationBadgeId =
  | "self_reported"
  | "video_submitted"
  | "pending_review"
  | "video_reviewed"
  | "competition_verified"
  | "officially_verified"
  | "rejected"
  | "revoked";

export type LiftVerificationBadge = {
  id: LiftVerificationBadgeId;
  label: string;
  variant: BadgeVariant;
  description: string;
};

export const LIFT_BADGE_CATALOG: Record<
  LiftVerificationBadgeId,
  Omit<LiftVerificationBadge, "id">
> = {
  self_reported: {
    label: "Self-reported",
    variant: "warning",
    description: "Athlete-logged claim — not platform-verified.",
  },
  video_submitted: {
    label: "Video submitted",
    variant: "info",
    description: "Video evidence attached — not officially verified.",
  },
  pending_review: {
    label: "Pending review",
    variant: "neutral",
    description: "Awaiting manual review of evidence and metadata.",
  },
  video_reviewed: {
    label: "Video reviewed",
    variant: "info",
    description: "Staff reviewed video evidence — still not competition-verified.",
  },
  competition_verified: {
    label: "Competition verified",
    variant: "accent",
    description: "Meet path approved — same as officially verified when criteria hold.",
  },
  officially_verified: {
    label: "Officially verified",
    variant: "success",
    description:
      "Competition metadata + evidence + approved review. Never shown otherwise.",
  },
  rejected: {
    label: "Rejected",
    variant: "danger",
    description: "Manual review rejected this claim.",
  },
  revoked: {
    label: "Revoked",
    variant: "danger",
    description: "Previously granted verification was revoked.",
  },
};

function badge(id: LiftVerificationBadgeId): LiftVerificationBadge {
  return { id, ...LIFT_BADGE_CATALOG[id] };
}

/**
 * Resolve display badges for a claim. Never includes officially_verified
 * unless isOfficiallyVerified is true.
 */
export function resolveLiftVerificationBadges(
  input: LiftClaimEvidenceInput,
): LiftVerificationBadge[] {
  const badges: LiftVerificationBadge[] = [];

  if (input.reviewStatus === "revoked") {
    badges.push(badge("revoked"));
    return badges;
  }
  if (input.reviewStatus === "rejected") {
    badges.push(badge("rejected"));
  }
  if (input.reviewStatus === "pending_review") {
    badges.push(badge("pending_review"));
  }

  if (isOfficiallyVerified(input)) {
    badges.push(badge("officially_verified"));
    badges.push(badge("competition_verified"));
    return badges;
  }

  if (input.level === "competition_verified") {
    // Level set without full criteria — never call officially verified.
    badges.push(badge("competition_verified"));
    return badges;
  }

  if (
    input.level === "video_submitted" &&
    input.reviewStatus === "approved"
  ) {
    badges.push(badge("video_reviewed"));
    return badges;
  }

  if (input.level === "video_submitted") {
    badges.push(badge("video_submitted"));
    return badges;
  }

  badges.push(badge("self_reported"));
  return badges;
}

export function primaryBadgeLabel(input: LiftClaimEvidenceInput): string {
  const list = resolveLiftVerificationBadges(input);
  return list[0]?.label ?? "Self-reported";
}

/** Map leaderboard-style tiers onto claim levels for shared UI. */
export function levelFromLegacyTier(
  tier: string,
): LiftVerificationLevel {
  if (tier === "competition_verified") return "competition_verified";
  if (tier === "video_verified" || tier === "video_submitted") {
    return "video_submitted";
  }
  return "self_reported";
}

export function reviewStatusFromString(
  value: string | null | undefined,
): LiftReviewStatus {
  if (
    value === "pending_review" ||
    value === "approved" ||
    value === "rejected" ||
    value === "revoked"
  ) {
    return value;
  }
  return "none";
}
