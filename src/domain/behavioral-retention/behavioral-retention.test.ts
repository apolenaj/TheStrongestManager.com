import { describe, expect, it } from "vitest";
import {
  BEHAVIORAL_RETENTION_HONESTY,
  RETENTION_FORBIDDEN_PATTERNS,
  assembleBehavioralRetention,
  computeOnPlanStreak,
  resolveRetentionDay,
  type BehavioralRetentionSignals,
  type RetentionDaySignal,
} from "@/domain/behavioral-retention";

function day(
  dayKey: string,
  resolution: RetentionDaySignal["resolution"],
): RetentionDaySignal {
  return { dayKey, resolution, sessionCount: resolution === "planned_rest" ? 0 : 1 };
}

function base(
  overrides: Partial<BehavioralRetentionSignals> = {},
): BehavioralRetentionSignals {
  return {
    now: new Date("2026-07-21T12:00:00Z"),
    lookbackDays: 14,
    days: [
      day("2026-07-21", "completed"),
      day("2026-07-20", "planned_rest"),
      day("2026-07-19", "completed"),
      day("2026-07-18", "planned_rest"),
      day("2026-07-17", "completed"),
    ],
    weeklyReview: {
      hasCurrentWeekReview: true,
      weekKey: "2026-W30",
      summary: "Solid week.",
    },
    goal: {
      title: "Add 10 kg to squat",
      category: "strength",
      progressLabel: "improving",
      hasLoggedProgress: true,
    },
    technique: {
      sampleCount: 4,
      delta: 6.5,
      direction: "improved",
    },
    ...overrides,
  };
}

describe("behavioral retention", () => {
  it("treats planned rest as follow-through, not a streak break", () => {
    expect(resolveRetentionDay({ completed: 0, skipped: 0, inProgress: 0, planned: 0 })).toBe(
      "planned_rest",
    );
    expect(resolveRetentionDay({ completed: 0, skipped: 1, inProgress: 0, planned: 0 })).toBe(
      "missed",
    );

    const { streakDays, plannedRestInStreak } = computeOnPlanStreak([
      day("2026-07-21", "completed"),
      day("2026-07-20", "planned_rest"),
      day("2026-07-19", "completed"),
      day("2026-07-18", "missed"),
    ]);
    expect(streakDays).toBe(3);
    expect(plannedRestInStreak).toBe(1);
  });

  it("assembles workout, weekly review, goal, and technique loops", () => {
    const payload = assembleBehavioralRetention(base());
    expect(payload.loops.map((l) => l.id)).toEqual([
      "workout_streak",
      "weekly_review",
      "goal_progress",
      "technique_improvement",
    ]);
    expect(payload.onPlanStreakDays).toBeGreaterThanOrEqual(3);
    expect(payload.plannedRestDaysInStreak).toBeGreaterThan(0);
    expect(payload.loops.find((l) => l.id === "workout_streak")?.headline).toMatch(
      /rest/i,
    );
    expect(payload.loops.find((l) => l.id === "weekly_review")?.status).toBe(
      "celebrating",
    );
    expect(payload.loops.find((l) => l.id === "goal_progress")?.headline).toMatch(
      /improving/i,
    );
    expect(
      payload.loops.find((l) => l.id === "technique_improvement")?.status,
    ).toBe("celebrating");
  });

  it("never uses dark-pattern or rest-punishment language", () => {
    const payload = assembleBehavioralRetention(base());
    const claimText = [
      payload.summaryLine ?? "",
      ...payload.loops.flatMap((l) => [l.headline, l.detail, l.nudge ?? ""]),
    ]
      .join("\n")
      .toLowerCase();

    expect(claimText).not.toMatch(/lose your streak/i);
    expect(claimText).not.toMatch(/you'll lose/i);
    expect(claimText).not.toMatch(/streak at risk/i);
    expect(claimText).not.toMatch(/don't rest/i);
    expect(claimText).not.toMatch(/skip your rest/i);
    expect(claimText).not.toMatch(/daily login points/i);
    expect(claimText).not.toMatch(/only hours left/i);

    expect(BEHAVIORAL_RETENTION_HONESTY.join(" ")).toMatch(/planned rest/i);
    expect(BEHAVIORAL_RETENTION_HONESTY.join(" ")).toMatch(/dark patterns/i);
    for (const pattern of RETENTION_FORBIDDEN_PATTERNS) {
      expect(isForbiddenRetentionPatternAbsent(payload, pattern)).toBe(true);
    }
  });
});

/** Forbidden ids must not appear as product claims (honesty may deny them). */
function isForbiddenRetentionPatternAbsent(
  payload: ReturnType<typeof assembleBehavioralRetention>,
  pattern: string,
): boolean {
  const claimText = [
    payload.summaryLine ?? "",
    ...payload.loops.flatMap((l) => [l.headline, l.detail, l.nudge ?? ""]),
  ]
    .join("\n")
    .toLowerCase();
  if (pattern === "lose_your_streak") {
    return !claimText.includes("lose your streak");
  }
  if (pattern === "punish_rest" || pattern === "skip_recovery") {
    return (
      !claimText.includes("skip your rest") && !claimText.includes("don't rest")
    );
  }
  if (pattern === "streak_guilt") {
    return !claimText.includes("you should feel");
  }
  if (pattern === "fake_urgency" || pattern === "countdown_to_shame") {
    return (
      !claimText.includes("hurry") && !claimText.includes("only hours left")
    );
  }
  if (pattern === "daily_login_points") {
    return !claimText.includes("login points");
  }
  if (pattern === "dark_pattern") {
    return !claimText.includes("act now or lose");
  }
  return true;
}