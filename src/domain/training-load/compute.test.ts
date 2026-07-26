import { describe, expect, it } from "vitest";
import {
  aggregateLoadTotals,
  assessLoadSpike,
  buildDailyVolumeSeries,
  isHardSet,
  setVolumeKg,
  type LoadSetInput,
} from "@/domain/training-load/compute";

function set(
  overrides: Partial<LoadSetInput> & Pick<LoadSetInput, "sessionId" | "exerciseId">,
): LoadSetInput {
  return {
    exerciseName: "Squat",
    completedAt: new Date(2026, 6, 20),
    performedReps: 5,
    performedLoadKg: 100,
    performedRpe: 7,
    performedRir: null,
    prescribedPercent: null,
    sessionRpe: 7,
    ...overrides,
  };
}

describe("training load compute", () => {
  it("computes volume only when load and reps exist", () => {
    expect(setVolumeKg({ performedLoadKg: 100, performedReps: 5 })).toBe(500);
    expect(setVolumeKg({ performedLoadKg: null, performedReps: 5 })).toBeNull();
  });

  it("counts hard sets from RPE/RIR heuristic only", () => {
    expect(isHardSet({ performedRpe: 8, performedRir: null })).toBe(true);
    expect(isHardSet({ performedRpe: 7, performedRir: 1 })).toBe(true);
    expect(isHardSet({ performedRpe: 7, performedRir: 3 })).toBe(false);
  });

  it("aggregates totals and estimated intensity from set RPE", () => {
    const totals = aggregateLoadTotals([
      set({ sessionId: "s1", exerciseId: "e1", performedRpe: 8 }),
      set({
        sessionId: "s1",
        exerciseId: "e1",
        performedRpe: 7,
        performedLoadKg: 90,
        performedReps: 5,
      }),
    ]);
    expect(totals.setCount).toBe(2);
    expect(totals.volumeKg).toBe(500 + 450);
    expect(totals.hardSetCount).toBe(1);
    expect(totals.estimatedIntensityBasis).toBe("set_rpe");
    expect(totals.estimatedIntensity).toBe(75);
  });

  it("flags spikes only with strong ratio and absolute lift", () => {
    const daily = [];
    // Baseline: 10 days @ 1000 volume
    for (let i = 7; i < 28; i += 1) {
      const d = new Date(2026, 6, 20);
      d.setDate(d.getDate() - i);
      daily.push({
        dayKey: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
        volumeKg: 1000,
        setCount: 10,
        hardSetCount: 2,
        sessionCount: 1,
      });
    }
    // Recent: 7 days @ 2500
    for (let i = 0; i < 7; i += 1) {
      const d = new Date(2026, 6, 20);
      d.setDate(d.getDate() - i);
      daily.push({
        dayKey: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
        volumeKg: 2500,
        setCount: 20,
        hardSetCount: 6,
        sessionCount: 1,
      });
    }

    const spike = assessLoadSpike({
      daily,
      recentDays: 7,
      baselineDays: 21,
      asOf: new Date(2026, 6, 20),
    });
    expect(spike.flagged).toBe(true);
    expect(spike.label).toMatch(/estimated training load/i);
    expect(spike.explanation.toLowerCase()).toContain("not a fatigue score");
    expect(spike.explanation.toLowerCase()).toContain("not");
    expect(spike.explanation.toLowerCase()).toMatch(/injury prediction/);
  });

  it("does not flag when baseline is thin", () => {
    const series = buildDailyVolumeSeries([
      set({
        sessionId: "s1",
        exerciseId: "e1",
        completedAt: new Date(2026, 6, 20),
      }),
    ]);
    const spike = assessLoadSpike({
      daily: series,
      recentDays: 7,
      baselineDays: 21,
      asOf: new Date(2026, 6, 20),
    });
    expect(spike.flagged).toBe(false);
  });
});
