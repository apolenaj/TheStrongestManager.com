import { describe, expect, it } from "vitest";
import {
  ONBOARDING_PATH_HONESTY,
  applyOnboardingPathSeed,
  getOnboardingPathVisibility,
  isDetailSectionVisible,
} from "@/domain/onboarding-paths";

const emptyDraft = {
  pathId: null as null,
  primaryGoalId: null,
  experienceLevelId: null,
  sports: [] as [],
  lifts: {},
  competitionDate: null,
  currentProgramNote: null,
  recentHistory: null,
  recoveryHabits: null,
  bodyweightKg: null,
  heightCm: null,
  daysPerWeek: null,
  equipment: [] as [],
};

describe("onboarding paths", () => {
  it("keeps beginner simple — no PRs, meet, or program questions", () => {
    const v = getOnboardingPathVisibility("beginner");
    expect(v.detailSections).toEqual(["frequency", "equipment"]);
    expect(isDetailSectionVisible("beginner", "lifts")).toBe(false);
    expect(isDetailSectionVisible("beginner", "competition_date")).toBe(false);
    expect(isDetailSectionVisible("beginner", "current_program")).toBe(false);
    expect(v.goalIds).not.toContain("powerlifting");
  });

  it("lets experienced / powerlifter / strongman ask advanced optional fields", () => {
    for (const path of ["experienced", "powerlifter", "strongman"] as const) {
      expect(isDetailSectionVisible(path, "lifts")).toBe(true);
      expect(isDetailSectionVisible(path, "competition_date")).toBe(true);
      expect(isDetailSectionVisible(path, "current_program")).toBe(true);
    }
    expect(isDetailSectionVisible("bodybuilder", "current_program")).toBe(true);
    expect(isDetailSectionVisible("bodybuilder", "competition_date")).toBe(
      false,
    );
    expect(isDetailSectionVisible("bodybuilder", "lifts")).toBe(false);
  });

  it("coach path skips athlete details and enables coach redirect", () => {
    const v = getOnboardingPathVisibility("coach");
    expect(v.showDetailsStep).toBe(false);
    expect(v.showGoalStep).toBe(false);
    expect(v.showExperienceStep).toBe(false);

    const seeded = applyOnboardingPathSeed(
      {
        ...emptyDraft,
        competitionDate: "2026-09-01",
        lifts: { squat: 180 },
      },
      "coach",
    );
    expect(seeded.competitionDate).toBeNull();
    expect(seeded.lifts).toEqual({});
    expect(seeded.primaryGoalId).toBe("general_fitness");
    expect(ONBOARDING_PATH_HONESTY.join(" ")).toMatch(/relevant/i);
  });

  it("powerlifter seeds sport and shows SBD only", () => {
    const seeded = applyOnboardingPathSeed(emptyDraft, "powerlifter");
    expect(seeded.primaryGoalId).toBe("powerlifting");
    expect(seeded.sports).toEqual(["powerlifting"]);
    expect(getOnboardingPathVisibility("powerlifter").liftIds).toEqual([
      "squat",
      "bench",
      "deadlift",
    ]);
  });
});
