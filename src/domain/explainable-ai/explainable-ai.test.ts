import { describe, expect, it } from "vitest";
import {
  EXPLAINABLE_AI_EXAMPLE,
  EXPLAINABLE_AI_TRIGGER_LABEL,
  confidenceLabel,
  fromAdaptation,
  fromCoachBrainRecommendation,
  fromDailyBriefInsight,
  fromInsightProposal,
  reasonToSupportingData,
} from "@/domain/explainable-ai";

describe("explainable AI domain", () => {
  it("uses the product trigger label", () => {
    expect(EXPLAINABLE_AI_TRIGGER_LABEL).toBe("Why am I seeing this?");
  });

  it("maps medium confidence to Moderate (Prompt 141 example)", () => {
    expect(confidenceLabel("medium")).toBe("Moderate");
    expect(EXPLAINABLE_AI_EXAMPLE.recommendation).toMatch(/deadlift/i);
    expect(EXPLAINABLE_AI_EXAMPLE.view.supportingData).toEqual([
      "RPE increased.",
      "Rep speed trend decreased.",
    ]);
    expect(EXPLAINABLE_AI_EXAMPLE.view.missingInformation).toEqual([
      "Recovery data incomplete.",
    ]);
    expect(confidenceLabel(EXPLAINABLE_AI_EXAMPLE.view.confidence)).toBe(
      "Moderate",
    );
  });

  it("does not invent supporting or missing rows", () => {
    const view = fromCoachBrainRecommendation({
      reasoningSummary: "Hold load.",
      supportingData: [],
      confidence: "low",
      missingInformation: [],
    });
    expect(view.supportingData).toEqual([]);
    expect(view.missingInformation).toEqual([]);
    expect(view.summary).toBe("Hold load.");
  });

  it("maps coach brain supporting data and missing information", () => {
    const view = fromCoachBrainRecommendation({
      reasoningSummary: "Keep deadlift load unchanged.",
      supportingData: [
        { tool: "rules", key: "RPE", value: "increased" },
        { tool: "getRecentTraining", key: "Rep speed trend", value: "decreased" },
      ],
      confidence: "medium",
      missingInformation: ["Recovery data incomplete."],
    });
    expect(view.supportingData).toContain("RPE: increased");
    expect(view.missingInformation).toEqual(["Recovery data incomplete."]);
    expect(confidenceLabel(view.confidence)).toBe("Moderate");
  });

  it("splits prose reasons into supporting bullets", () => {
    expect(reasonToSupportingData("RPE increased. Rep speed trend decreased.")).toEqual([
      "RPE increased.",
      "Rep speed trend decreased.",
    ]);
    const adaptation = fromAdaptation({
      reason: "RPE increased. Rep speed trend decreased.",
      confidence: "medium",
      missingInformation: ["Recovery data incomplete."],
    });
    expect(adaptation.supportingData).toHaveLength(2);
    expect(adaptation.missingInformation[0]).toMatch(/Recovery/i);
  });

  it("maps insights evidence without fabricating missing rows", () => {
    const view = fromInsightProposal({
      evidence: [
        { domain: "training", statement: "Volume flat week over week." },
      ],
      confidence: "medium",
      nutritionPrescriptionNote: null,
    });
    expect(view.supportingData[0]).toMatch(/Volume flat/);
    expect(view.missingInformation).toEqual([]);
  });

  it("attaches brief-level missing signals to daily insights", () => {
    const view = fromDailyBriefInsight(
      { why: "RPE climbed on last session.", confidence: "medium" },
      ["Recovery check-in"],
    );
    expect(view.supportingData[0]).toMatch(/RPE/);
    expect(view.missingInformation).toEqual(["Recovery check-in"]);
  });
});
