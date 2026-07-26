import { describe, expect, it } from "vitest";
import {
  assembleWeeklyAthleteReview,
  previousWeekWindow,
  weekWindowContaining,
  type WeeklyWeekSignals,
} from "@/domain/weekly-review";

function emptySignals(
  overrides: Partial<WeeklyWeekSignals> & { window: WeeklyWeekSignals["window"] },
): WeeklyWeekSignals {
  return {
    completedSessions: 0,
    skippedProgramSessions: 0,
    programLinkedCompleted: 0,
    volumeKg: 0,
    volumeSetCount: 0,
    bestE1rmByLift: {},
    techniqueScores: [],
    recoveryReadiness: [],
    bodyweightKg: [],
    prLabels: [],
    ...overrides,
  };
}

describe("weekly athlete review", () => {
  it("summarizes this vs previous week without raw dumps", () => {
    const thisWindow = weekWindowContaining(new Date("2026-07-15T12:00:00"));
    const prevWindow = previousWeekWindow(thisWindow);

    const review = assembleWeeklyAthleteReview({
      now: new Date("2026-07-18T12:00:00"),
      unitsLabel: "kg",
      thisWeek: emptySignals({
        window: thisWindow,
        completedSessions: 4,
        programLinkedCompleted: 3,
        skippedProgramSessions: 1,
        volumeKg: 12000,
        volumeSetCount: 40,
        bestE1rmByLift: { Deadlift: 210 },
        techniqueScores: [72, 74],
        recoveryReadiness: [70, 72, 68, 71],
        bodyweightKg: [90, 89.5],
        prLabels: ["Deadlift 210 kg"],
      }),
      previousWeek: emptySignals({
        window: prevWindow,
        completedSessions: 3,
        programLinkedCompleted: 3,
        skippedProgramSessions: 0,
        volumeKg: 10000,
        volumeSetCount: 36,
        bestE1rmByLift: { Deadlift: 205 },
        techniqueScores: [70],
        recoveryReadiness: [65, 66, 64],
        bodyweightKg: [90.2],
        prLabels: [],
      }),
    });

    expect(review.sections).toHaveLength(8);
    expect(review.mainImprovement?.title).toMatch(/PR/i);
    expect(review.nextWeek.keep.length).toBeGreaterThan(0);
    expect(review.nextWeek.change.length).toBeGreaterThan(0);
    expect(review.nextWeek.watch.length).toBeGreaterThan(0);
    expect(review.sections.find((s) => s.id === "volume")?.deltaDisplay).toMatch(
      /↑/,
    );
    expect(review.week.inProgress).toBe(true);
  });

  it("does not claim recovery quality from thin check-ins", () => {
    const thisWindow = weekWindowContaining(new Date("2026-07-15T12:00:00"));
    const prevWindow = previousWeekWindow(thisWindow);

    const review = assembleWeeklyAthleteReview({
      now: thisWindow.weekEnd,
      unitsLabel: "kg",
      thisWeek: emptySignals({
        window: thisWindow,
        completedSessions: 2,
        recoveryReadiness: [40, 42],
      }),
      previousWeek: emptySignals({ window: prevWindow }),
    });

    const recovery = review.sections.find((s) => s.id === "recovery");
    expect(recovery?.summary).toMatch(/Only 2 readiness check-in/i);
    expect(recovery?.summary).not.toMatch(/poor/i);
    expect(review.biggestLimitation?.title).toMatch(/Thin recovery/i);
  });

  it("builds week keys consistently Monday→Sunday", () => {
    const w = weekWindowContaining(new Date("2026-07-15T12:00:00"));
    expect(w.weekStart.getDay()).toBe(1);
    expect(w.weekKey).toMatch(/^\d{4}-W\d{2}$/);
    const prev = previousWeekWindow(w);
    expect(prev.weekEnd.getTime()).toBe(w.weekStart.getTime());
  });
});
