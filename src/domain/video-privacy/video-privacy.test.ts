import { describe, expect, it } from "vitest";
import {
  VIDEO_PRIVACY_DEFAULTS,
  VIDEO_PRIVACY_HONESTY,
  VIDEO_PRIVACY_OPTIONS,
  buildVideoPrivacyNote,
  parseVideoPrivacyFromFlags,
  videoAllowsAnonymousModelImprovement,
  videoAllowsExpertReview,
} from "@/domain/video-privacy";

describe("video privacy controls", () => {
  it("defaults optional sharing off and requires analysis consent", () => {
    expect(VIDEO_PRIVACY_DEFAULTS.allowExpertReview).toBe(false);
    expect(VIDEO_PRIVACY_DEFAULTS.allowAnonymousModelImprovement).toBe(false);
    expect(
      VIDEO_PRIVACY_OPTIONS.every((o) => o.defaultOn === false),
    ).toBe(true);

    expect(
      parseVideoPrivacyFromFlags({
        analysisConsent: false,
        allowExpertReview: true,
        allowAnonymousModelImprovement: true,
      }).ok,
    ).toBe(false);

    const ok = parseVideoPrivacyFromFlags({
      analysisConsent: true,
      allowExpertReview: false,
      allowAnonymousModelImprovement: false,
    });
    expect(ok.ok).toBe(true);
    if (!ok.ok) return;
    expect(ok.choices.allowExpertReview).toBe(false);
    expect(ok.choices.allowAnonymousModelImprovement).toBe(false);
  });

  it("never hides consent in honesty copy", () => {
    expect(VIDEO_PRIVACY_HONESTY.join(" ")).toMatch(/no hidden/i);
    expect(VIDEO_PRIVACY_HONESTY.join(" ")).toMatch(/private by default/i);
    const note = buildVideoPrivacyNote({
      analysisOnly: true,
      allowExpertReview: false,
      allowAnonymousModelImprovement: false,
    });
    expect(note).toMatch(/Expert review: off/);
    expect(note).toMatch(/Anonymous model improvement: off/);
  });

  it("gates expert and model-improvement helpers on explicit fields", () => {
    expect(
      videoAllowsExpertReview({
        allowExpertReview: false,
        expertReviewConsentAt: null,
      }),
    ).toBe(false);
    expect(
      videoAllowsExpertReview({
        allowExpertReview: true,
        expertReviewConsentAt: null,
      }),
    ).toBe(true);
    expect(
      videoAllowsAnonymousModelImprovement({
        modelImprovementConsentAt: null,
      }),
    ).toBe(false);
    expect(
      videoAllowsAnonymousModelImprovement({
        modelImprovementConsentAt: new Date(),
      }),
    ).toBe(true);
  });
});
