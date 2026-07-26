import { describe, expect, it } from "vitest";
import {
  BODYBUILDING_FORBIDDEN_CLAIMS,
  BODYBUILDING_MODE_HONESTY,
  assembleBodybuildingMode,
  bodybuildingModeText,
  type BodybuildingModeSignals,
} from "@/domain/bodybuilding-mode";

function base(
  overrides: Partial<BodybuildingModeSignals> = {},
): BodybuildingModeSignals {
  return {
    now: new Date("2026-07-21T12:00:00Z"),
    lookbackDays: 7,
    muscleSets: [
      { muscleKey: "chest", setCount: 12, volumeKg: 4800 },
      { muscleKey: "triceps", setCount: 8, volumeKg: 2400 },
      { muscleKey: "quads", setCount: 10, volumeKg: 6000 },
    ],
    exercises: [
      {
        exerciseId: "e1",
        exerciseName: "Bench press",
        slug: "bench-press",
        setCount: 9,
        volumeKg: 3600,
        latestLoadKg: 100,
        priorLoadKg: 95,
      },
      {
        exerciseId: "e2",
        exerciseName: "Leg press",
        slug: null,
        setCount: 8,
        volumeKg: 8000,
        latestLoadKg: 200,
        priorLoadKg: 200,
      },
    ],
    weeklyVolume: {
      volumeKg: 12000,
      setCount: 40,
      hardSetCount: 18,
      sessionCount: 4,
    },
    bodyweight: {
      latestKg: 82.5,
      priorKg: 82.0,
      sampleCount: 3,
    },
    recovery: {
      hasRecentEntry: true,
      latestReadiness: 7,
    },
    ...overrides,
  };
}

describe("bodybuilding mode", () => {
  it("surfaces muscle workload, volume, progression, bodyweight, performance", () => {
    const mode = assembleBodybuildingMode(base());
    expect(mode.priorities.map((p) => p.id)).toEqual([
      "muscle_groups",
      "weekly_volume",
      "exercise_progression",
      "bodyweight",
      "training_performance",
    ]);
    expect(mode.muscleWorkload[0]?.muscleKey).toBe("chest");
    expect(
      mode.exerciseProgression.find((e) => e.exerciseName === "Bench press")
        ?.trend,
    ).toBe("up");
    expect(mode.support.map((s) => s.id)).toContain("recovery");
    expect(mode.support.map((s) => s.id)).toContain("physique_photos");
  });

  it("never invents muscle-growth scores or photo body-fat", () => {
    const mode = assembleBodybuildingMode(base());
    expect(mode.muscleGrowthScore.available).toBe(false);
    expect(mode.photos.bodyFatFromPhotos).toBe(false);
    expect(mode.photos.privateByDefault).toBe(true);
    expect(mode.photos.enabled).toBe(false);

    const text = bodybuildingModeText(mode);
    for (const claim of BODYBUILDING_FORBIDDEN_CLAIMS) {
      expect(text).not.toContain(claim.replace(/_/g, " ") + " =");
    }
    expect(text).not.toMatch(/growth score\s*[:=]\s*\d/i);
    expect(text).not.toMatch(/body fat from photo/i);
    expect(BODYBUILDING_MODE_HONESTY.join(" ")).toMatch(/no muscle-growth/i);
  });

  it("stays honest when data is empty", () => {
    const mode = assembleBodybuildingMode(
      base({
        muscleSets: [],
        exercises: [],
        weeklyVolume: {
          volumeKg: 0,
          setCount: 0,
          hardSetCount: 0,
          sessionCount: 0,
        },
        bodyweight: { latestKg: null, priorKg: null, sampleCount: 0 },
        recovery: { hasRecentEntry: false, latestReadiness: null },
      }),
    );
    expect(mode.priorities.every((p) => p.available === false)).toBe(true);
    expect(mode.muscleWorkload).toHaveLength(0);
  });
});
