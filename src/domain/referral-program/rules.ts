/**
 * Pure referral rules: abuse, anti-pyramid, qualification (Prompt 135).
 */

import {
  REFERRAL_ABUSE_LIMITS,
  type ReferralRewardKind,
  type ReferralVoidReason,
} from "@/domain/referral-program/constants";

export type ReferralAbuseContext = {
  referrerUserId: string;
  referredUserId: string;
  referrerIsDemo: boolean;
  referredIsDemo: boolean;
  rewardedThisMonth: number;
  pendingAttributions: number;
};

export type ReferralAbuseVerdict =
  | { ok: true }
  | { ok: false; reason: ReferralVoidReason };

/**
 * Single-level only: referrer and referred must be different people.
 * Multi-hop recruiting is never rewarded (no upline).
 */
export function evaluateReferralAttribution(
  ctx: ReferralAbuseContext,
): ReferralAbuseVerdict {
  if (ctx.referrerUserId === ctx.referredUserId) {
    return { ok: false, reason: "self_referral" };
  }
  if (ctx.referrerIsDemo || ctx.referredIsDemo) {
    return { ok: false, reason: "demo_account" };
  }
  if (ctx.rewardedThisMonth >= REFERRAL_ABUSE_LIMITS.maxRewardedPerMonth) {
    return { ok: false, reason: "abuse_cap" };
  }
  if (ctx.pendingAttributions >= REFERRAL_ABUSE_LIMITS.maxPendingAttributions) {
    return { ok: false, reason: "abuse_cap" };
  }
  return { ok: true };
}

/**
 * Pyramid / MLM guard: only the direct referrer may be rewarded for a referral.
 * Calling with any "upline" id must fail closed.
 */
export function isDirectReferrerOnly(input: {
  beneficiaryUserId: string;
  referrerUserId: string;
  referredUserId: string;
  role: "referrer" | "referee";
}): boolean {
  if (input.role === "referrer") {
    return input.beneficiaryUserId === input.referrerUserId;
  }
  return input.beneficiaryUserId === input.referredUserId;
}

/** Qualification gate — never reward bare account creation. */
export function qualifiesAfterOnboarding(hasCompletedOnboarding: boolean): boolean {
  return hasCompletedOnboarding;
}

export function techniqueCreditsForRole(
  role: "referrer" | "referee",
): number {
  return role === "referrer"
    ? REFERRAL_ABUSE_LIMITS.referrerTechniqueCredits
    : REFERRAL_ABUSE_LIMITS.refereeTechniqueCredits;
}

export function complimentaryDaysForReward(
  kind: ReferralRewardKind,
): number | null {
  if (kind === "free_month") return REFERRAL_ABUSE_LIMITS.freeMonthDays;
  if (kind === "premium_features") {
    return REFERRAL_ABUSE_LIMITS.premiumFeaturesDays;
  }
  return null;
}

export function complimentaryPlanForReward(
  kind: ReferralRewardKind,
): "pro" | "performance" | null {
  if (kind === "free_month") return "pro";
  if (kind === "premium_features") return "performance";
  return null;
}

/** UTC YYYY-MM for monthly abuse windows. */
export function referralMonthKey(date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function startOfUtcMonth(date = new Date()): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0),
  );
}
