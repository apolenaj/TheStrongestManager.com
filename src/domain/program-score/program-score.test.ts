import { describe, expect, it } from "vitest";
import {
  extractProgramStructureSignals,
  type ProgramGraphForReview,
  type ProgramReviewAthleteContext,
} from "@/domain/program-review";
import {
  PROGRAM_SCORE_MIN_COMPONENTS_FOR_SCORE,
  PROGRAM_SCORE_WEIGHTS,
  computeProgramScore,
  displayableProgramScore,
} from "@/domain/program-score";

function sampleGraph(): ProgramGraphForReview {
  return {
    id: "prog1",
    name: "Strength Block",
    kind: "athlete",
    status: "active",
    description: null,
    progressionRules: [{ ruleKind: "add_load" }],
    weeks: [
      {
        weekNumber: 1,
        name: "W1",
        workoutId: null,
        workout: null,
        days: [
          {
            dayIndex: 1,
            name: "Squat",
            workoutId: "w1",
            workout: {
              name: "Squat",
              estimatedMinutes: 70,
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
                    equipment: '["barbell"]',
                  },
                },
                {
                  targetSets: 3,
                  targetReps: "8",
                  targetRpe: 7,
                  targetPercent: null,
                  targetLoadKg: null,
                  exercise: {
                    name: "RDL",
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
            dayIndex: 3,
            name: "Bench",
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
                    equipment: '["barbell"]',
                  },
                },
                {
                  targetSets: 3,
                  targetReps: "10",
                  targetRpe: 7,
                  targetPercent: null,
                  targetLoadKg: null,
                  exercise: {
                    name: "Row",
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
            dayIndex: 5,
            name: "Deadlift",
            workoutId: "w3",
            workout: {
              name: "DL",
              estimatedMinutes: 60,
              workoutExercises: [
                {
                  targetSets: 3,
                  targetReps: "3",
                  targetRpe: 8,
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

const richContext: ProgramReviewAthleteContext = {
  goalTitle: "300 kg deadlift",
  goalCategory: "strength",
  experienceLevel: "intermediate",
  daysPerWeek: 4,
  sessionLengthMinutes: 75,
  availableEquipment: ["barbell", "rack"],
  recoveryCapacity: "moderate",
  primaryDiscipline: "powerlifting",
};

describe("Training Program Score", () => {
  it("has weights that sum to 1.0", () => {
    const sum = Object.values(PROGRAM_SCORE_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(Math.abs(sum - 1)).toBeLessThan(0.001);
  });

  it("returns overallScore, subscores, confidence, reasoning, missingInformation", () => {
    const signals = extractProgramStructureSignals(sampleGraph());
    const result = computeProgramScore({ signals, context: richContext });

    expect(result.subscores).toHaveLength(7);
    expect(result.reasoning.formulaId).toBe("program.quality.weighted_v1");
    expect(result.reasoning.formulaDescription.length).toBeGreaterThan(20);
    expect(result.overallScore).not.toBeNull();
    expect(result.score).toBe(result.overallScore);
    expect(["low", "medium", "high"]).toContain(result.confidence);
    expect(result.explanation).toMatch(/Training Program Score/);
    expect(Array.isArray(result.missingInformation)).toBe(true);
  });

  it("does not invent overallScore when too few components are observed", () => {
    const emptySignals = extractProgramStructureSignals({
      id: "empty",
      name: "Empty",
      kind: "athlete",
      status: "draft",
      description: null,
      progressionRules: [],
      weeks: [],
    });
    const result = computeProgramScore({
      signals: emptySignals,
      context: {
        goalTitle: null,
        goalCategory: null,
        experienceLevel: null,
        daysPerWeek: null,
        sessionLengthMinutes: null,
        availableEquipment: [],
        recoveryCapacity: "unknown",
        primaryDiscipline: null,
      },
    });

    expect(result.overallScore).toBeNull();
    expect(result.confidence).toBe("none");
    expect(result.missingInformation.length).toBeGreaterThan(0);
    expect(displayableProgramScore(result)).toBeNull();
    const observed = result.components.filter((c) => c.status === "observed");
    expect(observed.length).toBeLessThan(PROGRAM_SCORE_MIN_COMPONENTS_FOR_SCORE);
  });

  it("marks volume suitability unavailable without experience/recovery context", () => {
    const signals = extractProgramStructureSignals(sampleGraph());
    const result = computeProgramScore({
      signals,
      context: {
        ...richContext,
        experienceLevel: null,
        recoveryCapacity: "unknown",
      },
    });
    const volume = result.components.find((c) => c.id === "volume_suitability");
    expect(volume?.status).toBe("unavailable");
    expect(volume?.unavailableReason).toMatch(/arbitrary/);
  });

  it("hides displayable score when confidence is low", () => {
    const signals = extractProgramStructureSignals(sampleGraph());
    // Strip progression rules and intensity to reduce components / confidence
    signals.progressionRuleKinds = [];
    signals.hasRpePrescription = false;
    signals.hasPercentPrescription = false;
    signals.hasLoadPrescription = false;
    for (const line of signals.exerciseLines) {
      line.targetRpe = null;
      line.targetPercent = null;
      line.targetLoadKg = null;
    }

    const result = computeProgramScore({
      signals,
      context: {
        ...richContext,
        recoveryCapacity: "unknown",
        experienceLevel: null,
        goalTitle: null,
      },
    });

    if (result.confidence === "low" || result.overallScore == null) {
      expect(displayableProgramScore(result)).toBeNull();
    }
  });
});
