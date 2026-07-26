import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { buildAthleteProfileFromOnboarding } from "@/services/onboarding/build-profile";
import { emptyOnboardingDraft } from "@/services/onboarding/options";

describe("buildAthleteProfileFromOnboarding", () => {
  const email = `onboard-${Date.now()}@example.com`;
  let userId = "";

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: await hashPassword("test-password-123"),
      },
    });
    userId = user.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it("persists only provided fields and marks onboarding complete", async () => {
    const draft = emptyOnboardingDraft();
    draft.primaryGoalId = "powerlifting";
    draft.experienceLevelId = "advanced";
    draft.sports = ["powerlifting"];
    draft.daysPerWeek = 4;
    draft.equipment = ["barbell", "rack"];
    draft.bodyweightKg = 90;
    draft.lifts = { squat: 180, bench: null, deadlift: 200, press: null };
    draft.painCautionAcknowledged = true;
    draft.movementNotes = null;

    const result = await buildAthleteProfileFromOnboarding({ userId, draft });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const profile = await prisma.athleteProfile.findUniqueOrThrow({
      where: { id: result.athleteProfileId },
      include: {
        goals: true,
        trainingExperience: true,
        bodyMetrics: true,
        progressMetrics: true,
        recommendations: true,
      },
    });

    expect(profile.onboardingCompletedAt).not.toBeNull();
    expect(profile.primaryDiscipline).toBe("powerlifting");
    expect(profile.goals[0]?.title).toBe("Powerlifting competition");
    expect(profile.trainingExperience?.daysPerWeek).toBe(4);
    expect(profile.bodyMetrics.map((item) => item.metricKey)).toEqual([
      "bodyweight",
    ]);
    expect(profile.progressMetrics.map((item) => item.metricKey).sort()).toEqual(
      ["lift_deadlift", "lift_squat"],
    );
    expect(profile.recommendations.length).toBe(1);
    expect(result.redirectTo).toBe("/app/dashboard");
    expect(
      profile.bodyMetrics.some((item) => item.metricKey === "height"),
    ).toBe(false);
  });
});
