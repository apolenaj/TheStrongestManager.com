/**
 * Verification criteria — the single source of truth for “officially verified.”
 */

import {
  LEVEL_LABELS,
  type LiftReviewStatus,
  type LiftReviewTarget,
  type LiftVerificationLevel,
} from "@/domain/verified-lift/constants";
import {
  hasBasicLiftMetadata,
  hasCompetitionMetadata,
  type LiftClaimMetadata,
} from "@/domain/verified-lift/metadata";

export type LiftClaimEvidenceInput = {
  level: LiftVerificationLevel;
  reviewStatus: LiftReviewStatus;
  /** Linked technique analysis or storage key. */
  hasVideoEvidence: boolean;
  metadata: LiftClaimMetadata;
  loadKg: number;
  reps: number;
};

/** Valid positive load. */
export function hasValidLiftLoad(loadKg: number, reps: number): boolean {
  return (
    Number.isFinite(loadKg) &&
    loadKg > 0 &&
    Number.isFinite(reps) &&
    reps >= 1 &&
    reps <= 100
  );
}

export function meetsSelfReportedCriteria(
  input: Pick<LiftClaimEvidenceInput, "loadKg" | "reps">,
): boolean {
  return hasValidLiftLoad(input.loadKg, input.reps);
}

export function meetsVideoSubmittedCriteria(
  input: LiftClaimEvidenceInput,
): boolean {
  return (
    meetsSelfReportedCriteria(input) &&
    input.hasVideoEvidence &&
    hasBasicLiftMetadata(input.metadata)
  );
}

export function meetsCompetitionVerifiedCriteria(
  input: LiftClaimEvidenceInput,
): boolean {
  return (
    meetsVideoSubmittedCriteria(input) &&
    hasCompetitionMetadata(input.metadata) &&
    input.reviewStatus === "approved" &&
    input.level === "competition_verified"
  );
}

/**
 * Officially verified = competition path only, after manual approval + full criteria.
 * Video-submitted lifts are never “officially verified.”
 */
export function isOfficiallyVerified(input: LiftClaimEvidenceInput): boolean {
  return meetsCompetitionVerifiedCriteria(input);
}

/** Honest level label — never “Officially verified” unless criteria pass. */
export function displayLevelLabel(input: LiftClaimEvidenceInput): string {
  if (isOfficiallyVerified(input)) {
    return "Officially verified (competition)";
  }
  return LEVEL_LABELS[input.level];
}

export function canAttachAsVideoSubmitted(
  input: LiftClaimEvidenceInput,
): boolean {
  return (
    meetsSelfReportedCriteria(input) &&
    input.hasVideoEvidence &&
    hasBasicLiftMetadata(input.metadata) &&
    input.reviewStatus !== "revoked"
  );
}

export function canSubmitForManualReview(
  input: LiftClaimEvidenceInput,
  target: LiftReviewTarget,
): { ok: true } | { ok: false; reason: string } {
  if (input.reviewStatus === "pending_review") {
    return { ok: false, reason: "Already pending review." };
  }
  if (input.reviewStatus === "revoked") {
    return { ok: false, reason: "Claim was revoked." };
  }
  if (!meetsSelfReportedCriteria(input)) {
    return { ok: false, reason: "Load and reps must be valid." };
  }
  if (target === "video_submitted") {
    if (!input.hasVideoEvidence) {
      return { ok: false, reason: "Video evidence is required." };
    }
    if (!hasBasicLiftMetadata(input.metadata)) {
      return {
        ok: false,
        reason: "Performed date (metadata) is required for video review.",
      };
    }
    return { ok: true };
  }
  // competition_verified
  if (!input.hasVideoEvidence) {
    return {
      ok: false,
      reason: "Video or meet evidence is required for competition review.",
    };
  }
  if (!hasCompetitionMetadata(input.metadata)) {
    return {
      ok: false,
      reason: "Meet name and meet date are required for competition verification.",
    };
  }
  return { ok: true };
}

/**
 * After staff approve — resulting level. Competition only if criteria hold.
 */
export function levelAfterApproval(
  input: LiftClaimEvidenceInput,
  target: LiftReviewTarget,
): LiftVerificationLevel {
  if (target === "competition_verified") {
    const next: LiftClaimEvidenceInput = {
      ...input,
      reviewStatus: "approved",
      level: "competition_verified",
    };
    if (meetsCompetitionVerifiedCriteria(next)) {
      return "competition_verified";
    }
    // Fall back — do not grant competition_verified without criteria.
    if (meetsVideoSubmittedCriteria({ ...input, reviewStatus: "approved" })) {
      return "video_submitted";
    }
    return "self_reported";
  }
  if (meetsVideoSubmittedCriteria({ ...input, reviewStatus: "approved" })) {
    return "video_submitted";
  }
  return "self_reported";
}

export function elevateLevelFromEvidence(
  input: LiftClaimEvidenceInput,
): LiftVerificationLevel {
  if (input.level === "competition_verified" && isOfficiallyVerified(input)) {
    return "competition_verified";
  }
  if (canAttachAsVideoSubmitted(input)) {
    return "video_submitted";
  }
  if (meetsSelfReportedCriteria(input)) {
    return "self_reported";
  }
  return "self_reported";
}
