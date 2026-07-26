export {
  REFERRAL_ENGINE_VERSION,
  REFERRAL_HONESTY,
  REFERRAL_ANTI_PYRAMID,
  REFERRAL_REWARD_KINDS,
  REFERRAL_REWARD_LABELS,
  REFERRAL_REWARD_DESCRIPTIONS,
  REFERRAL_BENEFICIARY_ROLES,
  REFERRAL_STATUSES,
  REFERRAL_STATUS_LABELS,
  REFERRAL_VOID_REASONS,
  REFERRAL_REWARD_STATUSES,
  REFERRAL_ABUSE_LIMITS,
  REFERRAL_DEFAULT_REWARDS,
  isReferralRewardKind,
  isReferralStatus,
  isReferralVoidReason,
  isReferralBeneficiaryRole,
  type ReferralRewardKind,
  type ReferralBeneficiaryRole,
  type ReferralStatus,
  type ReferralVoidReason,
  type ReferralRewardStatus,
} from "@/domain/referral-program/constants";

export {
  isValidUserReferralCode,
  generateUserReferralCode,
  buildReferralInvitePath,
} from "@/domain/referral-program/codes";

export {
  evaluateReferralAttribution,
  isDirectReferrerOnly,
  qualifiesAfterOnboarding,
  techniqueCreditsForRole,
  complimentaryDaysForReward,
  complimentaryPlanForReward,
  referralMonthKey,
  startOfUtcMonth,
  type ReferralAbuseContext,
  type ReferralAbuseVerdict,
} from "@/domain/referral-program/rules";
