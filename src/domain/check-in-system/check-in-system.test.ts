import { describe, expect, it } from "vitest";
import {
  CHECK_IN_CATEGORIES,
  CHECK_IN_FORBIDDEN_SENSITIVE_TOPICS,
  CHECK_IN_HONESTY,
  CHECK_IN_QUESTION_CATALOG,
  assembleCheckInAiSummary,
  containsForbiddenSensitiveHealthAsk,
  defaultEnabledQuestionKeys,
  isAllowlistedQuestionKey,
  sanitizeEnabledQuestionKeys,
} from "@/domain/check-in-system";

describe("check-in-system", () => {
  it("covers training, recovery, bodyweight, and goal progress", () => {
    expect(CHECK_IN_CATEGORIES).toEqual([
      "training",
      "recovery",
      "bodyweight",
      "goal_progress",
    ]);
    for (const cat of CHECK_IN_CATEGORIES) {
      expect(
        CHECK_IN_QUESTION_CATALOG.some((q) => q.category === cat),
      ).toBe(true);
    }
  });

  it("blocks excessive sensitive health topics and unknown keys", () => {
    expect(CHECK_IN_FORBIDDEN_SENSITIVE_TOPICS.length).toBeGreaterThan(5);
    expect(
      containsForbiddenSensitiveHealthAsk(
        "Please complete a depression questionnaire",
      ),
    ).toBe(true);
    expect(isAllowlistedQuestionKey("training_quality")).toBe(true);
    expect(isAllowlistedQuestionKey("suicidality_screen")).toBe(false);
    expect(
      sanitizeEnabledQuestionKeys([
        "training_quality",
        "suicidality_screen",
        "bodyweight_kg",
      ]),
    ).toEqual(["training_quality", "bodyweight_kg"]);
    expect(CHECK_IN_HONESTY.join(" ")).toMatch(/sensitive health/i);
  });

  it("assembles an AI summary labelled as AI summary", () => {
    const keys = defaultEnabledQuestionKeys();
    const questions = CHECK_IN_QUESTION_CATALOG.filter((q) =>
      keys.includes(q.key),
    );
    const summary = assembleCheckInAiSummary({
      weekKey: "2026-W30",
      questions,
      responses: {
        training_quality: 4,
        recovery_feel: 3,
        goal_on_track: true,
      },
    });
    expect(summary.sourceLabel).toBe("AI summary");
    expect(summary.isAiGenerated).toBe(true);
    expect(summary.body).toMatch(/AI summary/i);
    expect(summary.body).toMatch(/not a diagnosis/i);
    expect(summary.body).not.toMatch(/you have a tear|medical diagnosis:/i);
  });
});
