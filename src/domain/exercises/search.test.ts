import { describe, expect, it } from "vitest";
import {
  exerciseFiltersToHref,
  filterExercises,
  findRelatedExercises,
  parseExerciseSearchParams,
  pickPopularExercises,
  type SearchableExercise,
} from "@/domain/exercises/search";

const catalog: SearchableExercise[] = [
  {
    slug: "back-squat",
    name: "Back Squat",
    description: "Barbell squat",
    aliases: ["Squat", "High-Bar Squat"],
    category: "compound",
    movementPattern: "squat",
    difficulty: "intermediate",
    equipment: ["barbell", "rack"],
    primaryMuscles: ["quads", "glutes"],
    secondaryMuscles: ["hamstrings"],
    sportRelevance: { powerlifting: "high", bodybuilding: "high" },
  },
  {
    slug: "bench-press",
    name: "Bench Press",
    description: "Horizontal press",
    aliases: ["Flat Bench"],
    category: "compound",
    movementPattern: "push",
    difficulty: "intermediate",
    equipment: ["barbell", "bench"],
    primaryMuscles: ["chest", "triceps"],
    secondaryMuscles: ["front_delts"],
    sportRelevance: { powerlifting: "high", bodybuilding: "high" },
  },
  {
    slug: "pull-up",
    name: "Pull-up",
    description: "Vertical pull",
    aliases: ["Overhand Pull-up"],
    category: "compound",
    movementPattern: "pull",
    difficulty: "intermediate",
    equipment: ["bodyweight"],
    primaryMuscles: ["lats", "upper_back"],
    secondaryMuscles: ["biceps"],
    sportRelevance: { bodybuilding: "high", powerlifting: "low" },
  },
  {
    slug: "leg-press",
    name: "Leg Press",
    description: "Machine squat pattern",
    aliases: [],
    category: "compound",
    movementPattern: "squat",
    difficulty: "beginner",
    equipment: ["machine"],
    primaryMuscles: ["quads", "glutes"],
    secondaryMuscles: [],
    sportRelevance: { bodybuilding: "high", powerlifting: "moderate" },
  },
];

describe("exercise search and discovery", () => {
  it("parses and serializes shareable URL filters", () => {
    const filters = parseExerciseSearchParams({
      q: "squat",
      sport: "powerlifting",
      equipment: "barbell",
      movement: "squat",
      muscle: "quads",
      difficulty: "intermediate",
      junk: "ignore",
    });
    expect(filters.q).toBe("squat");
    expect(filters.sport).toBe("powerlifting");
    expect(exerciseFiltersToHref(filters)).toBe(
      "/exercises?q=squat&sport=powerlifting&equipment=barbell&movement=squat&muscle=quads&difficulty=intermediate",
    );
  });

  it("searches by name, alias, muscle, movement, and equipment", () => {
    expect(filterExercises(catalog, {
      q: "high-bar",
      sport: "",
      equipment: "",
      movement: "",
      muscle: "",
      difficulty: "",
    }).map((e) => e.slug)).toEqual(["back-squat"]);

    expect(filterExercises(catalog, {
      q: "lats",
      sport: "",
      equipment: "",
      movement: "",
      muscle: "",
      difficulty: "",
    }).map((e) => e.slug)).toEqual(["pull-up"]);

    expect(filterExercises(catalog, {
      q: "machine",
      sport: "",
      equipment: "",
      movement: "",
      muscle: "",
      difficulty: "",
    }).map((e) => e.slug)).toEqual(["leg-press"]);
  });

  it("applies facet filters with AND semantics", () => {
    const results = filterExercises(catalog, {
      q: "",
      sport: "powerlifting",
      equipment: "barbell",
      movement: "squat",
      muscle: "quads",
      difficulty: "intermediate",
    });
    expect(results.map((e) => e.slug)).toEqual(["back-squat"]);
  });

  it("returns curated popular exercises and related matches", () => {
    const popular = pickPopularExercises(catalog, 3);
    expect(popular[0]?.slug).toBe("back-squat");
    expect(popular.map((e) => e.slug)).toContain("bench-press");

    const related = findRelatedExercises(catalog, catalog[0], { limit: 2 });
    expect(related.some((e) => e.slug === "leg-press")).toBe(true);
  });
});
