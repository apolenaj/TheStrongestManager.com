import { describe, expect, it } from "vitest";
import {
  ON_SITE_EDUCATION_TRIGGER_LABEL,
  evaluateOnSiteEducationQuality,
  getEducationTopic,
  resolveEducationTopicId,
} from "@/domain/on-site-education";

describe("on-site education", () => {
  it("ships Learn why topics for RPE, volume, and technique confidence", () => {
    expect(ON_SITE_EDUCATION_TRIGGER_LABEL).toBe("Learn why");
    expect(evaluateOnSiteEducationQuality().passed).toBe(true);
    for (const id of ["rpe", "training_volume", "technique_confidence"] as const) {
      const topic = getEducationTopic(id);
      expect(topic?.title).toBeTruthy();
      expect(topic?.shortWhy.length).toBeGreaterThan(20);
      expect(topic?.inContextExplanation.length).toBeGreaterThan(40);
      expect(topic?.relatedLinks.some((l) => l.surface === "app")).toBe(true);
    }
  });

  it("resolves dashboard and progress metric keys", () => {
    expect(resolveEducationTopicId("volume")).toBe("training_volume");
    expect(resolveEducationTopicId("athlete")).toBe("overall");
    expect(resolveEducationTopicId("technique")).toBe("technique");
    expect(resolveEducationTopicId("rpe")).toBe("rpe");
    expect(resolveEducationTopicId("unknown_metric")).toBeNull();
  });
});
