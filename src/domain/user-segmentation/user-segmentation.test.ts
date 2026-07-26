import { describe, expect, it } from "vitest";
import {
  USER_SEGMENTATION_HONESTY,
  USER_SEGMENTATION_SENSITIVE_DENYLIST,
  USER_SEGMENTS,
  assertSegmentSignalAllowed,
  assignUserSegments,
  buildUserSegmentationSnapshot,
  isHighEngagement,
  summarizeUserSegmentationCohort,
} from "@/domain/user-segmentation";

describe("user segmentation", () => {
  it("defines prompt segments and denies sensitive demographics", () => {
    expect(USER_SEGMENTS.map((s) => s.id)).toEqual([
      "beginner",
      "advanced",
      "powerlifting",
      "bodybuilding",
      "coach",
      "paid",
      "high_engagement",
    ]);
    expect(USER_SEGMENTATION_SENSITIVE_DENYLIST).toEqual(
      expect.arrayContaining(["sex", "birthYear", "age", "bodyweight"]),
    );
    expect(assertSegmentSignalAllowed("sex").ok).toBe(false);
    expect(assertSegmentSignalAllowed("experienceLevel").ok).toBe(true);
    expect(USER_SEGMENTATION_HONESTY.join(" ")).toMatch(/demographic/i);
  });

  it("assigns multi-label segments from product context and behavior", () => {
    const now = new Date("2026-07-20T12:00:00.000Z");
    const result = assignUserSegments({
      userId: "u1",
      experienceLevel: "beginner",
      primaryDiscipline: "powerlifting",
      preferredSports: ["powerlifting"],
      isCoach: false,
      subscriptionPlan: "pro",
      subscriptionStatus: "active",
      workoutCompletedAts: [
        new Date("2026-07-18T12:00:00.000Z"),
        new Date("2026-07-16T12:00:00.000Z"),
        new Date("2026-07-14T12:00:00.000Z"),
      ],
      techniqueUploadedAts: [],
      now,
    });
    expect(result.segments).toEqual(
      expect.arrayContaining([
        "beginner",
        "powerlifting",
        "paid",
        "high_engagement",
      ]),
    );
    expect(result.flags.advanced).toBe(false);
    expect(result.flags.bodybuilding).toBe(false);
    expect(result.flags.coach).toBe(false);
  });

  it("detects coach and bodybuilding without demographic fields", () => {
    const result = assignUserSegments({
      userId: "u2",
      experienceLevel: "advanced",
      primaryDiscipline: "bodybuilding",
      preferredSports: ["bodybuilding"],
      isCoach: true,
      subscriptionPlan: "free",
      subscriptionStatus: "active",
      workoutCompletedAts: [],
      techniqueUploadedAts: [],
      now: new Date("2026-07-20T12:00:00.000Z"),
    });
    expect(result.flags.advanced).toBe(true);
    expect(result.flags.bodybuilding).toBe(true);
    expect(result.flags.coach).toBe(true);
    expect(result.flags.paid).toBe(false);
    expect(result.flags.high_engagement).toBe(false);
  });

  it("requires recent workouts for high engagement", () => {
    const now = new Date("2026-07-20T12:00:00.000Z");
    expect(
      isHighEngagement({
        workoutCompletedAts: [new Date("2026-06-01T12:00:00.000Z")],
        techniqueUploadedAts: [],
        now,
      }),
    ).toBe(false);
    expect(
      isHighEngagement({
        workoutCompletedAts: [
          new Date("2026-07-19T12:00:00.000Z"),
          new Date("2026-07-17T12:00:00.000Z"),
        ],
        techniqueUploadedAts: [new Date("2026-07-18T12:00:00.000Z")],
        now,
      }),
    ).toBe(true);
  });

  it("summarizes cohort multi-label counts", () => {
    const now = new Date("2026-07-20T12:00:00.000Z");
    const results = [
      assignUserSegments({
        userId: "a",
        experienceLevel: "beginner",
        primaryDiscipline: null,
        preferredSports: [],
        isCoach: false,
        subscriptionPlan: null,
        subscriptionStatus: null,
        workoutCompletedAts: [],
        techniqueUploadedAts: [],
        now,
      }),
      assignUserSegments({
        userId: "b",
        experienceLevel: "elite",
        primaryDiscipline: "powerlifting",
        preferredSports: [],
        isCoach: false,
        subscriptionPlan: "performance",
        subscriptionStatus: "trialing",
        workoutCompletedAts: [],
        techniqueUploadedAts: [],
        now,
      }),
    ];
    const summary = summarizeUserSegmentationCohort(results);
    expect(summary.cohortSize).toBe(2);
    expect(summary.rows.find((r) => r.id === "beginner")?.count).toBe(1);
    expect(summary.rows.find((r) => r.id === "advanced")?.count).toBe(1);
    expect(summary.rows.find((r) => r.id === "paid")?.count).toBe(1);
    expect(summary.multiSegmentCount).toBe(1);

    const snap = buildUserSegmentationSnapshot({
      results,
      generatedAt: "2026-07-22T00:00:00.000Z",
    });
    expect(snap.engineVersion).toBe("user_segmentation.v1");
  });
});
