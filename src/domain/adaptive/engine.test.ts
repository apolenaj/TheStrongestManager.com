import { describe, expect, it } from "vitest";
import {
  previewAdaptedPrescription,
  proposeAdaptation,
  type AdaptationSignals,
} from "@/domain/adaptive/engine";

function base(overrides: Partial<AdaptationSignals> = {}): AdaptationSignals {
  return {
    goalTitle: "Build squat strength",
    goalCategory: "strength",
    completedSetCount: 6,
    avgRpe: 7.5,
    avgTargetRpe: 8,
    missedRepRate: 0,
    recentLoadTrendKg: 0,
    consistencyScore: 80,
    recoveryReadiness: 72,
    techniqueTrendDelta: 1,
    techniqueRecentMean: 70,
    currentLoadKg: 100,
    currentSets: 3,
    exerciseName: "Back Squat",
    ...overrides,
  };
}

describe("adaptive programming engine", () => {
  it("keeps load when no completed sets", () => {
    const result = proposeAdaptation(base({ completedSetCount: 0 }));
    expect(result.changeKind).toBe("keep_load");
    expect(result.confidence).toBe("low");
  });

  it("suggests deload when recovery is low and reps were missed", () => {
    const result = proposeAdaptation(
      base({
        recoveryReadiness: 30,
        missedRepRate: 0.4,
        avgRpe: 9.2,
      }),
    );
    expect(result.changeKind).toBe("deload");
    expect(result.params.loadMultiplier).toBeLessThan(1);
    expect(result.reason.toLowerCase()).toContain("readiness");
  });

  it("reduces load when missed-rep rate is high", () => {
    const result = proposeAdaptation(
      base({
        recoveryReadiness: 65,
        missedRepRate: 0.5,
        avgRpe: 8,
      }),
    );
    expect(result.changeKind).toBe("reduce_load");
    expect(result.params.deltaKg).toBeLessThan(0);
  });

  it("increases load when reps are hit with room under RPE", () => {
    const result = proposeAdaptation(
      base({
        missedRepRate: 0,
        avgRpe: 6.5,
        avgTargetRpe: 8,
        recoveryReadiness: 80,
      }),
    );
    expect(result.changeKind).toBe("increase_load");
    expect(result.params.deltaKg).toBeGreaterThan(0);
    expect(result.recommendedChange).toMatch(/Increase load/i);
  });

  it("holds load when technique is trending down", () => {
    const result = proposeAdaptation(
      base({
        techniqueTrendDelta: -8,
        missedRepRate: 0,
        avgRpe: 7,
      }),
    );
    expect(result.changeKind).toBe("keep_load");
    expect(result.reason.toLowerCase()).toContain("technique");
  });

  it("previews load/set changes without inventing missing bases", () => {
    expect(
      previewAdaptedPrescription({
        currentLoadKg: 100,
        currentSets: 4,
        params: { deltaKg: 2.5, setsDelta: -1 },
      }),
    ).toEqual({ loadKg: 102.5, sets: 3 });

    expect(
      previewAdaptedPrescription({
        currentLoadKg: null,
        currentSets: null,
        params: { deltaKg: 2.5 },
      }),
    ).toEqual({ loadKg: null, sets: null });
  });
});
