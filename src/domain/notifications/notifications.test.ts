import { describe, expect, it } from "vitest";
import {
  assembleSmartNotifications,
  buildNotificationCandidates,
  defaultNotificationPreferences,
  isRecoveryTrendDeclining,
  type SmartNotificationSignals,
} from "@/domain/notifications";

function signals(
  overrides: Partial<SmartNotificationSignals> = {},
): SmartNotificationSignals {
  return {
    now: new Date("2026-07-21T12:00:00Z"),
    todayKey: "2026-07-21",
    timeZone: "UTC",
    workoutToday: {
      hasPlannedOrInProgress: true,
      sessionId: "s1",
      title: "Lower intensity",
    },
    technique: {
      lastCompletedAt: new Date("2026-06-01T12:00:00Z"),
      analysisId: "t1",
    },
    competition: {
      prepId: "c1",
      name: "Local meet",
      daysUntil: 14,
    },
    weeklyReview: {
      weekKey: "2026-W30",
      reviewId: "w1",
      summary: "Volume held steady.",
      createdAt: new Date("2026-07-21T08:00:00Z"),
    },
    recovery: {
      trendDeclining: true,
      recentMean: 55,
      priorMean: 72,
    },
    recentPr: {
      metricKey: "e1rm_squat",
      label: "Squat e1RM",
      valueLabel: "180 kg",
      recordedAt: new Date("2026-07-21T10:00:00Z"),
      metricId: "m1",
    },
    ...overrides,
  };
}

describe("smart notifications", () => {
  it("builds the example useful notification set", () => {
    const candidates = buildNotificationCandidates(signals());
    const titles = candidates.map((c) => c.title);
    expect(titles).toContain("Workout today");
    expect(titles).toContain("Technique re-analysis due");
    expect(titles).toContain("Competition in 14 days");
    expect(titles).toContain("Weekly review ready");
    expect(titles).toContain("Recovery trend declining");
    expect(titles).toContain("PR achieved");
  });

  it("avoids spam via mute, daily cap, and dedupe", () => {
    const prefs = defaultNotificationPreferences();
    prefs.frequency = "muted";
    const muted = assembleSmartNotifications({
      signals: signals(),
      prefs,
      recent: [],
    });
    expect(muted.accepted).toHaveLength(0);
    expect(muted.suppressed.length).toBeGreaterThan(0);

    const open = defaultNotificationPreferences();
    open.maxPerDay = 2;
    const capped = assembleSmartNotifications({
      signals: signals(),
      prefs: open,
      recent: [],
    });
    expect(capped.accepted.length).toBeLessThanOrEqual(2);
    expect(capped.accepted[0]?.kind).toBe("pr_achieved");

    const deduped = assembleSmartNotifications({
      signals: signals(),
      prefs: defaultNotificationPreferences(),
      recent: [
        {
          kind: "workout_today",
          dedupeKey: "workout_today:2026-07-21",
          createdAt: new Date("2026-07-21T08:00:00Z"),
        },
      ],
    });
    expect(
      deduped.accepted.find((a) => a.kind === "workout_today"),
    ).toBeUndefined();
  });

  it("detects recovery decline without inventing data", () => {
    expect(isRecoveryTrendDeclining([50, 52], [70, 72]).declining).toBe(true);
    expect(isRecoveryTrendDeclining([70], [72]).declining).toBe(false);
  });
});
