import { describe, expect, it } from "vitest";
import {
  ACTIVATION_CRITERIA,
  ACTIVATION_HONESTY,
  ACTIVATION_VANITY_METRICS,
  buildActivationMetricsSnapshot,
  evaluateAthleteActivation,
  hasReturnedWithinSevenDays,
  summarizeActivationCohort,
} from "@/domain/activation-metrics";

describe("activation metrics", () => {
  it("defines the four required criteria and rejects vanity-only KPIs", () => {
    expect(ACTIVATION_CRITERIA.map((c) => c.id)).toEqual([
      "onboarding_completed",
      "first_workout_logged",
      "first_technique_uploaded",
      "returned_within_seven_days",
    ]);
    expect(ACTIVATION_VANITY_METRICS.map((v) => v.id)).toEqual(
      expect.arrayContaining([
        "pageviews",
        "signup_started_only",
        "pricing_viewed",
      ]),
    );
    expect(ACTIVATION_HONESTY.join(" ")).toMatch(/Vanity/i);
  });

  it("requires all four criteria for full activation", () => {
    const signedUpAt = new Date("2026-07-01T10:00:00.000Z");
    const partial = evaluateAthleteActivation({
      userId: "u1",
      signedUpAt,
      onboardingCompletedAt: new Date("2026-07-01T11:00:00.000Z"),
      firstWorkoutCompletedAt: new Date("2026-07-01T18:00:00.000Z"),
      firstTechniqueUploadedAt: null,
      activityTimestamps: [new Date("2026-07-01T18:00:00.000Z")],
    });
    expect(partial.fullyActivated).toBe(false);
    expect(partial.criteria.first_technique_uploaded).toBe(false);

    const full = evaluateAthleteActivation({
      userId: "u2",
      signedUpAt,
      onboardingCompletedAt: new Date("2026-07-01T11:00:00.000Z"),
      firstWorkoutCompletedAt: new Date("2026-07-01T18:00:00.000Z"),
      firstTechniqueUploadedAt: new Date("2026-07-02T12:00:00.000Z"),
      activityTimestamps: [
        new Date("2026-07-01T18:00:00.000Z"),
        new Date("2026-07-02T12:00:00.000Z"),
      ],
    });
    expect(full.fullyActivated).toBe(true);
    expect(full.criteria.returned_within_seven_days).toBe(true);
  });

  it("treats same-day-only activity as not returned", () => {
    const signedUpAt = new Date("2026-07-01T10:00:00.000Z");
    const sameDay = hasReturnedWithinSevenDays(signedUpAt, [
      new Date("2026-07-01T22:00:00.000Z"),
    ]);
    expect(sameDay.returned).toBe(false);

    const nextDay = hasReturnedWithinSevenDays(signedUpAt, [
      new Date("2026-07-02T09:00:00.000Z"),
    ]);
    expect(nextDay.returned).toBe(true);

    const tooLate = hasReturnedWithinSevenDays(signedUpAt, [
      new Date("2026-07-10T09:00:00.000Z"),
    ]);
    expect(tooLate.returned).toBe(false);
  });

  it("summarizes cohorts without inventing decision-ready rates on tiny n", () => {
    const signedUpAt = new Date("2026-07-01T10:00:00.000Z");
    const results = [
      evaluateAthleteActivation({
        userId: "a",
        signedUpAt,
        onboardingCompletedAt: signedUpAt,
        firstWorkoutCompletedAt: null,
        firstTechniqueUploadedAt: null,
        activityTimestamps: [],
      }),
    ];
    const summary = summarizeActivationCohort(results);
    expect(summary.decisionReady).toBe(false);
    expect(summary.totals.onboardingCompleted).toBe(1);
    expect(summary.totals.fullyActivated).toBe(0);

    const snap = buildActivationMetricsSnapshot({
      results,
      generatedAt: "2026-07-22T00:00:00.000Z",
    });
    expect(snap.engineVersion).toBe("activation_metrics.v1");
    expect(snap.cohort.totals.signedUp).toBe(1);
  });
});
