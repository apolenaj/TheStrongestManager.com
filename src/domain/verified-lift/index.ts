export {
  LIFT_VERIFICATION_LEVELS,
  LIFT_REVIEW_STATUSES,
  LIFT_REVIEW_TARGETS,
  LIFT_KEYS,
  LIFT_KEY_LABELS,
  LEVEL_LABELS,
  REVIEW_STATUS_LABELS,
  VERIFIED_LIFT_HONESTY,
  isLiftVerificationLevel,
  isLiftReviewStatus,
  isLiftKey,
  parseLiftKey,
} from "@/domain/verified-lift/constants";
export type {
  LiftVerificationLevel,
  LiftReviewStatus,
  LiftReviewTarget,
  LiftKey,
} from "@/domain/verified-lift/constants";

export {
  parseLiftClaimMetadata,
  serializeLiftClaimMetadata,
  hasBasicLiftMetadata,
  hasCompetitionMetadata,
} from "@/domain/verified-lift/metadata";
export type { LiftClaimMetadata } from "@/domain/verified-lift/metadata";

export {
  hasValidLiftLoad,
  meetsSelfReportedCriteria,
  meetsVideoSubmittedCriteria,
  meetsCompetitionVerifiedCriteria,
  isOfficiallyVerified,
  displayLevelLabel,
  canAttachAsVideoSubmitted,
  canSubmitForManualReview,
  levelAfterApproval,
  elevateLevelFromEvidence,
} from "@/domain/verified-lift/criteria";
export type { LiftClaimEvidenceInput } from "@/domain/verified-lift/criteria";

export {
  LIFT_BADGE_CATALOG,
  resolveLiftVerificationBadges,
  primaryBadgeLabel,
  levelFromLegacyTier,
  reviewStatusFromString,
} from "@/domain/verified-lift/badges";
export type {
  LiftVerificationBadgeId,
  LiftVerificationBadge,
} from "@/domain/verified-lift/badges";
