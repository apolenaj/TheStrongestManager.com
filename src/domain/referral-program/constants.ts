/**
 * Referral Program (Prompt 135).
 * Single-level invites only — never pyramid / multi-tier recruiting incentives.
 */

export const REFERRAL_ENGINE_VERSION = "referral_program.v1" as const;

export const REFERRAL_HONESTY = [
  "Every account gets one personal referral code. Sharing it is optional.",
  "Rewards unlock only after the invited person completes onboarding — not for bare signups.",
  "This is not a business opportunity, income claim, or multi-level marketing program.",
  "Abuse (self-referral, demo accounts, monthly caps) voids eligibility without inventing rewards.",
] as const;

/** Explicit anti-pyramid posture — product copy and domain rules. */
export const REFERRAL_ANTI_PYRAMID = [
  "Referrals are single-level only: you may invite someone; you never earn from their invites.",
  "There are no downlines, tiers, recruiting bonuses, or cascading commissions.",
  "Rewards are product credits or limited complimentary access — not cash or residual income.",
] as const;

/** Possible reward kinds (architecture catalog). */
export const REFERRAL_REWARD_KINDS = [
  "technique_credits",
  "free_month",
  "premium_features",
] as const;

export type ReferralRewardKind = (typeof REFERRAL_REWARD_KINDS)[number];

export const REFERRAL_REWARD_LABELS: Record<ReferralRewardKind, string> = {
  technique_credits: "Technique credits",
  free_month: "Complimentary month",
  premium_features: "Premium features (time-boxed)",
};

export const REFERRAL_REWARD_DESCRIPTIONS: Record<ReferralRewardKind, string> = {
  technique_credits:
    "Adds analysis credits to the technique wallet (ledgered; never invents balance).",
  free_month:
    "Time-boxed complimentary access to the Pro plan — not a cash payout or guaranteed renewal.",
  premium_features:
    "Short complimentary Performance-tier feature access — expires; not residual income.",
};

/** Who receives a grant on a qualified referral. */
export const REFERRAL_BENEFICIARY_ROLES = ["referrer", "referee"] as const;
export type ReferralBeneficiaryRole =
  (typeof REFERRAL_BENEFICIARY_ROLES)[number];

/** Attribution / lifecycle statuses. */
export const REFERRAL_STATUSES = [
  "attributed",
  "qualified",
  "rewarded",
  "voided",
] as const;

export type ReferralStatus = (typeof REFERRAL_STATUSES)[number];

export const REFERRAL_STATUS_LABELS: Record<ReferralStatus, string> = {
  attributed: "Waiting for onboarding",
  qualified: "Qualified",
  rewarded: "Rewards granted",
  voided: "Voided",
};

export const REFERRAL_VOID_REASONS = [
  "self_referral",
  "demo_account",
  "abuse_cap",
  "multi_level_blocked",
  "invalid_code",
  "already_attributed",
  "staff",
] as const;

export type ReferralVoidReason = (typeof REFERRAL_VOID_REASONS)[number];

export const REFERRAL_REWARD_STATUSES = [
  "pending",
  "granted",
  "revoked",
  "skipped",
] as const;

export type ReferralRewardStatus = (typeof REFERRAL_REWARD_STATUSES)[number];

/** Abuse / fairness caps — domain constants (not marketing). */
export const REFERRAL_ABUSE_LIMITS = {
  /** Max rewarded referrals per referrer per UTC calendar month. */
  maxRewardedPerMonth: 10,
  /** Max open (attributed) referrals waiting on qualification. */
  maxPendingAttributions: 25,
  /** Technique credits granted to referrer on qualify (default reward). */
  referrerTechniqueCredits: 3,
  /** Technique credits granted to referee on qualify (welcome). */
  refereeTechniqueCredits: 1,
  /** Complimentary Pro access length when free_month is selected. */
  freeMonthDays: 30,
  /** Complimentary Performance access when premium_features is selected. */
  premiumFeaturesDays: 14,
} as const;

/**
 * Active default rewards for a qualified direct referral.
 * Architecture supports all three kinds; defaults prefer credits (safest ledger).
 * free_month / premium_features remain grantable kinds for config/experiments.
 */
export const REFERRAL_DEFAULT_REWARDS: ReadonlyArray<{
  role: ReferralBeneficiaryRole;
  kind: ReferralRewardKind;
}> = [
  { role: "referrer", kind: "technique_credits" },
  { role: "referee", kind: "technique_credits" },
] as const;

export function isReferralRewardKind(
  value: string,
): value is ReferralRewardKind {
  return (REFERRAL_REWARD_KINDS as readonly string[]).includes(value);
}

export function isReferralStatus(value: string): value is ReferralStatus {
  return (REFERRAL_STATUSES as readonly string[]).includes(value);
}

export function isReferralVoidReason(
  value: string,
): value is ReferralVoidReason {
  return (REFERRAL_VOID_REASONS as readonly string[]).includes(value);
}

export function isReferralBeneficiaryRole(
  value: string,
): value is ReferralBeneficiaryRole {
  return (REFERRAL_BENEFICIARY_ROLES as readonly string[]).includes(value);
}
