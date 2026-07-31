import { describe, expect, it } from "vitest";
import {
  PERFORMANCE_REPORT_HONESTY,
  PERFORMANCE_REPORT_SECTION_IDS,
  assemblePerformanceReport,
  buildPerformanceReportPeriod,
  type PerformanceReportSignals,
} from "@/domain/performance-report";

function baseSignals(
  overrides: Partial<PerformanceReportSignals> = {},
): PerformanceReportSignals {
  const period = buildPerformanceReportPeriod({
    from: new Date("2026-06-01T00:00:00.000Z"),
    to: new Date("2026-06-29T00:00:00.000Z"),
  });
  return {
    athleteDisplayName: "Test Athlete",
    period,
    unitsLabel: "kg",
    branding: { displayName: "The Strongest", accentHex: null },
    now: new Date("2026-06-29T12:00:00.000Z"),
    overview: {
      primaryDiscipline: "powerlifting",
      activeGoals: ["Squat 200"],
      experienceLevel: "intermediate",
    },
    strength: { bestE1rmByLiftKg: { squat: 180 }, setCountWithLoad: 12 },
    technique: { scoredAnalyses: [72, 74], analysisCount: 2 },
    training: {
      completedSessions: 8,
      skippedSessions: 1,
      volumeKg: 12000,
      volumeSetCount: 40,
    },
    recovery: { checkInCount: 5, readinessScores: [7, 6, 8] },
    progress: {
      metricLabels: ["squat_e1rm"],
      bodyweightKgSamples: [90, 90.5],
    },
    recommendations: {
      titles: ["Hold intensity this week"],
      sources: ["weekly_review"],
    },
    ...overrides,
  };
}

describe("performance report assemble", () => {
  it("covers required sections and states the data period", () => {
    const report = assemblePerformanceReport(baseSignals());
    expect(report.sections.map((s) => s.id)).toEqual([
      ...PERFORMANCE_REPORT_SECTION_IDS,
    ]);
    expect(report.period.label).toMatch(/2026-06-01/);
    expect(report.period.dayCount).toBe(28);
  });

  it("labels estimated 1RM and never invents strength without sets", () => {
    const withEst = assemblePerformanceReport(baseSignals());
    const strength = withEst.sections.find((s) => s.id === "strength")!;
    expect(strength.metrics.some((m) => m.kind === "estimated")).toBe(true);
    expect(withEst.estimatedMetricLabels.length).toBeGreaterThan(0);

    const empty = assemblePerformanceReport(
      baseSignals({
        strength: { bestE1rmByLiftKg: {}, setCountWithLoad: 0 },
      }),
    );
    const emptyStrength = empty.sections.find((s) => s.id === "strength")!;
    expect(emptyStrength.missingData).toMatch(/Missing/i);
    expect(emptyStrength.metrics.every((m) => m.value == null || m.kind !== "estimated")).toBe(
      true,
    );
  });

  it("surfaces missing recovery and technique honestly", () => {
    const report = assemblePerformanceReport(
      baseSignals({
        technique: { scoredAnalyses: [], analysisCount: 0 },
        recovery: { checkInCount: 0, readinessScores: [] },
        recommendations: { titles: [], sources: [] },
      }),
    );
    expect(report.missingDataNotes.join(" ")).toMatch(/technique/i);
    expect(report.missingDataNotes.join(" ")).toMatch(/recovery/i);
    expect(PERFORMANCE_REPORT_HONESTY.join(" ")).toMatch(/never invented/i);
    expect(PERFORMANCE_REPORT_HONESTY.join(" ")).toMatch(/unsupported/i);
  });
});
