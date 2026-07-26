import { describe, expect, it } from "vitest";
import { PRIORITY_EXERCISES } from "@/domain/exercises/priority-seed";
import type { EquipmentKey } from "@/domain/exercises/types";
import {
  EXERCISE_SUBSTITUTION_HONESTY,
  substituteExercises,
  type ExerciseSubstitutionCandidate,
} from "@/domain/exercise-substitutions";

function catalogFromSeed(): ExerciseSubstitutionCandidate[] {
  return PRIORITY_EXERCISES.map((e) => ({
    slug: e.slug,
    name: e.name,
    description: e.description,
    movementPattern: e.movementPattern,
    category: e.category,
    difficulty: e.difficulty,
    equipment: e.equipment as EquipmentKey[],
    primaryMuscles: e.primaryMuscles,
    secondaryMuscles: e.secondaryMuscles,
    sportRelevance: e.sportRelevance as Record<string, string>,
    relatedSlugs: [
      ...e.regressions,
      ...e.progressions,
      ...e.variations,
    ]
      .map((r) => r.relatedSlug)
      .filter((s): s is string => Boolean(s)),
  }));
}

describe("exercise-substitutions", () => {
  it("states honesty about tradeoffs and non-invention", () => {
    expect(EXERCISE_SUBSTITUTION_HONESTY.join(" ")).toMatch(/tradeoffs/i);
    expect(EXERCISE_SUBSTITUTION_HONESTY.join(" ")).toMatch(/inventing lifts/i);
  });

  it("replaces unavailable bench press for chest strength with dumbbells", () => {
    const result = substituteExercises({
      unavailableSlug: "bench-press",
      goal: "chest_strength",
      equipment: ["dumbbell", "bench", "bodyweight", "machine"],
      catalog: catalogFromSeed(),
      context: { fatiguePressure: "normal", skillContext: "intermediate" },
    });

    expect(result.emptyReason).toBeNull();
    const slugs = result.recommendations.map((r) => r.slug);
    expect(slugs).toContain("dumbbell-bench-press");
    expect(slugs).toContain("machine-chest-press");
    expect(slugs).toContain("push-up");
    expect(slugs[0]).toBe("dumbbell-bench-press");

    const db = result.recommendations.find(
      (r) => r.slug === "dumbbell-bench-press",
    )!;
    expect(db.tradeoffs.some((t) => t.dimension === "goal")).toBe(true);
    expect(db.tradeoffs.some((t) => t.dimension === "movement_pattern")).toBe(
      true,
    );
    expect(db.tradeoffs.some((t) => t.dimension === "fatigue")).toBe(true);
    expect(db.tradeoffs.some((t) => t.dimension === "skill")).toBe(true);
    expect(db.reason.length).toBeGreaterThan(10);
  });

  it("prefers lower fatigue / skill options when pressure is elevated", () => {
    const elevated = substituteExercises({
      unavailableSlug: "bench-press",
      goal: "chest_strength",
      equipment: ["dumbbell", "bench", "bodyweight", "machine"],
      catalog: catalogFromSeed(),
      context: {
        fatiguePressure: "high",
        skillContext: "beginner",
        painSafeActive: false,
      },
    });
    const pushUp = elevated.recommendations.find((r) => r.slug === "push-up");
    const machine = elevated.recommendations.find(
      (r) => r.slug === "machine-chest-press",
    );
    expect(pushUp || machine).toBeTruthy();
    // High-fatigue context should not rank only high-skill compounds first
    expect(elevated.recommendations[0]?.skillDemand).not.toBe("high");
  });

  it("does not invent substitutes outside the catalog", () => {
    const result = substituteExercises({
      unavailableSlug: "not-a-real-lift",
      goal: "chest_strength",
      equipment: ["dumbbell"],
      catalog: catalogFromSeed(),
    });
    expect(result.recommendations).toEqual([]);
    expect(result.emptyReason).toMatch(/never invented/i);
  });
});
