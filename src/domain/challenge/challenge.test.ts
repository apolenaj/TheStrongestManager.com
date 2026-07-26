import { describe, expect, it } from "vitest";
import {
  assertCatalogSafety,
  buildOptionalChallengeLeaderboard,
  CHALLENGE_CATALOG,
  CHALLENGE_FORBIDDEN_KINDS,
  computeChallengeProgress,
  getChallengeBySlug,
  isForbiddenChallengeKind,
  resolveCompletionBadge,
} from "@/domain/challenge";

describe("challenge engine", () => {
  it("ships safe catalog examples without forbidden kinds", () => {
    expect(() => assertCatalogSafety()).not.toThrow();
    expect(getChallengeBySlug("30-day-technique")?.title).toContain(
      "Technique",
    );
    expect(getChallengeBySlug("100-workout-consistency")).toBeTruthy();
    expect(
      getChallengeBySlug("deadlift-technique-improvement")?.rewardPillar,
    ).toBe("improvement");
    for (const f of CHALLENGE_FORBIDDEN_KINDS) {
      expect(isForbiddenChallengeKind(f)).toBe(true);
    }
    expect(isForbiddenChallengeKind("technique_habit")).toBe(false);
  });

  it("counts technique days for 30-day challenge", () => {
    const def = getChallengeBySlug("30-day-technique")!;
    const result = computeChallengeProgress(def, {
      techniqueDays: [
        "2026-07-01T10:00:00.000Z",
        "2026-07-01T18:00:00.000Z",
        "2026-07-02T10:00:00.000Z",
      ],
      completedSessionAt: [],
      techniqueScores: [],
      academyLessonCompletedAt: [],
      startedAt: "2026-07-01T00:00:00.000Z",
      now: "2026-07-10T00:00:00.000Z",
    });
    expect(result.currentValue).toBe(2);
    expect(result.completed).toBe(false);
  });

  it("completes session consistency at target", () => {
    const def = getChallengeBySlug("100-workout-consistency")!;
    const sessions = Array.from({ length: 100 }, (_, i) =>
      new Date(Date.UTC(2026, 0, 1 + i)).toISOString(),
    );
    const result = computeChallengeProgress(def, {
      techniqueDays: [],
      completedSessionAt: sessions,
      techniqueScores: [],
      academyLessonCompletedAt: [],
      startedAt: "2026-01-01T00:00:00.000Z",
      now: "2026-06-01T00:00:00.000Z",
    });
    expect(result.completed).toBe(true);
    expect(resolveCompletionBadge(def.completionBadgeId, true)?.label).toBe(
      "100 Workouts",
    );
  });

  it("measures technique improvement delta", () => {
    const def = getChallengeBySlug("deadlift-technique-improvement")!;
    const result = computeChallengeProgress(def, {
      techniqueDays: [],
      completedSessionAt: [],
      techniqueScores: [60, 62, 68],
      academyLessonCompletedAt: [],
      startedAt: "2026-07-01T00:00:00.000Z",
      now: "2026-07-15T00:00:00.000Z",
    });
    expect(result.currentValue).toBe(8);
    expect(result.completed).toBe(true);
  });

  it("omits leaderboard when disabled", () => {
    const def = CHALLENGE_CATALOG.find((c) => !c.leaderboardEnabled)!;
    expect(
      buildOptionalChallengeLeaderboard(def, [
        {
          athleteProfileId: "a",
          displayLabel: "A",
          progressValue: 10,
          completed: false,
        },
      ]),
    ).toBeNull();
  });

  it("builds optional leaderboard only when enabled", () => {
    const def = getChallengeBySlug("100-workout-consistency")!;
    const board = buildOptionalChallengeLeaderboard(def, [
      {
        athleteProfileId: "b",
        displayLabel: "B",
        progressValue: 40,
        completed: false,
      },
      {
        athleteProfileId: "a",
        displayLabel: "A",
        progressValue: 100,
        completed: true,
      },
    ]);
    expect(board?.[0]?.athleteProfileId).toBe("a");
  });

  it("never awards badge without completion", () => {
    expect(
      resolveCompletionBadge("badge_100_workouts", false),
    ).toBeNull();
  });
});
