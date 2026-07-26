import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import {
  assignProgramTemplateToAthlete,
  lockSessionPrescription,
} from "@/services/programming/program-service";

describe("programming program-service", () => {
  const email = `program-model-${Date.now()}@example.com`;
  let userId = "";
  let profileId = "";
  let templateProgramId = "";
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
            displayName: "Program Tester",
            onboardingCompletedAt: new Date(),
          },
        },
      },
      include: { athleteProfile: true },
    });
    userId = user.id;
    profileId = user.athleteProfile!.id;

    const exercise = await prisma.exercise.create({
      data: {
        slug: `program-test-${Date.now()}`,
        name: "Program Test Squat",
        category: "compound",
        movementPattern: "squat",
        difficulty: "intermediate",
        isPublished: true,
      },
    });
    exerciseId = exercise.id;

    const workout = await prisma.workout.create({
      data: {
        kind: "template",
        name: "Squat Day",
        workoutExercises: {
          create: {
            exerciseId,
            sortOrder: 0,
            targetSets: 3,
            targetReps: "5",
            targetRpe: 8,
            targetRir: 2,
            targetPercent: 75,
            targetTempo: "31X1",
            restSeconds: 180,
            workoutSets: {
              create: [
                {
                  setNumber: 1,
                  targetReps: 5,
                  targetPercent: 75,
                  targetRpe: 8,
                  targetRir: 2,
                  targetTempo: "31X1",
                  restSeconds: 180,
                },
              ],
            },
          },
        },
      },
    });
    workoutId = workout.id;

    const program = await prisma.program.create({
      data: {
        kind: "template",
        name: "Test Strength Block",
        status: "draft",
        blocks: {
          create: {
            blockNumber: 1,
            name: "Accumulation",
            focus: "Volume",
          },
        },
      },
      include: { blocks: true },
    });
    templateProgramId = program.id;

    const week = await prisma.programWeek.create({
      data: {
        programId: program.id,
        blockId: program.blocks[0]!.id,
        weekNumber: 1,
        name: "Week 1",
        workoutId,
      },
    });

    await prisma.programDay.create({
      data: {
        programWeekId: week.id,
        dayIndex: 1,
        name: "Day 1",
        workoutId,
      },
    });

    await prisma.progressionRule.create({
      data: {
        programId: program.id,
        ruleKind: "add_load",
        paramsJson: JSON.stringify({ kg: 2.5, when: "all_sets_hit" }),
        source: "recommended",
      },
    });
  });

  afterAll(async () => {
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
    }
    if (templateProgramId) {
      await prisma.program
        .delete({ where: { id: templateProgramId } })
        .catch(() => undefined);
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

  it("assigns a template to an athlete without mutating the template", async () => {
    const result = await assignProgramTemplateToAthlete({
      templateProgramId,
      athleteProfileId: profileId,
      name: "My Strength Block",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const clone = await prisma.program.findUniqueOrThrow({
      where: { id: result.programId },
      include: {
        blocks: true,
        weeks: { include: { days: true } },
        progressionRules: true,
      },
    });
    expect(clone.kind).toBe("athlete");
    expect(clone.sourceTemplateId).toBe(templateProgramId);
    expect(clone.athleteProfileId).toBe(profileId);
    expect(clone.blocks).toHaveLength(1);
    expect(clone.weeks).toHaveLength(1);
    expect(clone.weeks[0]!.days).toHaveLength(1);
    expect(clone.progressionRules.length).toBeGreaterThanOrEqual(1);

    const template = await prisma.program.findUniqueOrThrow({
      where: { id: templateProgramId },
    });
    expect(template.kind).toBe("template");
    expect(template.athleteProfileId).toBeNull();
  });

  it("locks session prescription so later workout edits do not rewrite history", async () => {
    const session = await prisma.trainingSession.create({
      data: {
        athleteProfileId: profileId,
        workoutId,
        status: "in_progress",
        startedAt: new Date(),
      },
    });

    const locked = await lockSessionPrescription({
      trainingSessionId: session.id,
      athleteProfileId: profileId,
    });
    expect(locked.ok).toBe(true);

    const before = await prisma.sessionExercise.findMany({
      where: { trainingSessionId: session.id },
      include: { sessionSets: true },
    });
    expect(before).toHaveLength(1);
    expect(before[0]!.exerciseNameSnapshot).toBe("Program Test Squat");
    expect(before[0]!.prescribedTempo).toBe("31X1");
    expect(before[0]!.sessionSets.length).toBeGreaterThanOrEqual(1);

    await prisma.workoutExercise.updateMany({
      where: { workoutId },
      data: { targetTempo: "20X0", notes: "changed after lock" },
    });

    const after = await prisma.sessionExercise.findMany({
      where: { trainingSessionId: session.id },
    });
    expect(after[0]!.prescribedTempo).toBe("31X1");
    expect(after[0]!.notes).not.toBe("changed after lock");

    const relock = await lockSessionPrescription({
      trainingSessionId: session.id,
      athleteProfileId: profileId,
    });
    expect(relock.ok).toBe(false);
  });
});
