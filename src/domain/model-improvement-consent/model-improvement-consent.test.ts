import { describe, expect, it } from "vitest";
import {
  CONSENT_KINDS,
  MODEL_IMPROVEMENT_CONSENT_HONESTY,
  getModelImprovementConsentSnapshot,
} from "@/domain/model-improvement-consent";

describe("model improvement consent", () => {
  it("defines three separate unbundled kinds", () => {
    expect(CONSENT_KINDS.map((k) => k.id)).toEqual([
      "service_use",
      "expert_review",
      "research_model_improvement",
    ]);
    expect(CONSENT_KINDS.every((k) => k.revocable)).toBe(true);
    const blob = MODEL_IMPROVEMENT_CONSENT_HONESTY.join(" ");
    expect(blob).toMatch(/never bundled|separate choices/i);
    expect(blob).toMatch(/Expert review consent does not enroll/i);
  });

  it("snapshots for admin", () => {
    const snap = getModelImprovementConsentSnapshot();
    expect(snap.docPath).toBe("docs/MODEL_IMPROVEMENT_CONSENT.md");
    expect(snap.kinds).toHaveLength(3);
  });
});
