import { describe, expect, it } from "vitest";
import {
  POWERLIFTING_MODE_HONESTY,
  POWERLIFTING_RELATIVE_SCORE_STATUS,
  assemblePowerliftingMode,
  powerliftingModeText,
  type PowerliftingModeSignals,
} from "@/domain/powerlifting-mode";

function base(
  overrides: Partial<PowerliftingModeSignals> = {},
): PowerliftingModeSignals {
  return {
    now: new Date("2026-07-21T12:00:00Z"),
    lifts: {
      squatKg: 200,
      benchKg: 140,
      deadliftKg: 230,
      squatSource: "reported_pr",
      benchSource: "reported_pr",
      deadliftSource: "target",
    },
    competition: {
      hasPrep: true,
      name: "Local meet",
      dateIso: "2026-08-04T12:00:00.000Z",
      daysUntil: 14,
      weightClassLabel: "83 kg",
      weightClassLimitKg: 83,
      phaseLabel: "peaking",
    },
    ...overrides,
  };
}

describe("powerlifting mode", () => {
  it("prioritizes SBD, total, competition, weight class, and attempts", () => {
    const mode = assemblePowerliftingMode(base());
    expect(mode.priorities.map((p) => p.id)).toEqual([
      "squat",
      "bench",
      "deadlift",
      "total",
      "relative_score",
      "competition",
      "weight_class",
      "attempt_planning",
    ]);
    expect(mode.totalKg).toBe(570);
    expect(mode.totalSource).toBe("complete");
    expect(mode.priorities.find((p) => p.id === "competition")?.available).toBe(
      true,
    );
    expect(mode.training.map((t) => t.id)).toEqual([
      "specificity",
      "peaking",
      "competition_commands",
    ]);
    expect(mode.techniqueLibrary).toHaveLength(3);
  });

  it("links DOTS calculator without inventing an inline score or Wilks", () => {
    const mode = assemblePowerliftingMode(base());
    expect(mode.relativeScore.available).toBe(true);
    expect(mode.federation.selectedId).toBeNull();
    expect(mode.federation.selectionAvailableLater).toBe(true);
    expect(POWERLIFTING_RELATIVE_SCORE_STATUS.available).toBe(true);
    expect(POWERLIFTING_RELATIVE_SCORE_STATUS.systemsAvailable).toContain("dots");
    expect(POWERLIFTING_RELATIVE_SCORE_STATUS.systemsDeferred).toContain("wilks");

    const rel = mode.priorities.find((p) => p.id === "relative_score");
    expect(rel?.href).toBe("/tools/dots");
    expect(rel?.metricValue).toBeNull();

    const text = powerliftingModeText(mode);
    expect(text).not.toMatch(/dots\s*[:=]\s*\d/i);
    expect(text).not.toMatch(/wilks\s*[:=]\s*\d/i);
    expect(text).toMatch(/federation selection/i);
    expect(POWERLIFTING_MODE_HONESTY.join(" ")).toMatch(/not applied/i);
  });

  it("withholds total when lifts are incomplete", () => {
    const mode = assemblePowerliftingMode(
      base({
        lifts: {
          squatKg: 200,
          benchKg: null,
          deadliftKg: 230,
          squatSource: "reported_pr",
          benchSource: "missing",
          deadliftSource: "reported_pr",
        },
      }),
    );
    expect(mode.totalKg).toBeNull();
    expect(mode.totalSource).toBe("partial");
  });
});
