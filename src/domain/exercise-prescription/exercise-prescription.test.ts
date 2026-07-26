import { describe, expect, it } from "vitest";
import {
  EXERCISE_PRESCRIPTION_MIN_RULE_HITS,
  recommendExercises,
  type ExercisePrescriptionCandidate,
  type ExercisePrescriptionInputs,
} from "@/domain/exercise-prescription";

function candidates(): ExercisePrescriptionCandidate[] {
  return [
    {
      slug: "romanian-deadlift",
      name: "Romanian Deadlift",
      description: "Hinge accessory",
      movementPattern: "hinge",
      category: "compound",
      difficulty: "intermediate",
      equipment: ["barbell"],
      primaryMuscles: ["hamstrings", "glutes"],
      secondaryMuscles: ["erectors"],
      sportRelevance: { powerlifting: "high" },
      relatedSlugs: ["deadlift", "hip-thrust"],
    },
    {
      slug: "hip-thrust",
      name: "Hip Thrust",
      description: "Hip extension",
      movementPattern: "hinge",
      category: "accessory",
      difficulty: "beginner",
      equipment: ["barbell", "bench"],
      primaryMuscles: ["glutes"],
      secondaryMuscles: ["hamstrings"],
      sportRelevance: {},
      relatedSlugs: ["romanian-deadlift"],
    },
    {
      slug: "deadlift",
      name: "Deadlift",
      description: "Competition hinge",
      movementPattern: "hinge",
      category: "compound",
      difficulty: "intermediate",
      equipment: ["barbell"],
      primaryMuscles: ["hamstrings", "glutes", "erectors"],
      secondaryMuscles: ["quads"],
      sportRelevance: { powerlifting: "high" },
      relatedSlugs: ["romanian-deadlift"],
    },
    {
      slug: "bench-press",
      name: "Bench Press",
      description: "Press",
      movementPattern: "push",
      category: "compound",
      difficulty: "intermediate",
      equipment: ["barbell", "bench"],
      primaryMuscles: ["chest", "triceps"],
      secondaryMuscles: ["front_delts"],
      sportRelevance: { powerlifting: "high" },
      relatedSlugs: [],
    },
    {
      slug: "barbell-row",
      name: "Barbell Row",
      description: "Row",
      movementPattern: "pull",
      category: "compound",
      difficulty: "intermediate",
      equipment: ["barbell"],
      primaryMuscles: ["upper_back", "lats"],
      secondaryMuscles: ["biceps"],
      sportRelevance: {},
      relatedSlugs: [],
    },
    {
      slug: "leg-press",
      name: "Leg Press",
      description: "Machine squat pattern",
      movementPattern: "squat",
      category: "accessory",
      difficulty: "beginner",
      equipment: ["machine"],
      primaryMuscles: ["quads"],
      secondaryMuscles: ["glutes"],
      sportRelevance: {},
      relatedSlugs: [],
    },
  ];
}

const baseInputs: ExercisePrescriptionInputs = {
  goal: "powerlifting",
  sport: "powerlifting",
  weakPoint: "deadlift_lockout",
  equipment: ["barbell", "bench", "rack"],
  experience: "intermediate",
  techniqueLimitations: null,
  painFlags: false,
  currentProgramExerciseSlugs: ["back-squat", "bench-press"],
  currentProgramPatterns: ["squat", "push"],
};

describe("exercise prescription engine", () => {
  it("recommends RDL for deadlift lockout with multi-rule support", () => {
    const result = recommendExercises({
      inputs: baseInputs,
      candidates: candidates(),
    });

    expect(result.emptyReason).toBeNull();
    expect(result.recommendations.length).toBeGreaterThan(0);
    const rdl = result.recommendations.find(
      (r) => r.slug === "romanian-deadlift",
    );
    expect(rdl).toBeTruthy();
    expect(rdl!.reason).toMatch(/posterior-chain|hip-extension/i);
    expect(rdl!.primaryPurpose).toMatch(/posterior-chain|hip-extension/i);
    expect(rdl!.expectedFatigue).toBeTruthy();
    expect(rdl!.skillDemand).toBeTruthy();
    expect(rdl!.bestPlacementInWeek.length).toBeGreaterThan(10);
    expect(rdl!.alternatives.length).toBeGreaterThan(0);
    expect(rdl!.matchedRuleIds.length).toBeGreaterThanOrEqual(
      EXERCISE_PRESCRIPTION_MIN_RULE_HITS,
    );
  });

  it("does not prescribe from a single heuristic", () => {
    // Only equipment rule would fire for barbell items if weak point is none
    // and goal is other with empty program — need sparse inputs
    const result = recommendExercises({
      inputs: {
        goal: "other",
        sport: null,
        weakPoint: "none",
        equipment: ["barbell"],
        experience: null,
        techniqueLimitations: null,
        painFlags: false,
        currentProgramExerciseSlugs: [],
        currentProgramPatterns: [],
      },
      candidates: candidates(),
    });

    // Equipment-only hits should not yield recommendations (min 2 rules)
    for (const rec of result.recommendations) {
      expect(rec.matchedRuleIds.length).toBeGreaterThanOrEqual(
        EXERCISE_PRESCRIPTION_MIN_RULE_HITS,
      );
    }
  });

  it("refuses to invent exercises when catalog is empty", () => {
    const result = recommendExercises({
      inputs: baseInputs,
      candidates: [],
    });
    expect(result.recommendations).toHaveLength(0);
    expect(result.emptyReason).toMatch(/refusing to invent/i);
  });

  it("soft-gates when pain flags are present", () => {
    const result = recommendExercises({
      inputs: { ...baseInputs, painFlags: true },
      candidates: candidates(),
    });
    expect(result.disclaimers.some((d) => /caution|pain/i.test(d))).toBe(true);
    expect(result.matchedRules.some((r) => r.id === "pain-prefer-controlled")).toBe(
      true,
    );
  });
});
