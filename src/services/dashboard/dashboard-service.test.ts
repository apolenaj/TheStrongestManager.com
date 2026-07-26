import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { getPerformanceDashboard } from "@/services/dashboard/dashboard-service";
import { NOT_ENOUGH_DATA } from "@/services/dashboard/types";

describe("performance dashboard", () => {
  const email = `dashboard-${Date.now()}@example.com`;
  let userId = "";

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: await hashPassword("test-password-123"),
        athleteProfile: {
          create: {
            units: "kg",
            displayName: "Test Athlete",
            primaryDiscipline: "powerlifting",
            onboardingCompletedAt: new Date(),
            goals: {
              create: {
                category: "performance",
                title: "Powerlifting competition",
                status: "active",
                priority: 1,
              },
            },
            recommendations: {
              create: {
                category: "training",
                title: "Review Today for your next action",
                body: "Profile is based only on what you entered.",
                status: "pending",
                priority: 1,
              },
            },
            progressMetrics: {
              create: {
                metricKey: "lift_squat",
                value: 140,
                unit: "kg",
                source: "reported",
                notes: "Self-reported during onboarding.",
              },
            },
          },
        },
      },
    });
    userId = user.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it("treats a freshly onboarded athlete as new and does not invent scores", async () => {
    const dashboard = await getPerformanceDashboard(userId);
    expect(dashboard).not.toBeNull();
    if (!dashboard) return;

    expect(dashboard.isNewAthlete).toBe(true);
    expect(dashboard.greetingName).toBe("Test Athlete");
    expect(dashboard.goalTitle).toBe("Powerlifting competition");
    expect(dashboard.scores.athlete.value).toBeNull();
    expect(dashboard.scores.strength.value).toBeNull();
    expect(dashboard.scores.strength.emptyLabel).toBe(NOT_ENOUGH_DATA);
    expect(dashboard.scores.technique.value).toBeNull();
    expect(dashboard.scores.recovery.value).toBeNull();
    expect(dashboard.scores.consistency.value).toBeNull();
    expect(dashboard.scores.mobilityReadiness).toBeNull();
    expect(dashboard.opportunity?.title).toContain("Review Today");
    expect(dashboard.personalRecords).toHaveLength(1);
    expect(dashboard.personalRecords[0]?.display).toContain("kg");
    expect(dashboard.firstSession.goalChosen).toBe(true);
    expect(dashboard.firstSession.profileReady).toBe(false);
    expect(dashboard.firstSession.techniqueUploaded).toBe(false);
    expect(dashboard.firstSession.workoutLogged).toBe(false);
    expect(dashboard.firstSession.completedCount).toBe(1);
    expect(dashboard.firstSession.totalCount).toBe(4);
  });

  it("shows readiness only after enough recovery logs", async () => {
    const profile = await prisma.athleteProfile.findUniqueOrThrow({
      where: { userId },
    });

    await prisma.recoveryEntry.createMany({
      data: [
        {
          athleteProfileId: profile.id,
          readiness: 70,
          source: "reported",
          recordedAt: new Date(Date.now() - 2 * 86400000),
        },
        {
          athleteProfileId: profile.id,
          readiness: 75,
          source: "reported",
          recordedAt: new Date(Date.now() - 86400000),
        },
        {
          athleteProfileId: profile.id,
          readiness: 80,
          source: "reported",
          recordedAt: new Date(),
        },
      ],
    });

    const dashboard = await getPerformanceDashboard(userId);
    expect(dashboard?.isNewAthlete).toBe(false);
    expect(dashboard?.scores.mobilityReadiness?.value).toBe(80);
    expect(dashboard?.scores.recovery.value).toBe(75);
    expect(dashboard?.scores.recovery.source).toBe("heuristic");
    expect(dashboard?.recoveryTrend.length).toBeGreaterThanOrEqual(3);
  });

  it("hides technique score until confidence clears the display gate", async () => {
    const profile = await prisma.athleteProfile.findUniqueOrThrow({
      where: { userId },
    });

    await prisma.techniqueAnalysis.create({
      data: {
        athleteProfileId: profile.id,
        status: "completed",
        overallScore: 82,
        confidenceBasis: "observed",
        summary: "Observed bar path analysis.",
      },
    });

    const sparse = await getPerformanceDashboard(userId);
    // One analysis → low confidence → not displayed
    expect(sparse?.scores.technique.value).toBeNull();
    expect(sparse?.techniqueTrend[0]?.value).toBe(82);
    expect(sparse?.scores.athlete.value).toBeNull();

    await prisma.techniqueAnalysis.create({
      data: {
        athleteProfileId: profile.id,
        status: "completed",
        overallScore: 88,
        confidenceBasis: "observed",
        summary: "Second observed analysis.",
      },
    });

    const dashboard = await getPerformanceDashboard(userId);
    expect(dashboard?.scores.technique.value).toBe(85);
    expect(dashboard?.scores.athlete.value).toBeNull();
  });
});
