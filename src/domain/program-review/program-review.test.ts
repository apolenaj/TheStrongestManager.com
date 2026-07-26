import { describe, expect, it } from "vitest";
import {
  assembleProgramAiReview,
  extractProgramStructureSignals,
  type ProgramGraphForReview,
  type ProgramReviewAthleteContext,
} from "@/domain/program-review";

function sampleGraph(): ProgramGraphForReview {
  return {
    id: "prog1",
    name: "Strength Block",
    kind: "athlete",
    status: "active",
    description: "4-day strength",
    progressionRules: [{ ruleKind: "add_load" }],
    weeks: [
      {
        weekNumber: 1,
        name: "Week 1",
        workoutId: null,
        workout: null,
        days: [
          {
            dayIndex: 1,
            name: "Squat day",
            workoutId: "w1",
            workout: {
              name: "Squat",
              estimatedMinutes: 75,
              workoutExercises: [
                {
                  targetSets: 4,
                  targetReps: "5",
                  targetRpe: 8,
                  targetPercent: 80,
                  targetLoadKg: null,
                  exercise: {
                    name: "Back squat",
                    movementPattern: "squat",
                    category: "compound",
                    difficulty: "intermediate",
                    equipment: '["barbell","rack"]',
                  },
                },
                {
                  targetSets: 3,
                  targetReps: "8",
                  targetRpe: 7,
                  targetPercent: null,
                  targetLoadKg: null,
                  exercise: {
                    name: "Romanian deadlift",
                    movementPattern: "hinge",
                    category: "compound",
                    difficulty: "intermediate",
                    equipment: '["barbell"]',
                  },
                },
              ],
            },
          },
          {
            dayIndex: 2,
            name: "Bench day",
            workoutId: "w2",
            workout: {
              name: "Bench",
              estimatedMinutes: 70,
              workoutExercises: [
                {
                  targetSets: 4,
                  targetReps: "5",
                  targetRpe: 8,
                  targetPercent: 80,
                  targetLoadKg: null,
                  exercise: {
                    name: "Bench press",
                    movementPattern: "push",
                    category: "compound",
                    difficulty: "intermediate",
                    equipment: '["barbell","bench"]',
                  },
                },
                {
                  targetSets: 3,
                  targetReps: "10",
                  targetRpe: 7,
                  targetPercent: null,
                  targetLoadKg: null,
                  exercise: {
                    name: "Barbell row",
                    movementPattern: "pull",
                    category: "compound",
                    difficulty: "intermediate",
                    equipment: '["barbell"]',
                  },
                },
              ],
            },
          },
          {
            dayIndex: 4,
            name: "Deadlift day",
            workoutId: "w3",
            workout: {
              name: "Deadlift",
              estimatedMinutes: 70,
              workoutExercises: [
                {
                  targetSets: 3,
                  targetReps: "3",
                  targetRpe: 8.5,
                  targetPercent: 85,
                  targetLoadKg: null,
                  exercise: {
                    name: "Deadlift",
                    movementPattern: "hinge",
                    category: "compound",
                    difficulty: "intermediate",
                    equipment: '["barbell"]',
                  },
                },
              ],
            },
          },
        ],
      },
    ],
  };
}

const context: ProgramReviewAthleteContext = {
  goalTitle: "300 kg deadlift",
  goalCategory: "strength",
  experienceLevel: "intermediate",
  daysPerWeek: 4,
  sessionLengthMinutes: 75,
  availableEquipment: ["barbell", "rack", "bench"],
  recoveryCapacity: "moderate",
  primaryDiscipline: "powerlifting",
};

describe("AI program review", () => {
  it("extracts frequency, volume, and day loads", () => {
    const signals = extractProgramStructureSignals(sampleGraph());
    expect(signals.trainingDaysPerWeek).toBe(3);
    expect(signals.estimatedWeeklySets).toBeGreaterThan(0);
    expect(signals.hasRpePrescription).toBe(true);
    expect(signals.progressionRuleKinds).toContain("add_load");
  });

  it("outputs overview, strengths, issues, goal alignment, stress, improvements", () => {
    const signals = extractProgramStructureSignals(sampleGraph());
    const review = assembleProgramAiReview({ signals, context });

    expect(review.overview.length).toBeGreaterThan(20);
    expect(review.strengths.length).toBeGreaterThan(0);
    expect(review.potentialIssues.length).toBeGreaterThan(0);
    expect(review.goalAlignment.summary).toMatch(/300 kg deadlift/);
    expect(review.weeklyStressDistribution).toHaveLength(7);
    expect(review.recommendedImprovements.length).toBeGreaterThan(0);
    expect(review.dimensions).toHaveLength(9);
    expect(review.programScore.subscores).toHaveLength(7);
    expect(review.programScore.reasoning.formulaId).toBe(
      "program.quality.weighted_v1",
    );
    expect(review.overview).not.toMatch(/\bbad program\b/i);
    expect(review.potentialIssues.join(" ")).not.toMatch(/^bad$/i);
  });

  it("frames schedule mismatch as context — not a bad program", () => {
    const signals = extractProgramStructureSignals(sampleGraph());
    // Force more days than athlete has
    signals.trainingDaysPerWeek = 6;
    const review = assembleProgramAiReview({
      signals,
      context: { ...context, daysPerWeek: 3, recoveryCapacity: "limited" },
    });
    const freq = review.dimensions.find((d) => d.id === "frequency");
    expect(freq?.status).toBe("context_mismatch");
    expect(freq?.contextNote).toMatch(/not “bad”/i);
  });
});
