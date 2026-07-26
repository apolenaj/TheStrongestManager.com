import { describe, expect, it } from "vitest";
import {
  buildTechniqueReferralPath,
  buildTechniqueShareCard,
  defaultTechniqueShareFields,
  isValidReferralCode,
  pickStrongestAndImprove,
  TECHNIQUE_SHARE_CTA,
} from "@/domain/technique-share-cards";

describe("pickStrongestAndImprove", () => {
  it("picks high and low observed scores", () => {
    const { strongest, improve } = pickStrongestAndImprove([
      { label: "Lockout", score: 94, status: "observed" },
      { label: "Start Position", score: 72, status: "observed" },
      { label: "Bar path", score: 80, status: "observed" },
    ]);
    expect(strongest).toEqual({ label: "Lockout", score: 94 });
    expect(improve).toEqual({ label: "Start Position", score: 72 });
  });
});

describe("buildTechniqueShareCard", () => {
  it("matches the example layout with selected fields", () => {
    const card = buildTechniqueShareCard({
      analysisId: "a1",
      exerciseLabel: "Deadlift",
      overallScore: 86,
      strongest: { label: "Lockout", score: 94 },
      improve: { label: "Start Position", score: 72 },
      insightOptions: ["Keep the bar close off the floor."],
      selectedInsight: "Keep the bar close off the floor.",
      selectedFields: ["score", "strongest_improve", "insight"],
      formatId: "instagram_story",
      includeThumbnailInPng: false,
    });
    expect(card.eyebrow).toBe("DEADLIFT TECHNIQUE");
    expect(card.scoreLine).toBe("86/100");
    expect(card.strongestLine).toBe("Lockout 94");
    expect(card.improveLine).toBe("Start Position 72");
    expect(card.insightLine).toMatch(/bar close/i);
    expect(card.cta).toBe(TECHNIQUE_SHARE_CTA);
  });

  it("omits private fields when not selected", () => {
    const card = buildTechniqueShareCard({
      analysisId: "a1",
      exerciseLabel: "Deadlift",
      overallScore: 86,
      strongest: { label: "Lockout", score: 94 },
      improve: { label: "Start Position", score: 72 },
      insightOptions: ["Secret cue"],
      selectedInsight: "Secret cue",
      selectedFields: defaultTechniqueShareFields(),
      formatId: "instagram_post",
      includeThumbnailInPng: true,
    });
    expect(card.scoreLine).toBe("86/100");
    expect(card.insightLine).toBeNull();
    expect(card.includeThumbnailInPng).toBe(false);
    expect(card.includedFields).not.toContain("insight");
    expect(card.includedFields).not.toContain("thumbnail");
  });
});

describe("referral URLs", () => {
  it("builds referral-ready paths with UTMs", () => {
    const path = buildTechniqueReferralPath({ referralCode: "Ab12Cd34" });
    expect(path).toMatch(/^\/signup\?/);
    expect(path).toContain("ref=Ab12Cd34");
    expect(path).toContain("utm_source=technique_card");
    expect(path).toContain("utm_campaign=analyze_your_lift");
    expect(isValidReferralCode("Ab12Cd34")).toBe(true);
    expect(isValidReferralCode("bad")).toBe(false);
  });
});
