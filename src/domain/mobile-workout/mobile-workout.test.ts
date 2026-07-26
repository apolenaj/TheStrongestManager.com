import { describe, expect, it } from "vitest";
import {
  MOBILE_WORKOUT_HONESTY,
  MOBILE_WORKOUT_PRINCIPLES,
  buildMobileWorkoutSnapshot,
  initialFocusedExerciseIndex,
  nudgeLoad,
  nudgeReps,
  nudgeRpe,
} from "@/domain/mobile-workout";

describe("mobile workout experience", () => {
  it("covers the Prompt 183 priorities", () => {
    const ids = MOBILE_WORKOUT_PRINCIPLES.map((p) => p.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        "one_hand",
        "fast_set_logging",
        "large_controls",
        "minimal_typing",
        "auto_save",
        "rest_timer",
        "previous_performance",
        "no_dashboard_density",
      ]),
    );
  });

  it("nudges load/reps/rpe without typing", () => {
    expect(nudgeLoad("100", "kg", 1)).toBe("102.5");
    expect(nudgeLoad("100", "kg", -1)).toBe("97.5");
    expect(nudgeLoad("135", "lb", 1)).toBe("140");
    expect(nudgeReps("5", 1)).toBe("6");
    expect(nudgeReps("5", -1)).toBe("4");
    expect(nudgeRpe("7", 1)).toBe("7.5");
    expect(nudgeRpe("", 1)).toBe("0.5");
  });

  it("focuses the first incomplete exercise", () => {
    expect(
      initialFocusedExerciseIndex([
        { sets: [{ isComplete: true }, { isComplete: true }] },
        { sets: [{ isComplete: true }, { isComplete: false }] },
        { sets: [{ isComplete: false }] },
      ]),
    ).toBe(1);
    expect(
      initialFocusedExerciseIndex([
        { sets: [{ isComplete: true }] },
        { sets: [{ isComplete: true }] },
      ]),
    ).toBe(1);
  });

  it("snapshot links docs and honesty", () => {
    const snap = buildMobileWorkoutSnapshot("2026-07-22T00:00:00.000Z");
    expect(snap.docPath).toBe("docs/MOBILE_WORKOUT.md");
    expect(snap.playerRoute).toBe("/app/training/[sessionId]");
    expect(MOBILE_WORKOUT_HONESTY.join(" ")).toMatch(/one exercise/i);
  });
});
