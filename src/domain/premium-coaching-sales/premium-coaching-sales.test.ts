import { describe, expect, it } from "vitest";
import {
  PREMIUM_COACHING_HONESTY,
  PREMIUM_COACHING_NO_ACCEPTANCE_PROMISE,
  PREMIUM_COACHING_STAGES,
  canAdvancePremiumCoachingStage,
  nextPremiumCoachingStage,
  premiumCoachingFunnelSteps,
} from "@/domain/premium-coaching-sales";

describe("premium-coaching-sales", () => {
  it("defines Apply → Review → Consultation → Offer", () => {
    expect(PREMIUM_COACHING_STAGES).toEqual([
      "applied",
      "in_review",
      "consultation",
      "offer",
    ]);
    expect(premiumCoachingFunnelSteps()).toEqual(PREMIUM_COACHING_STAGES);
    expect(nextPremiumCoachingStage("applied")).toBe("in_review");
    expect(nextPremiumCoachingStage("in_review")).toBe("consultation");
    expect(nextPremiumCoachingStage("consultation")).toBe("offer");
    expect(nextPremiumCoachingStage("offer")).toBeNull();
    expect(canAdvancePremiumCoachingStage("applied", "offer")).toBe(false);
  });

  it("never promises acceptance in honesty copy", () => {
    expect(PREMIUM_COACHING_HONESTY.join(" ")).toMatch(/does not promise acceptance/i);
    expect(PREMIUM_COACHING_NO_ACCEPTANCE_PROMISE).toMatch(
      /does not mean you have been accepted/i,
    );
    expect(PREMIUM_COACHING_HONESTY.join(" ")).not.toMatch(
      /guaranteed acceptance|you are accepted/i,
    );
  });
});
