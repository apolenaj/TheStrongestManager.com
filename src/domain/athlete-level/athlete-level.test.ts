import { describe, expect, it } from "vitest";
import {
  ATHLETE_LEVEL_EXCLUDED_SIGNALS,
  resolveAthleteLevel,
  sportStrengthClassPlaceholder,
  type AthleteLevelEvidence,
} from "@/domain/athlete-level";

const thin: AthleteLevelEvidence = {
  distinctTrainingWeeks: 0,
  completedSessionCount: 0,
  academyLessonsCompleted: 0,
  scoredTechniqueCount: 0,
  techniqueScoreDelta: 0,
  trainingHistorySpanDays: 0,
  loggedPrCount: 0,
  hasCompetitiveEvidence: false,
  appOpenDaysIgnored: 999,
};

describe("athlete level system", () => {
  it("stays Foundation with thin data even with huge app opens", () => {
    const result = resolveAthleteLevel(thin);
    expect(result.level).toBe("foundation");
    expect(result.eliteEligible).toBe(false);
    expect(ATHLETE_LEVEL_EXCLUDED_SIGNALS).toContain("app_open_days");
  });

  it("does not grant Elite from high composite without competitive evidence", () => {
    const result = resolveAthleteLevel({
      distinctTrainingWeeks: 30,
      completedSessionCount: 100,
      academyLessonsCompleted: 20,
      scoredTechniqueCount: 20,
      techniqueScoreDelta: 20,
      trainingHistorySpanDays: 400,
      loggedPrCount: 15,
      hasCompetitiveEvidence: false,
      appOpenDaysIgnored: 500,
    });
    expect(result.composite).toBeGreaterThanOrEqual(80);
    expect(result.level).toBe("competitive");
    expect(result.eliteEligible).toBe(false);
    expect(result.eliteBlockedReason).toMatch(/competitive evidence/i);
  });

  it("grants Elite only with competitive evidence + balanced high factors", () => {
    const result = resolveAthleteLevel({
      distinctTrainingWeeks: 30,
      completedSessionCount: 100,
      academyLessonsCompleted: 20,
      scoredTechniqueCount: 20,
      techniqueScoreDelta: 20,
      trainingHistorySpanDays: 400,
      loggedPrCount: 15,
      hasCompetitiveEvidence: true,
    });
    expect(result.level).toBe("elite");
    expect(result.eliteEligible).toBe(true);
  });

  it("progresses above Foundation with modest consistency", () => {
    const thinResult = resolveAthleteLevel(thin);
    expect(thinResult.level).toBe("foundation");

    const result = resolveAthleteLevel({
      ...thin,
      distinctTrainingWeeks: 12,
      completedSessionCount: 24,
      trainingHistorySpanDays: 90,
      scoredTechniqueCount: 3,
      techniqueScoreDelta: 4,
      academyLessonsCompleted: 2,
      loggedPrCount: 1,
    });
    expect(result.composite).toBeGreaterThan(thinResult.composite);
    expect(["developing", "advanced", "competitive"]).toContain(result.level);
  });

  it("keeps sport strength classification separate", () => {
    const stub = sportStrengthClassPlaceholder("wilks");
    expect(stub.bandLabel).toBeNull();
    expect(stub.note).toMatch(/Not computed by Athlete Level/);
  });

  it("never uses absolute strength as the sole factor list", () => {
    const result = resolveAthleteLevel({
      ...thin,
      // Only "progress-ish" via PRs still needs other factors for high levels
      loggedPrCount: 50,
    });
    expect(result.level).not.toBe("elite");
    expect(result.factors.map((f) => f.id)).toEqual([
      "consistency",
      "knowledge",
      "technique",
      "training_history",
      "progress",
    ]);
  });
});
