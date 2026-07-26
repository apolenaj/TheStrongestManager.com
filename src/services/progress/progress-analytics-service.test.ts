import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { getProgressAnalytics } from "@/services/progress/progress-analytics-service";

describe("progress analytics service", () => {
  const email = `progress-${Date.now()}@example.com`;
  let userId = "";
  let exerciseId = "";

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: await hashPassword("test-password-123"),
        athleteProfile: {
          create: {
            units: "kg",
            displayName: "Progress Analytics",
            onboardingCompletedAt: new Date(),
            bodyMetrics: {
              create: [
                {
                  metricKey: "bodyweight",
                  value: 80,
                  unit: "kg",
                  source: "reported",
                  recordedAt: new Date(Date.now() - 14 * 86400000),
                },
                {
                  metricKey: "bodyweight",
                  value: 81,
                  unit: "kg",
                  source: "reported",
                  recordedAt: new Date(),
                },
              ],
            },
            progressMetrics: {
              create: [
                {
                  metricKey: "lift_squat",
                  value: 100,
                  unit: "kg",
                  reps: 5,
                  source: "observed",
                  recordedAt: new Date(Date.now() - 21 * 86400000),
                },
                {
                  metricKey: "lift_squat",
                  value: 120,
                  unit: "kg",
                  reps: 1,
                  source: "observed",
                  recordedAt: new Date(Date.now() - 7 * 86400000),
                },
              ],
            },
          },
        },
      },
      include: { athleteProfile: true },
    });
    userId = user.id;
    const profileId = user.athleteProfile!.id;

    const exercise = await prisma.exercise.create({
      data: {
        slug: `progress-${Date.now()}`,
        name: "Back Squat",
        category: "compound",
        movementPattern: "squat",
        difficulty: "intermediate",
        isPublished: true,
      },
    });
    exerciseId = exercise.id;

    await prisma.trainingSession.create({
      data: {
        athleteProfileId: profileId,
        status: "completed",
        completedAt: new Date(),
        prescriptionLockedAt: new Date(),
        workoutNameSnapshot: "Squat day",
        sessionExercises: {
          create: {
            exerciseId,
            sortOrder: 0,
            exerciseNameSnapshot: "Back Squat",
            sessionSets: {
              create: [
                {
                  setNumber: 1,
                  performedReps: 5,
                  performedLoadKg: 110,
                  completedAt: new Date(),
                  source: "reported",
                },
              ],
            },
          },
        },
      },
    });

    await prisma.techniqueAnalysis.create({
      data: {
        athleteProfileId: profileId,
        exerciseId,
        status: "completed",
        overallScore: 72,
        confidenceBasis: "heuristic",
        analysisBackendStatus: "development_stub",
      },
    });
  });

  afterAll(async () => {
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
    }
    if (exerciseId) {
      await prisma.exercise.delete({ where: { id: exerciseId } }).catch(() => undefined);
    }
  });

  it("builds all progress sections for a range", async () => {
    const view = await getProgressAnalytics({
      userId,
      rangeId: "12w",
      exerciseId: `metric:lift_squat`,
    });
    expect(view).not.toBeNull();
    expect(view!.rangeId).toBe("12w");
    expect(view!.series.strengthTrend.points.length).toBeGreaterThan(0);
    expect(view!.series.prTimeline.points.length).toBeGreaterThan(0);
    expect(view!.series.estimated1rm.points.length).toBeGreaterThan(0);
    expect(view!.series.bodyweight.points.length).toBe(2);
    expect(view!.series.consistency.points.length).toBeGreaterThan(0);
    expect(view!.exercises.length).toBeGreaterThan(0);
  });

  it("filters technique by exercise selection", async () => {
    const view = await getProgressAnalytics({
      userId,
      rangeId: "all",
      exerciseId,
    });
    expect(view!.series.techniqueTrend.points.length).toBeGreaterThan(0);
    expect(view!.series.volume.points.length).toBeGreaterThan(0);
  });
});
