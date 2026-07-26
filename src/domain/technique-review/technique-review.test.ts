import { describe, expect, it } from "vitest";
import {
  TECHNIQUE_REVIEW_HONESTY,
  classifyTechniqueDisagreement,
  isExpertReviewedStatus,
  presentTechniqueAuthorship,
  resolveDisplayedTechniqueScore,
} from "@/domain/technique-review";

describe("technique expert review presentation", () => {
  it("never labels AI as expert-reviewed until decided", () => {
    expect(presentTechniqueAuthorship("none").isExpertReviewed).toBe(false);
    expect(presentTechniqueAuthorship("none").badge).toBe("AI analysis");
    expect(presentTechniqueAuthorship("pending_review").isExpertReviewed).toBe(
      false,
    );
    expect(presentTechniqueAuthorship("pending_review").detail).toMatch(
      /Not expert-reviewed/i,
    );
    expect(isExpertReviewedStatus("pending_review")).toBe(false);
  });

  it("marks confirm / correct / comment as expert-reviewed", () => {
    for (const s of ["confirmed", "corrected", "commented"] as const) {
      const p = presentTechniqueAuthorship(s);
      expect(p.isExpertReviewed).toBe(true);
      expect(p.badge).toBe("Expert reviewed");
      expect(p.showsAiAnalysis).toBe(true);
    }
  });

  it("classifies AI vs expert disagreement", () => {
    expect(
      classifyTechniqueDisagreement({
        decision: "confirm",
        aiOverallScore: 70,
        correctedOverallScore: null,
        aiSummary: "ok",
        correctedSummary: null,
        comment: null,
      }),
    ).toBe("none");

    expect(
      classifyTechniqueDisagreement({
        decision: "correct",
        aiOverallScore: 70,
        correctedOverallScore: 55,
        aiSummary: "ok",
        correctedSummary: null,
        comment: null,
      }),
    ).toBe("score");

    expect(
      classifyTechniqueDisagreement({
        decision: "correct",
        aiOverallScore: 70,
        correctedOverallScore: 55,
        aiSummary: "ok",
        correctedSummary: "Hips rise early",
        comment: "Watch bar path",
      }),
    ).toBe("mixed");

    expect(
      classifyTechniqueDisagreement({
        decision: "comment",
        aiOverallScore: 70,
        correctedOverallScore: null,
        aiSummary: null,
        correctedSummary: null,
        comment: "Solid lockout",
      }),
    ).toBe("qualitative");
  });

  it("prefers corrected score only when status is corrected", () => {
    expect(
      resolveDisplayedTechniqueScore({
        aiOverallScore: 70,
        expertReviewStatus: "corrected",
        correctedOverallScore: 62,
      }),
    ).toBe(62);
    expect(
      resolveDisplayedTechniqueScore({
        aiOverallScore: 70,
        expertReviewStatus: "confirmed",
        correctedOverallScore: 62,
      }),
    ).toBe(70);
  });

  it("documents offline model improvement without auto-retrain", () => {
    expect(TECHNIQUE_REVIEW_HONESTY.join(" ")).toMatch(/never auto-retrain/i);
    expect(TECHNIQUE_REVIEW_HONESTY.join(" ")).toMatch(/never labeled expert-reviewed/i);
  });
});
