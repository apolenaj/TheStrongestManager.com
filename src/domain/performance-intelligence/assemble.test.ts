import { describe, expect, it } from "vitest";
import { assembleAthleteState } from "@/domain/performance-intelligence/assemble";
import { PERFORMANCE_INTELLIGENCE_ENGINE_VERSION } from "@/domain/performance-intelligence/constants";
import { computeAthleteScores } from "@/domain/scoring";
import type { ScoringSnapshot } from "@/domain/scoring/types";
import type { IntelligenceParts } from "@/domain/performance-intelligence/assemble";

function emptyScores(now: Date) {
  const snapshot: ScoringSnapshot = {
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
  };
  return computeAthleteScores(snapshot);
}

describe("assembleAthleteState", () => {
  it("returns insufficient fields when no athlete signals exist", () => {
    const now = new Date("2026-07-21T12:00:00.000Z");
    const parts: IntelligenceParts = {
      athleteProfileId: "profile_1",
      now,
      scores: emptyScores(now),
      strengthTrend: null,
      techniqueSamples: [],
      bodyweightPoints: [],
      recoveryReadiness: [],
      recentVolumeKg: 0,
      priorVolumeKg: 0,
      loadSpike: null,
      goal: null,
      activeProgramName: null,
      nutrition: { connected: false, hasTargets: false },
      signalTimestamps: [],
    };

    const state = assembleAthleteState(parts);
    expect(state.engineVersion).toBe(PERFORMANCE_INTELLIGENCE_ENGINE_VERSION);
    expect(state.performanceTrend.value).toBeNull();
    expect(state.performanceTrend.source).toBe("insufficient");
    expect(state.performanceTrend.missingDependencies.length).toBeGreaterThan(0);
    expect(state.goalProgress.value?.statusLabel).toBe("no_goal");
    expect(state.dataFreshness.value?.freshnessLabel).toBe("unknown");
    expect(state.nutritionAvailability.value?.connected).toBe(false);
    expect(state.dataConfidence.value?.overall).toBe("none");
  });

  it("derives consistency and recovery when scores are displayable", () => {
    const now = new Date("2026-07-21T12:00:00.000Z");
    const day = 24 * 60 * 60 * 1000;
    const snapshot: ScoringSnapshot = {
      now,
      lifts: [],
      techniqueAnalyses: [
        {
          overallScore: 70,
          recordedAt: new Date(now.getTime() - 14 * day),
          confidenceBasis: "observed",
        },
        {
          overallScore: 76,
          recordedAt: new Date(now.getTime() - 3 * day),
          confidenceBasis: "observed",
        },
      ],
      recoveryEntries: [
        {
          readiness: 60,
          recordedAt: new Date(now.getTime() - 10 * day),
          source: "reported",
        },
        {
          readiness: 65,
          recordedAt: new Date(now.getTime() - 5 * day),
          source: "reported",
        },
        {
          readiness: 72,
          recordedAt: new Date(now.getTime() - 1 * day),
          source: "reported",
        },
      ],
      sessions: Array.from({ length: 6 }).map((_, i) => ({
        status: "completed" as const,
        scheduledAt: new Date(now.getTime() - (i + 1) * day),
        completedAt: new Date(now.getTime() - (i + 1) * day),
        startedAt: new Date(now.getTime() - (i + 1) * day),
        programId: "prog_1",
      })),
      activeProgramId: "prog_1",
      activeProgramName: "Peaking block",
      bodyweightKg: 82,
      experienceLevel: "intermediate",
      primaryDiscipline: "powerlifting",
    };
    const scores = computeAthleteScores(snapshot);

    const parts: IntelligenceParts = {
      athleteProfileId: "profile_2",
      now,
      scores,
      strengthTrend: null,
      techniqueSamples: snapshot.techniqueAnalyses.map((t) => ({
        overallScore: t.overallScore,
        recordedAt: t.recordedAt,
      })),
      bodyweightPoints: [
        { at: new Date(now.getTime() - 21 * day), kg: 83 },
        { at: new Date(now.getTime() - 14 * day), kg: 82.6 },
        { at: new Date(now.getTime() - 7 * day), kg: 82.2 },
        { at: new Date(now.getTime() - 1 * day), kg: 82 },
      ],
      recoveryReadiness: snapshot.recoveryEntries.map((r) => ({
        at: r.recordedAt,
        readiness: r.readiness,
      })),
      recentVolumeKg: 12000,
      priorVolumeKg: 10000,
      loadSpike: {
        flagged: false,
        ratio: 1.1,
        recentAvgDailyVolumeKg: 1000,
        baselineAvgDailyVolumeKg: 900,
        label: null,
        explanation: "No spike",
      },
      goal: {
        title: "Add 10 kg to total",
        category: "performance",
        targetValue: null,
      },
      activeProgramName: "Peaking block",
      nutrition: { connected: false, hasTargets: false },
      signalTimestamps: [
        { kind: "training_session", at: new Date(now.getTime() - day) },
      ],
    };

    const state = assembleAthleteState(parts);
    expect(state.trainingConsistency.value?.score).not.toBeNull();
    expect(state.programProgress.value?.hasActiveProgram).toBe(true);
    expect(state.techniqueTrend.value?.direction).toBe("up");
    expect(state.bodyweightTrend.value?.direction).toBe("down");
    expect(state.goalProgress.value?.statusLabel).toBe("insufficient_signals");
    expect(state.dataFreshness.value?.freshnessLabel).toBe("fresh");
    expect(state.fatigueTrend.source).toBe("heuristic");
  });
});
