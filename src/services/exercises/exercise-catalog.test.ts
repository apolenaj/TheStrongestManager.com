import { afterAll, describe, expect, it } from "vitest";
import { seedPriorityExercises } from "@/domain/exercises/seed-runner";
import { prisma } from "@/lib/db";
import {
  getPublishedExerciseBySlug,
  listPublishedExercises,
} from "@/services/exercises/exercise-catalog";

describe("exercise catalog service", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("seeds priority exercises without evidence claims", async () => {
    const result = await seedPriorityExercises();
    expect(result.exercises).toBe(10);
    expect(result.evidenceClaims).toBe(0);

    const list = await listPublishedExercises();
    expect(list.length).toBeGreaterThanOrEqual(10);

    const squat = await getPublishedExerciseBySlug("back-squat");
    expect(squat).not.toBeNull();
    expect(squat?.contentKind).toBe("coaching_practice");
    expect(squat?.evidenceClaims).toEqual([]);
    expect(squat?.setup?.length).toBeGreaterThan(20);
    expect(squat?.commonMistakes.length).toBeGreaterThan(0);
    expect(squat?.coachingContextCards.length).toBeGreaterThan(0);
    expect(squat?.coachingContextCards[0]?.detail).toMatch(/not a lab|catalog/i);
    expect(squat?.usefulFor.length).toBeGreaterThan(0);
  });
});
