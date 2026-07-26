import { describe, expect, it } from "vitest";
import {
  computeAthleteScores,
  displayableScore,
  isConfidenceDisplayable,
  type ScoringSnapshot,
} from "@/domain/scoring";
import { computeStrengthScore } from "@/domain/scoring/engines/strength";
import { computeTechniqueScore } from "@/domain/scoring/engines/technique";
import { computeRecoveryScore } from "@/domain/scoring/engines/recovery";
import { computeConsistencyScore } from "@/domain/scoring/engines/consistency";
import { computeProgrammingScore } from "@/domain/scoring/engines/programming";
import { computeOverallScore } from "@/domain/scoring/engines/overall";

const now = new Date("2026-07-20T12:00:00.000Z");

function emptySnapshot(
  overrides: Partial<ScoringSnapshot> = {},
): ScoringSnapshot {
  return {
    now,
    lifts: [],
    techniqueAnalyses: [],
    recoveryEntries: [],
    sessions: [],
    activeProgramId: null,
    activeProgramName: null,
    bodyweightKg: null,
    experienceLevel: null,
    primaryDiscipline: null,
    ...overrides,
  };
}

describe("scoring confidence display gate", () => {
  it("hides none and low confidence", () => {
    expect(isConfidenceDisplayable("none")).toBe(false);
    expect(isConfidenceDisplayable("low")).toBe(false);
    expect(isConfidenceDisplayable("medium")).toBe(true);
    expect(isConfidenceDisplayable("high")).toBe(true);
  });

  it("displayableScore returns null when confidence is too low", () => {
    const result = computeTechniqueScore(
      emptySnapshot({
        techniqueAnalyses: [
          {
            overallScore: 88,
            recordedAt: now,
            confidenceBasis: "observed",
          },
        ],
      }),
    );
    expect(result.score).toBe(88);
    expect(result.confidence).toBe("low");
    expect(displayableScore(result)).toBeNull();
  });
});

describe("strength score", () => {
  it("does not display a score from a single reported PR", () => {
    const result = computeStrengthScore(
      emptySnapshot({
        bodyweightKg: 80,
        experienceLevel: "intermediate",
        primaryDiscipline: "powerlifting",
        lifts: [
          {
            metricKey: "lift_squat",
            valueKg: 140,
            recordedAt: now,
            source: "reported",
          },
        ],
      }),
    );
    expect(displayableScore(result)).toBeNull();
    expect(result.missingInputs.length).toBeGreaterThan(0);
  });

  it("computes level-relative strength with observed lifts and bodyweight", () => {
    const result = computeStrengthScore(
      emptySnapshot({
        bodyweightKg: 80,
        experienceLevel: "beginner",
        primaryDiscipline: "powerlifting",
        lifts: [
          {
            metricKey: "lift_squat",
            valueKg: 80,
            reps: 1,
            recordedAt: now,
            source: "observed",
          },
          {
            metricKey: "lift_bench",
            valueKg: 56,
            reps: 1,
            recordedAt: now,
            source: "observed",
          },
        ],
      }),
    );
    expect(result.confidence).toBe("medium");
    expect(displayableScore(result)).not.toBeNull();
    expect(result.reasoning.formulaId).toBe("strength.context_trend.v2");
  });
});

describe("technique score", () => {
  it("requires two analyses for displayable confidence", () => {
    const one = computeTechniqueScore(
      emptySnapshot({
        techniqueAnalyses: [
          {
            overallScore: 80,
            recordedAt: now,
            confidenceBasis: "observed",
          },
        ],
      }),
    );
    expect(one.confidence).toBe("low");
    expect(displayableScore(one)).toBeNull();

    const two = computeTechniqueScore(
      emptySnapshot({
        techniqueAnalyses: [
          {
            overallScore: 80,
            recordedAt: now,
            confidenceBasis: "observed",
          },
          {
            overallScore: 90,
            recordedAt: now,
            confidenceBasis: "observed",
          },
        ],
      }),
    );
    expect(two.score).toBe(85);
    expect(two.confidence).toBe("medium");
    expect(displayableScore(two)).toBe(85);
  });
});

describe("recovery score", () => {
  it("averages readiness without remapping", () => {
    const day = 86400000;
    const result = computeRecoveryScore(
      emptySnapshot({
        recoveryEntries: [
          { readiness: 70, recordedAt: new Date(now.getTime() - 2 * day), source: "reported" },
          { readiness: 80, recordedAt: new Date(now.getTime() - day), source: "reported" },
          { readiness: 90, recordedAt: now, source: "reported" },
        ],
      }),
    );
    expect(result.score).toBe(80);
    expect(result.confidence).toBe("medium");
    expect(displayableScore(result)).toBe(80);
  });
});

