import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { getTrainingLoadView } from "@/services/training-load/training-load-service";

describe("training load service", () => {
  const email = `load-${Date.now()}@example.com`;
  let userId = "";
  let exerciseId = "";
  let workoutId = "";

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: await hashPassword("test-password-123"),
        athleteProfile: {
          create: {
            units: "kg",
            displayName: "Load Tester",
            onboardingCompletedAt: new Date(),
            recoveryEntries: {
              create: {
                readiness: 62,
                sleepHours: 7.5,
                soreness: 4,
                source: "reported",
              },
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
        slug: `load-${Date.now()}`,
        name: "Romanian Deadlift",
        category: "compound",
        movementPattern: "hinge",
        difficulty: "intermediate",
        isPublished: true,
      },
    });
    exerciseId = exercise.id;

    const workout = await prisma.workout.create({
      data: {
        kind: "athlete",
        athleteProfileId: profileId,
        name: "Hinge day",
      },
    });
    workoutId = workout.id;

    await prisma.trainingSession.create({
      data: {
        athleteProfileId: profileId,
        workoutId,
        status: "completed",
        completedAt: new Date(),
        prescriptionLockedAt: new Date(),
        perceivedEffort: 7,
        workoutNameSnapshot: "Hinge day",
        sessionExercises: {
          create: {
            exerciseId,
            sortOrder: 0,
            exerciseNameSnapshot: "Romanian Deadlift",
            sessionSets: {
              create: [
                {
                  setNumber: 1,
                  performedReps: 8,
                  performedLoadKg: 100,
                  performedRpe: 8,
                  completedAt: new Date(),
                  source: "reported",
                },
                {
                  setNumber: 2,
                  performedReps: 8,
                  performedLoadKg: 100,
                  performedRpe: 7,
                  completedAt: new Date(),
                  source: "reported",
                },
              ],
            },
          },
        },
      },
    });
  });

  afterAll(async () => {
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
    }
    if (workoutId) {
      await prisma.workout.delete({ where: { id: workoutId } }).catch(() => undefined);
    }
    if (exerciseId) {
      await prisma.exercise.delete({ where: { id: exerciseId } }).catch(() => undefined);
    }
  });

  it("returns estimated load windows and recovery indicators", async () => {
    const view = await getTrainingLoadView(userId);
    expect(view).not.toBeNull();
    expect(view!.empty).toBe(false);
    expect(view!.disclaimers.some((d) => /Estimated training load/i.test(d))).toBe(
      true,
    );

    const seven = view!.windows.find((w) => w.key === "7d");
    expect(seven).toBeTruthy();
    expect(seven!.totals.setCount).toBe(2);
    expect(seven!.totals.volumeKg).toBe(1600);
    expect(seven!.totals.hardSetCount).toBe(1);
    expect(seven!.avgSessionRpe).toBe(7);
    expect(seven!.exercises[0]?.exerciseName).toBe("Romanian Deadlift");

    expect(view!.recovery.readinessMean).toBe(62);
    expect(view!.recovery.note.toLowerCase()).toContain("recovery indicators");
    expect(view!.spike.flagged).toBe(false);
  });
});
