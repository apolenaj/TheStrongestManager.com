import { describe, expect, it } from "vitest";
import {
  WEIGHTLIFTING_LIFT_IDS,
  WEIGHTLIFTING_MODE_HONESTY,
  WEIGHTLIFTING_TECHNIQUE_ANALYSIS_STATUS,
  assembleWeightliftingMode,
  weightliftingPrMetricKey,
  type WeightliftingModeSignals,
} from "@/domain/weightlifting-mode";

function base(
  overrides: Partial<WeightliftingModeSignals> = {},
): WeightliftingModeSignals {
  return {
    now: new Date("2026-07-21T12:00:00Z"),
    lifts: {
      snatch: { loadKg: 100, recordedAt: new Date("2026-07-01") },
      clean: { loadKg: 125, recordedAt: new Date("2026-07-02") },
      jerk: { loadKg: 125, recordedAt: new Date("2026-07-02") },
      clean_and_jerk: { loadKg: 130, recordedAt: new Date("2026-07-03") },
    },
    advancedVideoAnalysisEnabled: false,
    competition: {
      hasPrep: false,
      name: null,
      dateIso: null,
      daysUntil: null,
    },
    ...overrides,
  };
}

describe("weightlifting mode", () => {
  it("tracks snatch, clean, jerk, clean & jerk and competition total", () => {
    expect([...WEIGHTLIFTING_LIFT_IDS]).toEqual([
      "snatch",
      "clean",
      "jerk",
      "clean_and_jerk",
    ]);
    const mode = assembleWeightliftingMode(base());
    expect(mode.lifts.map((l) => l.liftId)).toEqual([...WEIGHTLIFTING_LIFT_IDS]);
    expect(mode.competitionTotalKg).toBe(230);
    expect(mode.competitionTotalSource).toBe("complete");
    expect(mode.attempts.snatchAttempts).toBe(3);
    expect(mode.attempts.cleanAndJerkAttempts).toBe(3);
    expect(mode.positions.length).toBeGreaterThan(0);
    expect(weightliftingPrMetricKey("snatch")).toBe("wl_snatch_weight");
  });

  it("does not implement technique analysis; respects advanced video flag", () => {
    const off = assembleWeightliftingMode(base());
    expect(off.techniqueAnalysis.implemented).toBe(false);
    expect(off.techniqueAnalysis.advancedVideoAnalysisEnabled).toBe(false);
    expect(WEIGHTLIFTING_TECHNIQUE_ANALYSIS_STATUS.implemented).toBe(false);

    const on = assembleWeightliftingMode(
      base({ advancedVideoAnalysisEnabled: true }),
    );
    expect(on.techniqueAnalysis.implemented).toBe(false);
    expect(on.techniqueAnalysis.advancedVideoAnalysisEnabled).toBe(true);
    expect(
      on.priorities.find((p) => p.id === "technique")?.available,
    ).toBe(false);

    expect(WEIGHTLIFTING_MODE_HONESTY.join(" ")).toMatch(
      /until specific models exist/i,
    );
  });

  it("withholds competition total without both lifts", () => {
    const mode = assembleWeightliftingMode(
      base({
        lifts: {
          snatch: { loadKg: 100, recordedAt: null },
        },
      }),
    );
    expect(mode.competitionTotalKg).toBeNull();
    expect(mode.competitionTotalSource).toBe("partial");
  });
});
