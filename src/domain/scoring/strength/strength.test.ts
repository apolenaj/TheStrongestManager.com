import { describe, expect, it } from "vitest";
import {
  analyzeStrength,
  displayableScore,
  estimate1rmKg,
  resolveLiftEffort,
} from "@/domain/scoring";
import type { ScoringSnapshot } from "@/domain/scoring/types";

const now = new Date("2026-07-20T12:00:00.000Z");
const day = 86400000;

function snapshot(overrides: Partial<ScoringSnapshot> = {}): ScoringSnapshot {
  return {
    now,
    lifts: [],
    techniqueAnalyses: [],
    recoveryEntries: [],
    sessions: [],
    activeProgramId: null,
    activeProgramName: null,
    bodyweightKg: null,
    experienceLevel: "intermediate",
    primaryDiscipline: "powerlifting",
    ...overrides,
  };
}

describe("Epley estimated 1RM", () => {
  it("estimates from multi-rep work and refuses invalid reps", () => {
    expect(estimate1rmKg(100, 5)).toBeCloseTo(100 * (1 + 5 / 30), 5);
    expect(estimate1rmKg(100, 1)).toBeNull();
    expect(estimate1rmKg(100, 13)).toBeNull();
  });

  it("labels multi-rep efforts Estimated, never Verified", () => {
    const effort = resolveLiftEffort({
      valueKg: 100,
      reps: 5,
      source: "observed",
      recordedAt: now,
    });
    expect(effort?.label).toBe("Estimated");
    expect(effort?.isEstimated1rm).toBe(true);
  });

  it("labels observed single loads Verified", () => {
    const effort = resolveLiftEffort({
      valueKg: 150,
      reps: 1,
      source: "observed",
      recordedAt: now,
    });
    expect(effort?.label).toBe("Verified");
    expect(effort?.isEstimated1rm).toBe(false);
  });

  it("labels reported loads Reported even at 1 rep", () => {
    const effort = resolveLiftEffort({
      valueKg: 150,
      reps: 1,
      source: "reported",
      recordedAt: now,
    });
    expect(effort?.label).toBe("Reported");
  });
});

describe("strength score context bands", () => {
  it("does not invent a score from a single reported PR", () => {
    const assessment = analyzeStrength(
      snapshot({
        bodyweightKg: 80,
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
    expect(displayableScore(assessment.result)).toBeNull();
    expect(assessment.lifts[0]?.reportedBest?.kg).toBe(140);
    expect(assessment.lifts[0]?.verifiedBest).toBeNull();
  });

  it("scores beginners against beginner references, not competition standards", () => {
    const beginner = analyzeStrength(
      snapshot({
        experienceLevel: "beginner",
        bodyweightKg: 80,
        lifts: [
          {
            metricKey: "lift_squat",
            valueKg: 80, // 1.0× BW = beginner squat reference
            reps: 1,
            recordedAt: now,
            source: "observed",
          },
          {
            metricKey: "lift_bench",
            valueKg: 56, // 0.7× BW = beginner bench reference
            reps: 1,
            recordedAt: now,
            source: "observed",
          },
        ],
      }),
    );

    const competition = analyzeStrength(
      snapshot({
        experienceLevel: "elite",
        bodyweightKg: 80,
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

    expect(beginner.experienceLabel).toBe("Beginner");
    expect(competition.experienceLabel).toBe("Competition athlete");
    expect(displayableScore(beginner.result)).toBeGreaterThan(
      displayableScore(competition.result) ?? 0,
    );
    expect(beginner.lifts.find((l) => l.metricKey === "lift_squat")?.contextScore).toBe(
      100,
    );
  });

  it("keeps Estimated 1RM separate from Verified best", () => {
    const assessment = analyzeStrength(
      snapshot({
        bodyweightKg: 90,
        lifts: [
          {
            metricKey: "lift_squat",
            valueKg: 140,
            reps: 1,
            recordedAt: now,
            source: "observed",
          },
          {
            metricKey: "lift_squat",
            valueKg: 110,
            reps: 5,
            recordedAt: now,
            source: "observed",
          },
          {
            metricKey: "lift_deadlift",
            valueKg: 180,
            reps: 1,
            recordedAt: now,
            source: "observed",
          },
        ],
      }),
    );

    const squat = assessment.lifts.find((l) => l.metricKey === "lift_squat");
    expect(squat?.verifiedBest?.kg).toBe(140);
    expect(squat?.verifiedBest?.label).toBe("Verified");
    expect(squat?.estimated1rm?.label).toBe("Estimated");
    expect(squat?.estimated1rm?.kg).toBeCloseTo(110 * (1 + 5 / 30), 5);
    expect(squat?.estimated1rm?.kg).not.toBe(squat?.verifiedBest?.kg);
  });

  it("computes trend across recent vs prior windows", () => {
    const assessment = analyzeStrength(
      snapshot({
        bodyweightKg: 80,
        lifts: [
          {
            metricKey: "lift_squat",
            valueKg: 100,
            reps: 1,
            recordedAt: new Date(now.getTime() - 40 * day),
            source: "observed",
          },
          {
            metricKey: "lift_squat",
            valueKg: 110,
            reps: 1,
            recordedAt: now,
            source: "observed",
          },
          {
            metricKey: "lift_bench",
            valueKg: 70,
            reps: 1,
            recordedAt: new Date(now.getTime() - 40 * day),
            source: "observed",
          },
          {
            metricKey: "lift_bench",
            valueKg: 75,
            reps: 1,
            recordedAt: now,
            source: "observed",
          },
        ],
      }),
    );

    expect(assessment.trend).not.toBeNull();
    expect(assessment.trend?.direction).toBe("up");
    expect(assessment.trend?.includesEstimates).toBe(false);
    expect(displayableScore(assessment.result)).not.toBeNull();
    expect(assessment.result.reasoning.formulaId).toBe(
      "strength.context_trend.v2",
    );
  });
});
