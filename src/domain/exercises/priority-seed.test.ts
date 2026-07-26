import { describe, expect, it } from "vitest";
import {
  PRIORITY_EXERCISE_RELATIONS,
  PRIORITY_EXERCISES,
} from "@/domain/exercises/priority-seed";

describe("priority exercise seed integrity", () => {
  it("includes the priority lifts plus horizontal-press substitutes", () => {
    expect(PRIORITY_EXERCISES).toHaveLength(14);
    expect(PRIORITY_EXERCISES.map((e) => e.slug).sort()).toEqual(
      [
        "back-squat",
        "barbell-row",
        "bench-press",
        "deadlift",
        "dumbbell-bench-press",
        "front-squat",
        "hip-thrust",
        "leg-press",
        "machine-chest-press",
        "overhead-press",
        "pull-up",
        "push-up",
        "romanian-deadlift",
        "stiff-leg-deadlift",
      ].sort(),
    );
  });

  it("uses unique slugs and required coaching sections", () => {
    const slugs = new Set<string>();
    for (const exercise of PRIORITY_EXERCISES) {
      expect(slugs.has(exercise.slug)).toBe(false);
      slugs.add(exercise.slug);
      expect(exercise.name.length).toBeGreaterThan(0);
      expect(exercise.setup.length).toBeGreaterThan(40);
      expect(exercise.execution.length).toBeGreaterThan(40);
      expect(exercise.commonMistakes.length).toBeGreaterThan(0);
      expect(exercise.safetyNotes.length).toBeGreaterThan(20);
    }
  });

  it("does not embed fake citation markers in coaching copy", () => {
    const citationLike = /\b(doi:|et al\.|pubmed|https?:\/\/doi\.org)/i;
    for (const exercise of PRIORITY_EXERCISES) {
      const blob = [
        exercise.executionOverview,
        exercise.setup,
        exercise.execution,
        exercise.programmingUses,
        exercise.safetyNotes,
      ].join("\n");
      expect(blob).not.toMatch(citationLike);
    }
  });

  it("only relates known priority slugs", () => {
    const slugs = new Set(PRIORITY_EXERCISES.map((e) => e.slug));
    for (const relation of PRIORITY_EXERCISE_RELATIONS) {
      expect(slugs.has(relation.fromSlug)).toBe(true);
      expect(slugs.has(relation.toSlug)).toBe(true);
    }
  });
});
