import { describe, expect, it } from "vitest";
import {
  ACHIEVEMENT_CATALOG,
  ACHIEVEMENT_CATALOG_MAX,
  assertCatalogSize,
  countDistinctTrainingWeeks,
  evaluateAllAchievements,
  evaluateAchievement,
  techniqueImprovementDelta,
  type AchievementEvidence,
} from "@/domain/achievement";

const empty: AchievementEvidence = {
  completedSessionCount: 0,
  completedSessionAt: [],
  techniqueScoreCount: 0,
  techniqueScores: [],
  hasLoggedPr: false,
  hasCompletedCompetition: false,
};

describe("achievement system", () => {
  it("keeps the catalog small and meaningful", () => {
    expect(() => assertCatalogSize()).not.toThrow();
    expect(ACHIEVEMENT_CATALOG.length).toBeLessThanOrEqual(
      ACHIEVEMENT_CATALOG_MAX,
    );
    expect(ACHIEVEMENT_CATALOG.map((a) => a.id)).toEqual(
      expect.arrayContaining([
        "first_workout",
        "first_technique_analysis",
        "workouts_10",
        "technique_plus_10",
        "first_pr",
        "consistency_12_weeks",
        "competition_completed",
      ]),
    );
  });

  it("unlocks first workout and 10 workouts from session counts", () => {
    expect(
      evaluateAchievement("first_workout", {
        ...empty,
        completedSessionCount: 1,
      }).unlocked,
    ).toBe(true);
    expect(
      evaluateAchievement("workouts_10", {
        ...empty,
        completedSessionCount: 9,
      }).unlocked,
    ).toBe(false);
    expect(
      evaluateAchievement("workouts_10", {
        ...empty,
        completedSessionCount: 10,
      }).unlocked,
    ).toBe(true);
  });

  it("requires scored technique analysis for first technique", () => {
    expect(
      evaluateAchievement("first_technique_analysis", empty).unlocked,
    ).toBe(false);
    expect(
      evaluateAchievement("first_technique_analysis", {
        ...empty,
        techniqueScoreCount: 1,
      }).unlocked,
    ).toBe(true);
  });

  it("measures technique +10 improvement", () => {
    expect(techniqueImprovementDelta([60, 65, 72])).toBe(12);
    expect(
      evaluateAchievement("technique_plus_10", {
        ...empty,
        techniqueScores: [60, 65, 72],
      }).unlocked,
    ).toBe(true);
  });

  it("counts distinct training weeks for 12-week consistency", () => {
    const weeks = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(Date.UTC(2026, 0, 5 + i * 7));
      return d.toISOString();
    });
    expect(countDistinctTrainingWeeks(weeks)).toBe(12);
    expect(
      evaluateAchievement("consistency_12_weeks", {
        ...empty,
        completedSessionAt: weeks,
      }).unlocked,
    ).toBe(true);
  });

  it("gates first PR and competition on real flags", () => {
    expect(evaluateAchievement("first_pr", empty).unlocked).toBe(false);
    expect(
      evaluateAchievement("first_pr", { ...empty, hasLoggedPr: true })
        .unlocked,
    ).toBe(true);
    expect(
      evaluateAchievement("competition_completed", {
        ...empty,
        hasCompletedCompetition: true,
      }).unlocked,
    ).toBe(true);
  });

  it("does not invent unlocks when evidence is empty", () => {
    const all = evaluateAllAchievements(empty);
    expect(all.every((a) => !a.unlocked)).toBe(true);
  });
});
