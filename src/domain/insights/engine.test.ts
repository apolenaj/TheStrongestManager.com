import { describe, expect, it } from "vitest";
import { proposeCrossDomainInsights } from "@/domain/insights/engine";
import {
  estimateBodyweightTrendKgPerWeek,
  volumeTrendPct,
} from "@/domain/insights/signals";
import type { CrossDomainSignals } from "@/domain/insights/types";

function baseSignals(
  overrides: Partial<CrossDomainSignals> = {},
): CrossDomainSignals {
  return {
    bodyweightTrendKgPerWeek: null,
    bodyweightSampleCount: 0,
    latestBodyweightKg: null,
    trainingVolumeTrendPct: null,
    recentVolumeKg: null,
    priorVolumeKg: null,
    trainingPerformanceTrend: "unknown",
    recoveryReadinessRecent: null,
    recoveryReadinessDelta: null,
    recoverySampleCount: 0,
    nutritionSyncFeatureEnabled: false,
    nutritionHasTargets: false,
    nutritionHasSummary: false,
    completedSessionsRecent: 0,
    completedSessionsBaseline: 0,
    ...overrides,
  };
}

describe("estimateBodyweightTrendKgPerWeek", () => {
  it("returns null without enough span/samples", () => {
    expect(
      estimateBodyweightTrendKgPerWeek([
        { at: new Date("2026-07-01"), kg: 80 },
        { at: new Date("2026-07-02"), kg: 79.5 },
      ]),
    ).toBeNull();
  });

  it("detects declining trend", () => {
    const trend = estimateBodyweightTrendKgPerWeek([
      { at: new Date("2026-06-01"), kg: 85 },
      { at: new Date("2026-06-08"), kg: 84 },
      { at: new Date("2026-06-15"), kg: 83 },
      { at: new Date("2026-06-22"), kg: 82 },
    ]);
    expect(trend).not.toBeNull();
    expect(trend!).toBeLessThan(-0.4);
  });
});

describe("proposeCrossDomainInsights", () => {
  it("surfaces recovery + nutrition review when BW, training, and recovery all worsen — without calorie prescriptions", () => {
    const result = proposeCrossDomainInsights(
      baseSignals({
        bodyweightTrendKgPerWeek: -0.6,
        bodyweightSampleCount: 6,
        latestBodyweightKg: 78,
        trainingVolumeTrendPct: -25,
        trainingPerformanceTrend: "down",
        completedSessionsRecent: 3,
        completedSessionsBaseline: 4,
        recoveryReadinessRecent: 40,
        recoveryReadinessDelta: -12,
        recoverySampleCount: 5,
        nutritionHasTargets: false,
        nutritionHasSummary: false,
      }),
    );

    const primary = result.insights.find(
      (i) => i.id === "multi_domain_decline_review_recovery_nutrition",
    );
    expect(primary).toBeDefined();
    expect(primary!.summary).toMatch(/recovery and nutrition/i);
    expect(primary!.evidence.length).toBeGreaterThanOrEqual(3);
    expect(primary!.confidence).toMatch(/low|medium|high/);
    expect(primary!.action.href).toBeTruthy();
    expect(primary!.nutritionPrescriptionNote).toMatch(/not prescribed/i);
    expect(primary!.summary + primary!.action.label).not.toMatch(/\d+\s*kcal/i);
  });

  it("never invents calorie actions when nutrition data is missing", () => {
    const result = proposeCrossDomainInsights(
      baseSignals({
        bodyweightTrendKgPerWeek: -0.5,
        bodyweightSampleCount: 4,
        nutritionHasTargets: false,
        nutritionHasSummary: false,
      }),
    );
    const bw = result.insights.find(
      (i) => i.id === "bodyweight_decline_insufficient_nutrition_data",
    );
    expect(bw).toBeDefined();
    expect(bw!.nutritionPrescriptionNote).toMatch(/not prescribed/i);
    expect(JSON.stringify(result.insights)).not.toMatch(/eat \d+/i);
  });

  it("returns insufficient-data insight when domains are thin", () => {
    const result = proposeCrossDomainInsights(baseSignals());
    expect(result.insights[0]?.id).toBe("insufficient_cross_domain_data");
    expect(result.insights[0]?.confidence).toBe("low");
  });

  it("volumeTrendPct is percent-based", () => {
    expect(volumeTrendPct(80, 100)).toBe(-20);
  });
});
