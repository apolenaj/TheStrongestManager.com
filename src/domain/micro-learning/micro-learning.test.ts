import { describe, expect, it } from "vitest";
import {
  emptyMicroLearningHistory,
  evaluateMicroLearningQuality,
  recordMicroLessonDismissed,
  recordMicroLessonShown,
  selectMicroLesson,
} from "@/domain/micro-learning";

describe("micro-learning", () => {
  it("ships prompt examples and anti-spam quality gates", () => {
    expect(evaluateMicroLearningQuality().passed).toBe(true);
  });

  it("personalizes toward powerlifting goals", () => {
    const lesson = selectMicroLesson({
      goalCategories: ["powerlifting", "performance"],
      primaryDiscipline: "powerlifting",
      history: emptyMicroLearningHistory(),
      now: new Date("2026-07-22T12:00:00Z"),
    });
    expect(lesson).not.toBeNull();
    expect(
      lesson!.goalTags.includes("powerlifting") ||
        lesson!.sportTags.includes("powerlifting") ||
        lesson!.id === "why-bracing-matters" ||
        lesson!.id === "powerlifting-specificity" ||
        lesson!.id === "what-rpe-means" ||
        lesson!.id === "when-to-deload",
    ).toBe(true);
  });

  it("does not spam after daily cap or dismiss cooldown", () => {
    const now = new Date("2026-07-22T12:00:00Z");
    let history = emptyMicroLearningHistory();
    const first = selectMicroLesson({
      goalCategories: ["strength"],
      primaryDiscipline: "general_strength",
      history,
      now,
    });
    expect(first).not.toBeNull();
    history = recordMicroLessonShown(history, first!.id, now);
    expect(
      selectMicroLesson({
        goalCategories: ["strength"],
        primaryDiscipline: "general_strength",
        history,
        now,
      }),
    ).toBeNull();

    history = recordMicroLessonDismissed(
      emptyMicroLearningHistory(),
      "what-rpe-means",
      now,
    );
    expect(
      selectMicroLesson({
        goalCategories: ["strength"],
        primaryDiscipline: null,
        history,
        now: new Date("2026-07-23T12:00:00Z"),
      }),
    ).toBeNull();
  });
});
