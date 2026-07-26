import { describe, expect, it } from "vitest";
import {
  hrefForRecommendationCategory,
  NOT_ENOUGH_DATA,
  resolveScoreLevel,
} from "@/services/dashboard/types";

describe("dashboard honesty helpers", () => {
  it("exposes the required empty-score copy", () => {
    expect(NOT_ENOUGH_DATA).toBe("Not enough data yet.");
  });

  it("does not invent a score level without a value", () => {
    expect(resolveScoreLevel(null, "excellent")).toBeNull();
  });

  it("prefers stored score levels when present", () => {
    expect(resolveScoreLevel(90, "good")).toBe("good");
    expect(resolveScoreLevel(90, null)).toBe("excellent");
  });

  it("routes recommendation categories to deeper pages", () => {
    expect(hrefForRecommendationCategory("technique")).toBe("/app/technique");
    expect(hrefForRecommendationCategory("recovery")).toBe("/app/recovery");
    expect(hrefForRecommendationCategory("assessment")).toBe("/app/profile");
    expect(hrefForRecommendationCategory("training")).toBe("/app/today");
  });
});
