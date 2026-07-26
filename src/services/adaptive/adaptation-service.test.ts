import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import {
  decideAdaptation,
  listAdaptationsForUser,
  proposeAdaptationsForAthlete,
} from "@/services/adaptive/adaptation-service";

describe("adaptive programming service", () => {
  const email = `adaptive-${Date.now()}@example.com`;
  let userId = "";
  let profileId = "";
  let exerciseId = "";
  let workoutId = "";
  let workoutExerciseId = "";
  let programId = "";

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: await hashPassword("test-password-123"),
        athleteProfile: {
          create: {
            units: "kg",
            displayName: "Adaptive Tester",
            onboardingCompletedAt: new Date(),
            goals: {
              create: {
                title: "Build strength",
                category: "strength",
                status: "active",
                priority: 1,
              },
            },
            recoveryEntries: {
              create: {
                readiness: 80,
                source: "reported",
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
        slug: `adaptive-${Date.now()}`,
        name: "Bench Press",
        category: "compound",
        movementPattern: "push",
        difficulty: "intermediate",
        isPublished: true,
      },
    });
    exerciseId = exercise.id;

    const workout = await prisma.workout.create({
      data: {
        kind: "athlete",
        athleteProfileId: profileId,
        name: "Upper A",
        estimatedMinutes: 50,
        workoutExercises: {
          create: {
            exerciseId,
            sortOrder: 0,
            targetSets: 3,
            targetReps: "5",
            targetLoadKg: 80,
            targetRpe: 8,
            workoutSets: {
              create: [
                { setNumber: 1, targetReps: 5, targetLoadKg: 80, targetRpe: 8 },
                { setNumber: 2, targetReps: 5, targetLoadKg: 80, targetRpe: 8 },
              ],
            },
          },
        },
      },
      include: { workoutExercises: true },
    });
    workoutId = workout.id;
    workoutExerciseId = workout.workoutExercises[0]!.id;

    const program = await prisma.program.create({
      data: {
        kind: "athlete",
        athleteProfileId: profileId,
        name: "Adaptive Block",
        status: "active",
        weeks: {
          create: {
            weekNumber: 1,
            days: {
              create: {
                dayIndex: 1,
                workoutId,
              },
            },
          },
        },
      },
    });
    programId = program.id;

    // Completed session with clean hits under target RPE → increase_load
    const trainingSession = await prisma.trainingSession.create({
      data: {
        athleteProfileId: profileId,
        programId,
        workoutId,
        status: "completed",
        startedAt: new Date(),
        completedAt: new Date(),
        prescriptionLockedAt: new Date(),
        workoutNameSnapshot: "Upper A",
        sessionExercises: {
          create: {
            exerciseId,
            sortOrder: 0,
            exerciseNameSnapshot: "Bench Press",
            prescribedSets: 2,
            prescribedReps: "5",
            prescribedLoadKg: 80,
            prescribedRpe: 8,
            sessionSets: {
              create: [
                {
                  setNumber: 1,
                  prescribedReps: 5,
                  prescribedLoadKg: 80,
                  prescribedRpe: 8,
                  performedReps: 5,
                  performedLoadKg: 80,
                  performedRpe: 6.5,
                  completedAt: new Date(),
                  source: "reported",
                },
                {
                  setNumber: 2,
                  prescribedReps: 5,
                  prescribedLoadKg: 80,
                  prescribedRpe: 8,
                  performedReps: 5,
                  performedLoadKg: 80,
                  performedRpe: 6.5,
                  completedAt: new Date(),
                  source: "reported",
                },
              ],
            },
          },
        },
      },
    });

    void trainingSession;
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
      await prisma.exercise.delete({ where: { id: exerciseId } }).catch(() => undefined);
    }
  });

  it("proposes without mutating prescription until accepted", async () => {
    const before = await prisma.workoutExercise.findUniqueOrThrow({
      where: { id: workoutExerciseId },
    });
    expect(before.targetLoadKg).toBe(80);

    const proposed = await proposeAdaptationsForAthlete({ userId });
    expect(proposed.ok).toBe(true);
    if (!proposed.ok) return;
    expect(proposed.createdIds.length).toBeGreaterThan(0);

    const still = await prisma.workoutExercise.findUniqueOrThrow({
      where: { id: workoutExerciseId },
    });
    expect(still.targetLoadKg).toBe(80);

    const list = await listAdaptationsForUser(userId, "pending");
    expect(list.length).toBeGreaterThan(0);
    const item = list[0]!;
    expect(item.status).toBe("pending");
    expect(item.reason.length).toBeGreaterThan(0);
    expect(["low", "medium", "high"]).toContain(item.confidence);
    expect(item.events.some((e) => e.eventType === "proposed")).toBe(true);

    const adaptationId = item.id;

    const declined = await decideAdaptation({
      userId,
      adaptationId,
      decision: "decline",
      decisionNote: "Not this week",
    });
    expect(declined.ok).toBe(true);

    const afterDecline = await prisma.workoutExercise.findUniqueOrThrow({
      where: { id: workoutExerciseId },
    });
    expect(afterDecline.targetLoadKg).toBe(80);

    // New proposal then accept
    const again = await proposeAdaptationsForAthlete({ userId });
    expect(again.ok).toBe(true);
    if (!again.ok) return;
    const pending = await listAdaptationsForUser(userId, "pending");
    const next = pending[0]!;
    expect(next.changeKind).toBeTruthy();

    const accepted = await decideAdaptation({
      userId,
      adaptationId: next.id,
      decision: "accept",
    });
    expect(accepted.ok).toBe(true);

    const events = await prisma.programAdaptationEvent.findMany({
      where: { adaptationId: next.id },
      orderBy: { createdAt: "asc" },
    });
    expect(events.map((e) => e.eventType)).toEqual(
      expect.arrayContaining(["proposed", "accepted", "applied"]),
    );

    const row = await prisma.programAdaptation.findUniqueOrThrow({
      where: { id: next.id },
    });
    expect(["accepted", "modified"]).toContain(row.status);
    expect(row.appliedAt).not.toBeNull();
  });
});
