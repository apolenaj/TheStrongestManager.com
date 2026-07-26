import { describe, expect, it } from "vitest";
import {
  REFERRAL_ANTI_PYRAMID,
  REFERRAL_DEFAULT_REWARDS,
  REFERRAL_REWARD_KINDS,
  buildReferralInvitePath,
  complimentaryPlanForReward,
  evaluateReferralAttribution,
  generateUserReferralCode,
  isDirectReferrerOnly,
  isValidUserReferralCode,
  qualifiesAfterOnboarding,
  techniqueCreditsForRole,
} from "@/domain/referral-program";

describe("referral program domain", () => {
  it("catalog includes technique credits, free month, and premium features", () => {
    expect(REFERRAL_REWARD_KINDS).toEqual([
      "technique_credits",
      "free_month",
      "premium_features",
    ]);
    expect(complimentaryPlanForReward("free_month")).toBe("pro");
    expect(complimentaryPlanForReward("premium_features")).toBe("performance");
  });

  it("defaults to single-level credit rewards (not cash or multi-tier)", () => {
    expect(REFERRAL_DEFAULT_REWARDS.every((r) => r.kind === "technique_credits")).toBe(
      true,
    );
    expect(REFERRAL_ANTI_PYRAMID.some((l) => /single-level/i.test(l))).toBe(true);
    expect(REFERRAL_ANTI_PYRAMID.some((l) => /downlines/i.test(l))).toBe(true);
  });

  it("generates and validates codes", () => {
    const code = generateUserReferralCode(8);
    expect(isValidUserReferralCode(code)).toBe(true);
    expect(isValidUserReferralCode("bad")).toBe(false);
    expect(buildReferralInvitePath(code)).toContain(`ref=${code}`);
    expect(buildReferralInvitePath(code)).toContain("utm_source=referral_program");
  });

  it("blocks self-referral, demo, and abuse caps", () => {
    expect(
      evaluateReferralAttribution({
        referrerUserId: "a",
        referredUserId: "a",
        referrerIsDemo: false,
        referredIsDemo: false,
        rewardedThisMonth: 0,
        pendingAttributions: 0,
      }).ok,
    ).toBe(false);

    expect(
      evaluateReferralAttribution({
        referrerUserId: "a",
        referredUserId: "b",
        referrerIsDemo: true,
        referredIsDemo: false,
        rewardedThisMonth: 0,
        pendingAttributions: 0,
      }),
    ).toMatchObject({ ok: false, reason: "demo_account" });

    expect(
      evaluateReferralAttribution({
        referrerUserId: "a",
        referredUserId: "b",
        referrerIsDemo: false,
        referredIsDemo: false,
        rewardedThisMonth: 10,
        pendingAttributions: 0,
      }),
    ).toMatchObject({ ok: false, reason: "abuse_cap" });
  });

  it("never rewards uplines (anti-pyramid)", () => {
    expect(
      isDirectReferrerOnly({
        beneficiaryUserId: "upline",
        referrerUserId: "referrer",
        referredUserId: "referee",
        role: "referrer",
      }),
    ).toBe(false);
    expect(
      isDirectReferrerOnly({
        beneficiaryUserId: "referrer",
        referrerUserId: "referrer",
        referredUserId: "referee",
        role: "referrer",
      }),
    ).toBe(true);
  });

  it("qualifies only after onboarding", () => {
    expect(qualifiesAfterOnboarding(false)).toBe(false);
    expect(qualifiesAfterOnboarding(true)).toBe(true);
    expect(techniqueCreditsForRole("referrer")).toBeGreaterThan(
      techniqueCreditsForRole("referee"),
    );
  });
});
