import { describe, expect, it } from "vitest";
import {
  pickTechniqueCue,
  trainingDayIndexFromDate,
} from "@/domain/workout/helpers";

describe("workout helpers", () => {
  it("maps JS weekday to training day index Mon=1…Sun=7", () => {
    // 2026-07-20 is a Monday
    expect(trainingDayIndexFromDate(new Date(2026, 6, 20))).toBe(1);
    expect(trainingDayIndexFromDate(new Date(2026, 6, 26))).toBe(7);
  });

  it("prefers workout notes for technique cue", () => {
    expect(
      pickTechniqueCue({
        workoutNotes: "Brace hard before the pull.",
        setup: "Feet under hips.",
        execution: "Drive the floor.",
        commonMistakesJson: '["Round back"]',
      }),
    ).toBe("Brace hard before the pull.");
  });

  it("falls back to setup then mistakes without inventing", () => {
    expect(
      pickTechniqueCue({
        workoutNotes: null,
        setup: "Bar over mid-foot. Take air.",
        execution: null,
        commonMistakesJson: "[]",
      }),
    ).toBe("Bar over mid-foot.");

    expect(
      pickTechniqueCue({
        workoutNotes: null,
        setup: null,
        execution: null,
        commonMistakesJson: '["Hips shoot up"]',
      }),
    ).toBe("Hips shoot up");

    expect(
      pickTechniqueCue({
        workoutNotes: null,
        setup: null,
        execution: null,
        commonMistakesJson: "[]",
      }),
    ).toBeNull();
  });
});
