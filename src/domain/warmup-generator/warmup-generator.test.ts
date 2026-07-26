import { describe, expect, it } from "vitest";
import {
  WARMUP_MAX_SETS,
  WARMUP_TOP_FRACTION_CAP,
  addWarmupSet,
  applyWarmupSetEdits,
  buildWarmupGeneratorSnapshot,
  generateWarmupPlan,
  removeWarmupSet,
  shouldPreferFewerSets,
} from "@/domain/warmup-generator";

describe("warmup generator", () => {
  it("builds progressive warm-ups below the working weight", () => {
    const result = generateWarmupPlan({
      targetWorkingWeightKg: 200,
      exerciseId: "back-squat",
      exerciseLabel: "Back squat",
      history: null,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.plan.sets.length).toBeGreaterThanOrEqual(3);
    expect(result.plan.sets.length).toBeLessThanOrEqual(WARMUP_MAX_SETS);
    for (const s of result.plan.sets) {
      expect(s.loadKg).toBeLessThan(200);
      expect(s.loadKg % 2.5).toBe(0);
    }
    const loads = result.plan.sets.map((s) => s.loadKg);
    for (let i = 1; i < loads.length; i++) {
      expect(loads[i]!).toBeGreaterThan(loads[i - 1]!);
    }
    const top = result.plan.sets[result.plan.sets.length - 1]!;
    expect(top.loadKg / 200).toBeLessThanOrEqual(WARMUP_TOP_FRACTION_CAP);
    expect(result.plan.usedFatigueLadder).toBe(false);
  });

  it("uses a shorter ladder when recent volume is high", () => {
    const history = {
      sessionCount: 4,
      volumeKgReps: 140 * 5 * 8 * 4,
      heaviestLoadKg: 145,
      lastTrainedAt: "2026-07-20T00:00:00.000Z",
    };
    expect(shouldPreferFewerSets(140, history)).toBe(true);
    const result = generateWarmupPlan({
      targetWorkingWeightKg: 140,
      exerciseId: "bench-press",
      exerciseLabel: "Bench press",
      history,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.plan.usedFatigueLadder).toBe(true);
    expect(result.plan.sets.length).toBeLessThanOrEqual(3);
  });

  it("allows user modifications without inventing sets above target", () => {
    const base = generateWarmupPlan({
      targetWorkingWeightKg: 100,
      exerciseId: "deadlift",
      exerciseLabel: "Deadlift",
      history: null,
      preferFewerSets: true,
    });
    expect(base.ok).toBe(true);
    if (!base.ok) return;
    expect(base.plan.sets.length).toBeLessThan(WARMUP_MAX_SETS);
    const firstId = base.plan.sets[0]!.id;
    const edited = applyWarmupSetEdits(base.plan, [
      { id: firstId, loadKg: 150, reps: 3 },
    ]);
    expect(edited.sets[0]!.loadKg).toBeLessThan(100);
    expect(edited.sets[0]!.userModified).toBe(true);

    const withAdd = addWarmupSet(edited);
    expect(withAdd.sets.length).toBe(edited.sets.length + 1);
    const trimmed = removeWarmupSet(withAdd, withAdd.sets[0]!.id);
    expect(trimmed.sets.length).toBe(withAdd.sets.length - 1);
  });

  it("rejects invalid targets and documents snapshot", () => {
    expect(
      generateWarmupPlan({
        targetWorkingWeightKg: 0,
        exerciseId: "custom",
        exerciseLabel: "Custom",
        history: null,
      }).ok,
    ).toBe(false);
    const snap = buildWarmupGeneratorSnapshot("2026-07-22T00:00:00.000Z");
    expect(snap.docPath).toBe("docs/WARMUP_GENERATOR.md");
    expect(snap.maxSets).toBe(WARMUP_MAX_SETS);
  });
});
