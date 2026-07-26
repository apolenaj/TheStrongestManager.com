import { describe, expect, it } from "vitest";
import {
  EXERCISE_COMPARISON_DIMENSIONS,
  EXERCISE_COMPARISON_HONESTY,
  EXERCISE_COMPARISON_SEO_PAIRS,
  buildExerciseComparison,
  buildExerciseComparisonSnapshot,
  buildExerciseSharePath,
  findSeoPairForExercises,
  getExerciseComparisonProfile,
} from "@/domain/exercise-comparison";
import { PRIORITY_EXERCISES } from "@/domain/exercises/priority-seed";

describe("exercise comparison engine", () => {
  it("defines Prompt 166 dimensions and SEO honesty", () => {
    expect(EXERCISE_COMPARISON_DIMENSIONS.map((d) => d.id)).toEqual([
      "purpose",
      "technique",
      "muscles",
      "fatigue",
      "programming",
      "whoShouldChoose",
    ]);
    expect(EXERCISE_COMPARISON_HONESTY.join(" ")).toMatch(/qualitative/i);
    expect(EXERCISE_COMPARISON_HONESTY.join(" ")).toMatch(/SEO|allowlisted/i);
  });

  it("includes Romanian vs stiff-leg as the flagship SEO pair", () => {
    expect(PRIORITY_EXERCISES.some((e) => e.slug === "stiff-leg-deadlift")).toBe(
      true,
    );
    expect(getExerciseComparisonProfile("romanian-deadlift")).toBeDefined();
    expect(getExerciseComparisonProfile("stiff-leg-deadlift")).toBeDefined();

    const pair = findSeoPairForExercises(
      "romanian-deadlift",
      "stiff-leg-deadlift",
    );
    expect(pair?.slug).toBe("romanian-deadlift-vs-stiff-leg-deadlift");
    expect(
      EXERCISE_COMPARISON_SEO_PAIRS.map((p) => p.slug),
    ).toContain("romanian-deadlift-vs-stiff-leg-deadlift");
  });

  it("builds a side-by-side view and prefer SEO share paths for allowlisted pairs", () => {
    const view = buildExerciseComparison([
      "romanian-deadlift",
      "stiff-leg-deadlift",
    ]);
    expect(view.exercises).toHaveLength(2);
    expect(view.rows).toHaveLength(6);
    expect(view.rows.map((r) => r.dimensionId)).toContain("whoShouldChoose");
    expect(view.sharePath).toBe(
      "/compare/exercises/romanian-deadlift-vs-stiff-leg-deadlift",
    );
    expect(view.seoPair).not.toBeNull();

    expect(
      buildExerciseSharePath(["back-squat", "deadlift"]).startsWith(
        "/compare/exercises?",
      ),
    ).toBe(true);

    const snap = buildExerciseComparisonSnapshot("2026-07-22T00:00:00.000Z");
    expect(snap.seoPairs.length).toBeGreaterThanOrEqual(3);
    expect(snap.profiledExercises).toBeGreaterThanOrEqual(5);
  });
});
