import { describe, expect, it } from "vitest";
import { inferTrainingPhase, mapTrendDirection } from "@/domain/pr-prediction/phase";
import {
  estimateSetE1rmKg,
  predictOneRmRange,
  predictPrRanges,
} from "@/domain/pr-prediction/predict";
import type { PrPredictionContext } from "@/domain/pr-prediction/types";

const NOW = new Date("2026-07-21T12:00:00.000Z");

function daysAgo(n: number): Date {
  return new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000);
}

function baseCtx(
  overrides: Partial<PrPredictionContext> = {},
): PrPredictionContext {
  return {
    exerciseKey: "deadlift",
    exerciseLabel: "Deadlift",
    workingSets: [],
    trend: "stable",
    trainingPhase: "intensification",
    fatigue: 5,
    readiness: 70,
    ...overrides,
  };
}

describe("inferTrainingPhase", () => {
  it("detects peaking and deload from names", () => {
    expect(inferTrainingPhase("Meet peaking block")).toBe("peaking");
    expect(inferTrainingPhase("Week 4 deload")).toBe("deload");
    expect(inferTrainingPhase("Volume accumulation")).toBe("accumulation");
    expect(inferTrainingPhase(null)).toBe("unknown");
  });
});

describe("mapTrendDirection", () => {
  it("maps athlete-state directions", () => {
    expect(mapTrendDirection("up")).toBe("improving");
    expect(mapTrendDirection("down")).toBe("declining");
    expect(mapTrendDirection("flat")).toBe("stable");
    expect(mapTrendDirection("unknown")).toBe("unknown");
  });
});

describe("estimateSetE1rmKg", () => {
  it("uses load for singles and Epley for multi-rep", () => {
    expect(estimateSetE1rmKg({
      loadKg: 300,
      reps: 1,
      rpe: 10,
      completedAt: NOW,
      hitRepTarget: true,
    })).toBe(300);

    const e5 = estimateSetE1rmKg({
      loadKg: 260,
      reps: 5,
      rpe: 10,
      completedAt: NOW,
      hitRepTarget: true,
    });
    // Epley: 260 * (1 + 5/30) = 303.33...
    expect(e5).toBeCloseTo(260 * (1 + 5 / 30), 1);
  });

  it("discounts when RPE is missing", () => {
    const withRpe = estimateSetE1rmKg({
      loadKg: 260,
      reps: 5,
      rpe: 9,
      completedAt: NOW,
      hitRepTarget: true,
    })!;
    const noRpe = estimateSetE1rmKg({
      loadKg: 260,
      reps: 5,
      rpe: null,
      completedAt: NOW,
      hitRepTarget: true,
    })!;
    expect(noRpe).toBeLessThan(withRpe);
  });
});

describe("predictOneRmRange", () => {
  it("returns a range, not a single point, with assumptions", () => {
    const result = predictOneRmRange(
      baseCtx({
        workingSets: [
          {
            loadKg: 260,
            reps: 5,
            rpe: 8,
            completedAt: daysAgo(3),
            hitRepTarget: true,
          },
          {
            loadKg: 270,
            reps: 3,
            rpe: 8.5,
            completedAt: daysAgo(10),
            hitRepTarget: true,
          },
          {
            loadKg: 255,
            reps: 5,
            rpe: 7.5,
            completedAt: daysAgo(17),
            hitRepTarget: true,
          },
        ],
      }),
      NOW,
    );

    expect("prediction" in result).toBe(true);
    if (!("prediction" in result)) return;
    const p = result.prediction;
    expect(p.rangeKg.high).toBeGreaterThan(p.rangeKg.low);
    expect(p.confidence).toMatch(/low|moderate|high/);
    expect(p.assumptions.length).toBeGreaterThan(2);
    expect(p.assumptions.some((a) => /range/i.test(a))).toBe(true);
  });

  it("withholds when data quality is insufficient", () => {
    const result = predictOneRmRange(
      baseCtx({
        workingSets: [
          {
            loadKg: 200,
            reps: 8,
            rpe: 6,
            completedAt: daysAgo(2),
            hitRepTarget: true,
          },
        ],
      }),
      NOW,
    );
    expect("withheld" in result).toBe(true);
    if (!("withheld" in result)) return;
    expect(result.withheld.reason).toMatch(/Insufficient|qualifying/i);
  });

  it("withholds when no recent sets", () => {
    const result = predictOneRmRange(
      baseCtx({
        workingSets: [
          {
            loadKg: 280,
            reps: 3,
            rpe: 9,
            completedAt: daysAgo(60),
            hitRepTarget: true,
          },
        ],
      }),
      NOW,
    );
    expect("withheld" in result).toBe(true);
  });

  it("allows a single very hard low-rep set at low confidence", () => {
    const result = predictOneRmRange(
      baseCtx({
        workingSets: [
          {
            loadKg: 290,
            reps: 2,
            rpe: 9,
            completedAt: daysAgo(1),
            hitRepTarget: true,
          },
        ],
        trend: "unknown",
        trainingPhase: "unknown",
        fatigue: null,
        readiness: null,
      }),
      NOW,
    );
    expect("prediction" in result).toBe(true);
    if (!("prediction" in result)) return;
    expect(result.prediction.confidence).toBe("low");
  });

  it("shifts range down when fatigue is high", () => {
    const sets = [
      {
        loadKg: 260,
        reps: 5,
        rpe: 8,
        completedAt: daysAgo(2),
        hitRepTarget: true,
      },
      {
        loadKg: 265,
        reps: 4,
        rpe: 8.5,
        completedAt: daysAgo(9),
        hitRepTarget: true,
      },
    ];
    const fresh = predictOneRmRange(
      baseCtx({ workingSets: sets, fatigue: 4, readiness: 75 }),
      NOW,
    );
    const tired = predictOneRmRange(
      baseCtx({ workingSets: sets, fatigue: 9, readiness: 30 }),
      NOW,
    );
    expect("prediction" in fresh && "prediction" in tired).toBe(true);
    if (!("prediction" in fresh) || !("prediction" in tired)) return;
    expect(tired.prediction.rangeKg.low).toBeLessThanOrEqual(
      fresh.prediction.rangeKg.low,
    );
    expect(tired.prediction.assumptions.some((a) => /fatigue/i.test(a))).toBe(
      true,
    );
  });
});

describe("predictPrRanges", () => {
  it("splits predictions and withheld lifts", () => {
    const result = predictPrRanges(
      [
        baseCtx({
          exerciseKey: "deadlift",
          exerciseLabel: "Deadlift",
          workingSets: [
            {
              loadKg: 260,
              reps: 5,
              rpe: 8,
              completedAt: daysAgo(2),
              hitRepTarget: true,
            },
            {
              loadKg: 270,
              reps: 3,
              rpe: 9,
              completedAt: daysAgo(8),
              hitRepTarget: true,
            },
          ],
        }),
        baseCtx({
          exerciseKey: "bench",
          exerciseLabel: "Bench press",
          workingSets: [],
        }),
      ],
      NOW,
    );
    expect(result.predictions).toHaveLength(1);
    expect(result.withheld).toHaveLength(1);
    expect(result.withheld[0]!.exerciseKey).toBe("bench");
  });
});
