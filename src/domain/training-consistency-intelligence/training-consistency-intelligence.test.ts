import { describe, expect, it } from "vitest";
import {
  TRAINING_CONSISTENCY_HONESTY,
  analyzeTrainingConsistency,
  buildDeloadContexts,
  buildInjuryBreakContexts,
  buildPlanDaysFromTemplate,
  buildProgramChangeContexts,
} from "@/domain/training-consistency-intelligence";

describe("training-consistency-intelligence", () => {
  it("measures plan adherence, not gym days", () => {
    expect(TRAINING_CONSISTENCY_HONESTY.join(" ")).toMatch(/not days in the gym/i);
    expect(TRAINING_CONSISTENCY_HONESTY.join(" ")).toMatch(/blindly/i);
  });

  it("honors planned rest and does not reward rest-day gym sessions", () => {
    const planDays = buildPlanDaysFromTemplate({
      windowStartKey: "2026-01-05", // Mon
      windowEndKey: "2026-01-11", // Sun
      templateDays: [
        { dayIndex: 1, workoutId: "w1", name: "Lower", weekLabel: null },
        { dayIndex: 3, workoutId: "w2", name: "Upper", weekLabel: null },
        { dayIndex: 5, workoutId: "w3", name: "Full", weekLabel: null },
        // Tue/Thu/Sat/Sun → rest
      ],
    });

    const analysis = analyzeTrainingConsistency({
      windowLabel: "7 days",
      openDayKey: "2026-01-12",
      planDays,
      sessions: [
        { dayKey: "2026-01-05", status: "completed", programLinked: true },
        { dayKey: "2026-01-07", status: "completed", programLinked: true },
        { dayKey: "2026-01-09", status: "completed", programLinked: true },
        // Extra gym on planned rest Tuesday
        { dayKey: "2026-01-06", status: "completed", programLinked: false },
      ],
      contexts: [],
    });

    expect(analysis.publishable).toBe(true);
    expect(analysis.plannedRestHonored).toBeGreaterThan(0);
    expect(analysis.extraGymSessions).toBe(1);
    expect(analysis.missedDays).toBe(0);
    // Extra session must not raise adherence above on-plan follow-through
    expect(analysis.adherencePct).toBe(100);
    expect(analysis.narrativeLines.some((l) => /extra/i.test(l))).toBe(true);
  });

  it("does not treat deload / injury / program-change skips as misses", () => {
    const planDays = buildPlanDaysFromTemplate({
      windowStartKey: "2026-02-02",
      windowEndKey: "2026-02-08",
      templateDays: [
        { dayIndex: 1, workoutId: "w1", name: "A", weekLabel: null },
        { dayIndex: 2, workoutId: "w2", name: "B", weekLabel: null },
        { dayIndex: 3, workoutId: "w3", name: "C", weekLabel: null },
        { dayIndex: 4, workoutId: "w4", name: "D", weekLabel: null },
        { dayIndex: 5, workoutId: "w5", name: "E", weekLabel: null },
      ],
    });

    const deload = buildDeloadContexts({
      adaptations: [
        {
          changeKind: "deload",
          status: "accepted",
          decidedAt: "2026-02-02T10:00:00.000Z",
          appliedAt: "2026-02-02T10:00:00.000Z",
          createdAt: "2026-02-01T10:00:00.000Z",
        },
      ],
    });
    const injury = buildInjuryBreakContexts({
      breaks: [
        {
          startAt: "2026-02-05T00:00:00.000Z",
          endAt: "2026-02-08T00:00:00.000Z",
          label: "Knee flare pause",
        },
      ],
    });
    const change = buildProgramChangeContexts({
      versions: [{ createdAt: "2026-02-02T08:00:00.000Z", versionNumber: 2 }],
    });

    const analysis = analyzeTrainingConsistency({
      windowLabel: "7 days",
      openDayKey: "2026-02-09",
      planDays,
      sessions: [
        { dayKey: "2026-02-02", status: "skipped", programLinked: true },
        { dayKey: "2026-02-03", status: "skipped", programLinked: true },
        { dayKey: "2026-02-04", status: "skipped", programLinked: true },
        { dayKey: "2026-02-05", status: "skipped", programLinked: true },
        { dayKey: "2026-02-06", status: "skipped", programLinked: true },
      ],
      contexts: [...deload, ...injury, ...change],
    });

    expect(analysis.missedDays).toBe(0);
    expect(analysis.contextAdjustedDays).toBeGreaterThan(0);
    expect(analysis.adherencePct).toBe(100);
  });

  it("counts uncontextualized skips as misses", () => {
    const planDays = buildPlanDaysFromTemplate({
      windowStartKey: "2026-03-02",
      windowEndKey: "2026-03-08",
      templateDays: [
        { dayIndex: 1, workoutId: "w1", name: "A", weekLabel: null },
        { dayIndex: 3, workoutId: "w2", name: "B", weekLabel: null },
        { dayIndex: 5, workoutId: "w3", name: "C", weekLabel: null },
      ],
    });

    const analysis = analyzeTrainingConsistency({
      windowLabel: "7 days",
      openDayKey: "2026-03-09",
      planDays,
      sessions: [
        { dayKey: "2026-03-02", status: "completed", programLinked: true },
        { dayKey: "2026-03-04", status: "skipped", programLinked: true },
        { dayKey: "2026-03-06", status: "completed", programLinked: true },
      ],
      contexts: [],
    });

    expect(analysis.missedDays).toBe(1);
    expect(analysis.publishable).toBe(true);
    expect(analysis.adherencePct).toBeLessThan(100);
  });

  it("suppresses score without enough resolvable plan days", () => {
    const analysis = analyzeTrainingConsistency({
      windowLabel: "2 days",
      openDayKey: "2026-04-03",
      planDays: [
        { dayKey: "2026-04-01", expectation: "training", dayName: "A" },
        { dayKey: "2026-04-02", expectation: "rest", dayName: null },
      ],
      sessions: [
        { dayKey: "2026-04-01", status: "completed", programLinked: true },
      ],
      contexts: [],
    });
    expect(analysis.publishable).toBe(false);
    expect(analysis.adherencePct).toBeNull();
  });
});
