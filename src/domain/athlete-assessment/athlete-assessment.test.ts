import { describe, expect, it } from "vitest";
import {
  ATHLETE_ASSESSMENT_NOT_FULL_LABEL,
  ATHLETE_ASSESSMENT_SELF_LABEL,
  buildPartialAthleteProfile,
  evaluateAthleteAssessmentQuality,
} from "@/domain/athlete-assessment";

describe("athlete assessment funnel", () => {
  it("requires Self-assessment estimate and Not full Athlete Score labels", () => {
    const q = evaluateAthleteAssessmentQuality();
    expect(q.passed).toBe(true);
    expect(ATHLETE_ASSESSMENT_SELF_LABEL).toBe("Self-assessment estimate");
    expect(ATHLETE_ASSESSMENT_NOT_FULL_LABEL).toBe("Not full Athlete Score");
  });

  it("returns partial profile without inventing an Athlete Score number", () => {
    const profile = buildPartialAthleteProfile({
      goal: "strength",
      experience: "intermediate",
      sport: "powerlifting",
      frequency: "4",
      recovery: "mixed",
      logging: "no",
    });
    expect(profile.athleteScore.shown).toBe(false);
    expect(profile.labels.selfAssessment).toBe("Self-assessment estimate");
    expect(profile.labels.notFullScore).toBe("Not full Athlete Score");
    expect(profile.summary).toMatch(/Not full Athlete Score/);
    expect(profile.fields.every((f) => f.source === "reported")).toBe(true);
    expect(profile.fields.every((f) => f.estimateLabel === "Self-assessment estimate")).toBe(
      true,
    );
    expect(profile.pillarUnlocks.length).toBe(5);
    expect(
      profile.pillarUnlocks.every((p) => p.status === "missing_logged_data"),
    ).toBe(true);
    expect(profile.lockedSections.join(" ")).toMatch(/Overall Athlete Score/);
  });
});
