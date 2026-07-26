import { describe, expect, it } from "vitest";
import { assembleCompetitionMode } from "@/domain/competition-mode/assemble";
import { buildAttemptPlans } from "@/domain/competition-mode/attempts";
import {
  formatCountdown,
  resolveCompetitionPhase,
} from "@/domain/competition-mode/phases";
import { buildWeightCutGuidance } from "@/domain/competition-mode/weight-cut";
import type { CompetitionModeSignals } from "@/domain/competition-mode/types";

const NOW = new Date("2026-07-21T12:00:00.000Z");

function daysFromNow(n: number): Date {
  return new Date(NOW.getTime() + n * 24 * 60 * 60 * 1000);
}

function baseSignals(
  overrides: Partial<CompetitionModeSignals> = {},
): CompetitionModeSignals {
  return {
    competition: {
      id: "c1",
      sport: "powerlifting",
      name: "Local meet",
      competitionDate: daysFromNow(28),
      weightClassLabel: "83 kg",
      weightClassLimitKg: 83,
      targets: {
        squatKg: 200,
        benchKg: 140,
        deadliftKg: 250,
        notes: null,
      },
      status: "active",
    },
    liftEstimates: [
      { lift: "squat", rangeKg: { low: 190, high: 198 } },
      { lift: "bench", rangeKg: { low: 132, high: 138 } },
      { lift: "deadlift", rangeKg: { low: 240, high: 248 } },
    ],
    lastHeavySession: {
      at: daysFromNow(-5),
      exerciseLabel: "Deadlift",
      loadKg: 230,
      reps: 2,
      rpe: 8.5,
    },
    bodyweight: { latestKg: 84.2, kgPerWeek: 0.1, sampleCount: 4 },
    readiness: { latest: 72, confidence: "medium", fatigue: 4 },
    ...overrides,
  };
}

describe("resolveCompetitionPhase", () => {
  it("maps days-out to phases", () => {
    expect(resolveCompetitionPhase(60)).toBe("build");
    expect(resolveCompetitionPhase(30)).toBe("intensification");
    expect(resolveCompetitionPhase(14)).toBe("peaking");
    expect(resolveCompetitionPhase(7)).toBe("taper");
    expect(resolveCompetitionPhase(2)).toBe("meet_week");
    expect(resolveCompetitionPhase(-1)).toBe("post_meet");
  });
});

describe("buildAttemptPlans", () => {
  it("returns squat/bench/deadlift for powerlifting", () => {
    const plans = buildAttemptPlans(
      "powerlifting",
      { squatKg: 200, benchKg: 140, deadliftKg: 250, notes: null },
      [
        { lift: "deadlift", rangeKg: { low: 240, high: 248 } },
        { lift: "squat", rangeKg: { low: 190, high: 198 } },
        { lift: "bench", rangeKg: { low: 130, high: 136 } },
      ],
    );
    expect(plans).toHaveLength(3);
    const dl = plans.find((p) => p.lift === "deadlift")!;
    expect(dl.openerKg).toBeLessThan(dl.secondKg!);
    expect(dl.secondKg).toBeLessThanOrEqual(dl.thirdKg!);
  });

  it("only plans deadlift for deadlift-only meets", () => {
    const plans = buildAttemptPlans(
      "deadlift_only",
      { squatKg: null, benchKg: null, deadliftKg: 300, notes: null },
      [{ lift: "deadlift", rangeKg: { low: 290, high: 300 } }],
    );
    expect(plans).toHaveLength(1);
    expect(plans[0]!.lift).toBe("deadlift");
  });
});

describe("buildWeightCutGuidance", () => {
  it("never auto-prescribes dehydration", () => {
    const g = buildWeightCutGuidance(83, {
      latestKg: 88,
      kgPerWeek: -0.2,
      sampleCount: 3,
    });
    expect(g.autoPrescribesDehydration).toBe(false);
    expect(g.stance).toBe("high_risk_no_protocol");
    expect(g.safetyWarnings.some((w) => /dehydration/i.test(w))).toBe(true);
    expect(g.detail).not.toMatch(/sauna protocol|water cut schedule/i);
  });

  it("treats on-or-under without cut advice", () => {
    const g = buildWeightCutGuidance(83, {
      latestKg: 82.5,
      kgPerWeek: 0,
      sampleCount: 2,
    });
    expect(g.stance).toBe("on_or_under");
    expect(g.autoPrescribesDehydration).toBe(false);
  });
});

describe("assembleCompetitionMode", () => {
  it("builds countdown, phase, taper, attempts, readiness", () => {
    const view = assembleCompetitionMode(baseSignals(), NOW);
    expect(view.countdown.past).toBe(false);
    expect(view.countdown.days).toBe(28);
    expect(view.trainingPhase.id).toBe("intensification");
    expect(view.taper.illustrativeOnly).toBe(true);
    expect(view.attemptPlans.length).toBe(3);
    expect(view.lastHeavySession?.summary).toMatch(/230/);
    expect(view.weightCut.autoPrescribesDehydration).toBe(false);
    expect(view.readiness.latest).toBe(72);
    expect(view.strongmanNotice).toBeNull();
  });

  it("shows strongman coming-later notice", () => {
    const view = assembleCompetitionMode(
      baseSignals({
        competition: {
          ...baseSignals().competition,
          sport: "strongman",
        },
      }),
      NOW,
    );
    expect(view.strongmanNotice).toMatch(/later/i);
  });

  it("formats meet-day countdown", () => {
    expect(formatCountdown(0).label).toBe("Competition day");
  });
});
