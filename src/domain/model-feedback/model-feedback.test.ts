import { describe, expect, it } from "vitest";
import {
  mayAutoRetrainFromFeedback,
  MODEL_FEEDBACK_HONESTY,
  verdictsAllowedForRole,
} from "@/domain/model-feedback";

describe("model feedback", () => {
  it("never allows auto-retrain from unreviewed feedback", () => {
    expect(mayAutoRetrainFromFeedback()).toBe(false);
    expect(MODEL_FEEDBACK_HONESTY.join(" ")).toMatch(/never automatically retrain/i);
  });

  it("separates athlete, coach, and expert verdicts", () => {
    expect(verdictsAllowedForRole("athlete")).toEqual([
      "helpful",
      "not_helpful",
    ]);
    expect(verdictsAllowedForRole("coach")).toEqual([
      "accepted",
      "modified",
      "rejected",
    ]);
    expect(verdictsAllowedForRole("expert")).toEqual([
      "confirmed",
      "corrected",
      "commented",
    ]);
  });
});
