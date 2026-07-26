import { describe, expect, it } from "vitest";
import {
  CALCULATOR_DEFINITIONS,
  computeAttemptPlan,
  computeDots,
  computeEstimated1rm,
  computePlateLoading,
  computeTrainingMax,
  computeVolume,
  evaluateCalculatorQuality,
  listIndexableCalculatorPaths,
} from "@/domain/calculator-suite";

describe("calculator suite", () => {
  it("allowlists six useful calculators and all pass quality", () => {
    expect(CALCULATOR_DEFINITIONS.map((c) => c.slug)).toEqual([
      "estimated-1rm",
      "plate-calculator",
      "dots",
      "volume-calculator",
      "attempt-planner",
      "training-max",
    ]);
    for (const calc of CALCULATOR_DEFINITIONS) {
      const q = evaluateCalculatorQuality(calc);
      expect(q.passed, `${calc.slug}: ${JSON.stringify(q.checks)}`).toBe(true);
    }
    expect(listIndexableCalculatorPaths()).toHaveLength(6);
  });

  it("estimates 1RM with Epley and refuses out-of-range reps", () => {
    const ok = computeEstimated1rm({ weightKg: 100, reps: 5 });
    expect(ok?.displayKg).toBe(116.5); // 100 * (1 + 5/30) = 116.666 → 116.5
    expect(computeEstimated1rm({ weightKg: 100, reps: 1 })).toBeNull();
    expect(computeEstimated1rm({ weightKg: 100, reps: 20 })).toBeNull();
  });

  it("loads plates greedily and reports remainder", () => {
    const exact = computePlateLoading({ targetKg: 100, barKg: 20 });
    expect(exact?.exact).toBe(true);
    expect(exact?.platesPerSide).toEqual([
      { plateKg: 25, countPerSide: 1 },
      { plateKg: 15, countPerSide: 1 },
    ]);

    const odd = computePlateLoading({
      targetKg: 103,
      barKg: 20,
      denominationsKg: [25, 20, 15, 10, 5, 2.5],
    });
    expect(odd?.exact).toBe(false);
    expect(odd?.remainderKg).toBeGreaterThan(0);
  });

  it("computes cited DOTS without inventing Wilks", () => {
    const result = computeDots({
      sex: "male",
      bodyweightKg: 100,
      totalKg: 700,
    });
    expect(result).not.toBeNull();
    expect(result!.displayDots).toBeGreaterThan(400);
    expect(result!.displayDots).toBeLessThan(460);
    expect(result!.citation).toMatch(/OpenPowerlifting/i);
    expect(result!.precisionNote).toMatch(/not IPF GL/i);
  });

  it("sums volume tonnage and sketches attempts + training max", () => {
    const vol = computeVolume([
      { loadKg: 100, reps: 5, sets: 3, label: "Squat" },
      { loadKg: 80, reps: 8, sets: 3, label: "Bench" },
    ]);
    expect(vol?.totalTonnageKg).toBe(100 * 5 * 3 + 80 * 8 * 3);

    const attempts = computeAttemptPlan({
      planningCeilingKg: 200,
      risk: "balanced",
      lift: "squat",
    });
    expect(attempts?.selection.openerKg).toBeGreaterThan(0);
    expect(attempts?.selection.secondKg).toBeGreaterThan(
      attempts!.selection.openerKg,
    );
    expect(attempts?.precisionNote).toMatch(/never a guarantee/i);

    const tm = computeTrainingMax({ oneRmKg: 200, fraction: 0.9 });
    expect(tm?.displayKg).toBe(180);
    expect(tm?.precisionNote).toMatch(/programming/i);
  });
});