describe("consistency and programming", () => {
  it("uses completion ratios without counting future planned sessions", () => {
    const day = 86400000;
    const consistency = computeConsistencyScore(
      emptySnapshot({
        sessions: [
          {
            status: "completed",
            scheduledAt: new Date(now.getTime() - 3 * day),
            completedAt: new Date(now.getTime() - 3 * day),
            startedAt: null,
            programId: null,
          },
          {
            status: "completed",
            scheduledAt: new Date(now.getTime() - 2 * day),
            completedAt: new Date(now.getTime() - 2 * day),
            startedAt: null,
            programId: null,
          },
          {
            status: "skipped",
            scheduledAt: new Date(now.getTime() - day),
            completedAt: null,
            startedAt: null,
            programId: null,
          },
          {
            status: "planned",
            scheduledAt: new Date(now.getTime() + day),
            completedAt: null,
            startedAt: null,
            programId: null,
          },
        ],
      }),
    );
    expect(consistency.score).toBe(67); // 2/3
    expect(consistency.confidence).toBe("medium");

    const programming = computeProgrammingScore(
      emptySnapshot({
        activeProgramId: "prog_1",
        activeProgramName: "Base hypertrophy",
        sessions: [
          {
            status: "completed",
            programId: "prog_1",
            scheduledAt: new Date(now.getTime() - 3 * day),
            completedAt: new Date(now.getTime() - 3 * day),
            startedAt: null,
          },
          {
            status: "completed",
            programId: "prog_1",
            scheduledAt: new Date(now.getTime() - 2 * day),
            completedAt: new Date(now.getTime() - 2 * day),
            startedAt: null,
          },
          {
            status: "skipped",
            programId: "prog_1",
            scheduledAt: new Date(now.getTime() - day),
            completedAt: null,
            startedAt: null,
          },
        ],
      }),
    );
    expect(programming.score).toBe(67);
    expect(programming.confidence).toBe("high");
  });
});

describe("overall athlete score", () => {
  it("omits low-confidence pillars instead of zero-filling", () => {
    const techniqueLow = computeTechniqueScore(
      emptySnapshot({
        techniqueAnalyses: [
          {
            overallScore: 90,
            recordedAt: now,
            confidenceBasis: "observed",
          },
        ],
      }),
    );
    const recovery = computeRecoveryScore(
      emptySnapshot({
        recoveryEntries: [
          { readiness: 70, recordedAt: now, source: "reported" },
          { readiness: 80, recordedAt: now, source: "reported" },
          { readiness: 90, recordedAt: now, source: "reported" },
        ],
      }),
    );
    const consistency = computeConsistencyScore(
      emptySnapshot({
        sessions: [
          {
            status: "completed",
            scheduledAt: now,
            completedAt: now,
            startedAt: null,
            programId: null,
          },
          {
            status: "completed",
            scheduledAt: now,
            completedAt: now,
            startedAt: null,
            programId: null,
          },
          {
            status: "completed",
            scheduledAt: now,
            completedAt: now,
            startedAt: null,
            programId: null,
          },
        ],
      }),
    );

    const overall = computeOverallScore(
      [techniqueLow, recovery, consistency],
      now,
    );
    // only recovery + consistency displayable → below 3 pillar minimum
    expect(overall.score).toBeNull();
    expect(overall.confidence).toBe("none");
    expect(displayableScore(overall)).toBeNull();
  });

  it("averages displayable pillars when enough exist", () => {
    const scores = computeAthleteScores(
      emptySnapshot({
        bodyweightKg: 100,
        experienceLevel: "beginner",
        primaryDiscipline: "powerlifting",
        lifts: [
          {
            metricKey: "lift_squat",
            valueKg: 100,
            reps: 1,
            recordedAt: now,
            source: "observed",
          },
          {
            metricKey: "lift_bench",
            valueKg: 70,
            reps: 1,
            recordedAt: now,
            source: "observed",
          },
        ],
        techniqueAnalyses: [
          {
            overallScore: 80,
            recordedAt: now,
            confidenceBasis: "observed",
          },
          {
            overallScore: 90,
            recordedAt: now,
            confidenceBasis: "observed",
          },
        ],
        recoveryEntries: [
          { readiness: 80, recordedAt: now, source: "reported" },
          { readiness: 80, recordedAt: now, source: "reported" },
          { readiness: 80, recordedAt: now, source: "reported" },
        ],
        sessions: [
          {
            status: "completed",
            scheduledAt: now,
            completedAt: now,
            startedAt: null,
            programId: null,
          },
          {
            status: "completed",
            scheduledAt: now,
            completedAt: now,
            startedAt: null,
            programId: null,
          },
          {
            status: "completed",
            scheduledAt: now,
            completedAt: now,
            startedAt: null,
            programId: null,
          },
        ],
      }),
    );

    expect(displayableScore(scores.strength)).not.toBeNull();
    expect(displayableScore(scores.technique)).toBe(85);
    expect(displayableScore(scores.recovery)).toBe(80);
    expect(displayableScore(scores.consistency)).toBe(100);
    expect(displayableScore(scores.overall)).not.toBeNull();
    expect(scores.overall.inputs.map((i) => i.key).sort()).toEqual(
      ["consistency", "recovery", "strength", "technique"].sort(),
    );
  });
});

describe("score result contract", () => {
  it("always returns score, confidence, inputs, missingInputs, explanation, timestamp", () => {
    const result = computeStrengthScore(emptySnapshot());
    expect(result).toMatchObject({
      scoreKey: "strength",
      score: null,
      confidence: "none",
    });
    expect(Array.isArray(result.inputs)).toBe(true);
    expect(Array.isArray(result.missingInputs)).toBe(true);
    expect(typeof result.explanation).toBe("string");
    expect(result.timestamp).toBeInstanceOf(Date);
    expect(result.reasoning.formulaDescription.length).toBeGreaterThan(0);
    expect(result.reasoning.minimumData.length).toBeGreaterThan(0);
  });
});
