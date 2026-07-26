import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import {
  completeWorkoutSession,
  getTodayWorkout,
  getWorkoutSessionView,
  logSessionSet,
  startTodaysWorkout,
} from "@/services/workout/workout-service";

describe("workout experience service", () => {
  const email = `workout-ux-${Date.now()}@example.com`;
  let userId = "";
  let profileId = "";
  let exerciseId = "";
  let workoutId = "";
  let programId = "";

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: await hashPassword("test-password-123"),
        athleteProfile: {
          create: {
            units: "kg",
            displayName: "Workout UX",
            onboardingCompletedAt: new Date(),
            goals: {
              create: {
                title: "Build squat strength",
                category: "strength",
                status: "active",
                priority: 1,
              },
            },
          },
        },
      },
      include: { athleteProfile: true },
    });
    userId = user.id;
    profileId = user.athleteProfile!.id;

    const exercise = await prisma.exercise.create({
      data: {
        slug: `workout-ux-${Date.now()}`,
        name: "Back Squat",
        category: "compound",
        movementPattern: "squat",
        difficulty: "intermediate",
        isPublished: true,
        setup: "Bar on upper traps. Brace before unracking.",
        commonMistakes: JSON.stringify(["Knees cave in"]),
      },
    });
    exerciseId = exercise.id;

    const workout = await prisma.workout.create({
      data: {
        kind: "athlete",
        athleteProfileId: profileId,
        name: "Lower Strength A",
        description: "Primary squat volume",
        estimatedMinutes: 55,
        workoutExercises: {
          create: {
            exerciseId,
            sortOrder: 0,
            targetSets: 2,
            targetReps: "5",
            targetLoadKg: 100,
            targetRpe: 8,
            targetRir: 2,
            restSeconds: 180,
            notes: "Drive up hard out of the hole.",
            workoutSets: {
              create: [
                {
                  setNumber: 1,
                  targetReps: 5,
                  targetLoadKg: 100,
                  targetRpe: 8,
                  restSeconds: 180,
                },
                {
                  setNumber: 2,
                  targetReps: 5,
                  targetLoadKg: 100,
                  targetRpe: 8,
                  restSeconds: 180,
                },
              ],
            },
          },
        },
      },
    });
    workoutId = workout.id;

    // Monday dayIndex for 2026-07-20 style mapping — use today's index.
    const jsDay = new Date().getDay();
    const dayIndex = jsDay === 0 ? 7 : jsDay;

    const program = await prisma.program.create({
      data: {
        kind: "athlete",
        athleteProfileId: profileId,
        name: "Strength Block",
        status: "active",
        description: "Accumulate squat volume",
        weeks: {
          create: {
            weekNumber: 1,
            name: "Week 1",
            days: {
              create: {
                dayIndex,
                name: "Day A",
                notes: "Quality reps over load chasing",
                workoutId,
              },
            },
          },
        },
      },
    });
    programId = program.id;
  });

  afterAll(async () => {
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
    }
    if (programId) {
      await prisma.program.delete({ where: { id: programId } }).catch(() => undefined);
    }
    if (workoutId) {
      await prisma.workout.delete({ where: { id: workoutId } }).catch(() => undefined);
    }
    if (exerciseId) {
      await prisma.exercise
        .delete({ where: { id: exerciseId } })
        .catch(() => undefined);
    }
  });

  it("surfaces today prescription with cue and targets", async () => {
    const today = await getTodayWorkout(userId);
    expect(today).not.toBeNull();
    expect(today!.prescription?.title).toBeTruthy();
    expect(today!.prescription?.estimatedMinutes).toBe(55);
    expect(today!.prescription?.exercisesPreview[0]?.techniqueCue).toContain(
      "Drive up hard",
    );
    expect(today!.prescription?.exercisesPreview[0]?.targetLoadKg).toBe(100);
  });

  it("starts, logs, and locks a live session without rewriting logged sets", async () => {
    const started = await startTodaysWorkout(userId);
    expect(started.ok).toBe(true);
    if (!started.ok) return;

    const view = await getWorkoutSessionView(userId, started.sessionId);
    expect(view).not.toBeNull();
    expect(view!.exercises[0]?.sets.length).toBe(2);
    expect(view!.goal).toBeTruthy();

    const setId = view!.exercises[0]!.sets[0]!.sessionSetId;
    const logged = await logSessionSet({
      userId,
      sessionSetId: setId,
      performedLoadKg: 102.5,
      performedReps: 5,
      performedRpe: 8,
      performedRir: 2,
      notes: "Solid",
      markComplete: true,
    });
    expect(logged.ok).toBe(true);

    const completed = await completeWorkoutSession(userId, started.sessionId);
    expect(completed.ok).toBe(true);

    const locked = await getWorkoutSessionView(userId, started.sessionId);
    expect(locked?.prescriptionLocked).toBe(true);
    expect(locked?.exercises[0]?.sets[0]?.performedLoadKg).toBe(102.5);
    expect(locked?.exercises[0]?.sets[0]?.isComplete).toBe(true);

    const relog = await logSessionSet({
      userId,
      sessionSetId: setId,
      performedLoadKg: 200,
      performedReps: 1,
      performedRpe: null,
      performedRir: null,
      notes: null,
      markComplete: true,
    });
    expect(relog.ok).toBe(false);

    const after = await getWorkoutSessionView(userId, started.sessionId);
    expect(after?.exercises[0]?.sets[0]?.performedLoadKg).toBe(102.5);
  });
});
