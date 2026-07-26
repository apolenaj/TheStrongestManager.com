import { describe, expect, it } from "vitest";
import {
  MONTHLY_REPORT_HONESTY,
  MONTHLY_REPORT_SECTION_IDS,
  assembleMonthlyAthleteReport,
  buildMonthlyReportSharePayload,
  monthWindowFor,
  parseMonthKey,
  previousMonthWindow,
  type MonthlyMonthSignals,
} from "@/domain/monthly-report";

function signals(
  year: number,
  month: number,
  overrides: Partial<MonthlyMonthSignals> = {},
): MonthlyMonthSignals {
  const window = monthWindowFor(year, month);
  return {
    window,
    completedSessions: 10,
    skippedSessions: 1,
    volumeKg: 50000,
    volumeSetCount: 80,
    bestE1rmByLift: { Squat: 180 },
    techniqueScores: [70, 72],
    recoveryCheckIns: 8,
    bodyweightKg: [90, 90.2],
    prLabels: ["Squat 180 kg"],
    goals: [{ title: "Squat 200", category: "strength" }],
    trainingDaysWithSession: 12,
    ...overrides,
  };
}

describe("monthly performance report", () => {
  it("parses month keys and previous month", () => {
    const w = parseMonthKey("2026-07");
    expect(w?.monthKey).toBe("2026-07");
    expect(previousMonthWindow(w!).monthKey).toBe("2026-06");
  });

  it("assembles all required sections", () => {
    const report = assembleMonthlyAthleteReport({
      thisMonth: signals(2026, 7),
      previousMonth: signals(2026, 6, { completedSessions: 8 }),
      athleteDisplayName: "Athlete",
      now: new Date("2026-07-15T00:00:00Z"),
      unitsLabel: "kg",
    });
    expect(report.sections.map((s) => s.id)).toEqual([
      ...MONTHLY_REPORT_SECTION_IDS,
    ]);
    expect(report.nextPriorities.keep.length).toBeGreaterThan(0);
    expect(report.month.monthKey).toBe("2026-07");
  });

  it("flags missing technique and builds a public-safe share payload", () => {
    const report = assembleMonthlyAthleteReport({
      thisMonth: signals(2026, 7, {
        techniqueScores: [],
        completedSessions: 0,
        volumeSetCount: 0,
        bestE1rmByLift: {},
        prLabels: [],
        goals: [],
        trainingDaysWithSession: 0,
        bodyweightKg: [],
      }),
      previousMonth: signals(2026, 6),
      athleteDisplayName: "Athlete",
      now: new Date("2026-07-20T00:00:00Z"),
      unitsLabel: "kg",
    });
    const tech = report.sections.find((s) => s.id === "technique_changes");
    expect(tech?.missingNote).toMatch(/Missing/i);
    expect(MONTHLY_REPORT_HONESTY.join(" ")).toMatch(/public-safe/i);

    const share = buildMonthlyReportSharePayload({
      athleteDisplayName: "Athlete",
      report,
    });
    expect(share.monthKey).toBe("2026-07");
    expect(share.honestyNote).toMatch(/public-safe/i);
  });
});
