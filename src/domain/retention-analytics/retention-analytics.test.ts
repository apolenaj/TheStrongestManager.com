import { describe, expect, it } from "vitest";
import {
  RETENTION_HONESTY,
  RETENTION_WINDOWS,
  buildRetentionAnalyticsSnapshot,
  evaluateRetentionAthlete,
  isRetainedInWindow,
  summarizeRetentionCohort,
} from "@/domain/retention-analytics";

describe("retention analytics", () => {
  it("defines D1/D7/D30 and refuses automatic causation language", () => {
    expect(RETENTION_WINDOWS.map((w) => w.id)).toEqual(["d1", "d7", "d30"]);
    expect(RETENTION_HONESTY.join(" ")).toMatch(/causation/i);
    expect(RETENTION_HONESTY.join(" ")).toMatch(/[Cc]orrelation/);
  });

  it("scores window retention after signup day only", () => {
    const signedUpAt = new Date("2026-06-01T10:00:00.000Z");
    expect(
      isRetainedInWindow(signedUpAt, [new Date("2026-06-01T20:00:00.000Z")], 1),
    ).toBe(false);
    expect(
      isRetainedInWindow(signedUpAt, [new Date("2026-06-02T09:00:00.000Z")], 1),
    ).toBe(true);
    expect(
      isRetainedInWindow(signedUpAt, [new Date("2026-06-10T09:00:00.000Z")], 7),
    ).toBe(false);
    expect(
      isRetainedInWindow(signedUpAt, [new Date("2026-06-10T09:00:00.000Z")], 30),
    ).toBe(true);
  });

  it("evaluates feature reuse and subscription flags without inventing causation", () => {
    const signedUpAt = new Date("2026-06-01T10:00:00.000Z");
    const result = evaluateRetentionAthlete({
      userId: "u1",
      signedUpAt,
      onboardingCompletedAt: new Date("2026-06-01T12:00:00.000Z"),
      workoutCompletedAts: [
        new Date("2026-06-01T18:00:00.000Z"),
        new Date("2026-06-15T18:00:00.000Z"),
      ],
      techniqueUploadedAts: [new Date("2026-06-02T09:00:00.000Z")],
      subscription: {
        plan: "pro",
        status: "active",
        createdAt: signedUpAt,
        cancelAtPeriodEnd: false,
        currentPeriodEnd: new Date("2026-07-01T00:00:00.000Z"),
      },
    });
    expect(result.windows.d1).toBe(true);
    expect(result.windows.d30).toBe(true);
    expect(result.featureEarly.workouts).toBe(true);
    expect(result.featureReuse.workouts).toBe(true);
    expect(result.featureReuse.technique).toBe(false);
    expect(result.subscriptionPaid).toBe(true);
    expect(result.subscriptionStillEntitled).toBe(true);
    expect(result.earlyActions.workout_and_technique).toBe(true);
  });

  it("reports correlations as estimate_only / insufficient_sample, never causal winners", () => {
    const signedUpAt = new Date("2026-05-01T10:00:00.000Z");
    const results = Array.from({ length: 24 }, (_, i) =>
      evaluateRetentionAthlete({
        userId: `u${i}`,
        signedUpAt,
        onboardingCompletedAt:
          i % 2 === 0 ? new Date("2026-05-01T12:00:00.000Z") : null,
        workoutCompletedAts:
          i % 2 === 0
            ? [
                new Date("2026-05-02T12:00:00.000Z"),
                new Date("2026-05-20T12:00:00.000Z"),
              ]
            : [],
        techniqueUploadedAts: [],
        subscription: null,
      }),
    );
    const summary = summarizeRetentionCohort(results);
    expect(summary.decisionReady).toBe(true);
    expect(summary.windows.find((w) => w.id === "d30")?.retained).toBe(12);
    const corr = summary.correlations.find((c) => c.actionId === "first_workout");
    expect(corr).toBeDefined();
    expect(corr!.causationNote).toMatch(/causation/i);
    expect(["estimate_only", "insufficient_sample"]).toContain(corr!.status);
    expect(corr!.status).not.toBe("causal");

    const snap = buildRetentionAnalyticsSnapshot({
      results,
      generatedAt: "2026-07-22T00:00:00.000Z",
    });
    expect(snap.engineVersion).toBe("retention_analytics.v1");
  });
});
