import { prisma } from "@/lib/db";
import {
  endOfLocalDay,
  pickTechniqueCue,
  startOfLocalDay,
  trainingDayIndexFromDate,
} from "@/domain/workout/helpers";
import { isSessionPrescriptionLocked } from "@/domain/programming/guards";
import {
  lockSessionPrescription,
  snapshotSessionPrescription,
} from "@/services/programming/program-service";
import { normalizeMassUnit, type MassUnit } from "@/services/units/convert";
import type {
  PreviousPerformanceSummary,
  TodayWorkoutView,
  WorkoutExerciseView,
  WorkoutSessionView,
  WorkoutSetView,
} from "@/services/workout/types";

async function profileIdForUser(userId: string): Promise<{
  id: string;
  units: MassUnit;
  goalTitle: string | null;
} | null> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    include: {
      goals: {
        where: { status: "active" },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        take: 1,
      },
    },
  });
  if (!profile) return null;
  return {
    id: profile.id,
    units: normalizeMassUnit(profile.units),
    goalTitle: profile.goals[0]?.title ?? null,
  };
}

type ResolvedPrescription = {
  workoutId: string;
  programId: string | null;
  programDayId: string | null;
  title: string;
  goal: string | null;
  estimatedMinutes: number | null;
  programName: string | null;
  description: string | null;
};

async function resolveTodaysPrescription(
  athleteProfileId: string,
  goalTitle: string | null,
  now = new Date(),
): Promise<ResolvedPrescription | null> {
  const dayStart = startOfLocalDay(now);
  const dayEnd = endOfLocalDay(now);

  const planned = await prisma.trainingSession.findFirst({
    where: {
      athleteProfileId,
      status: { in: ["planned", "in_progress"] },
      OR: [
        { scheduledAt: { gte: dayStart, lte: dayEnd } },
        { scheduledAt: null, status: "in_progress" },
      ],
      workoutId: { not: null },
    },
    include: {
      workout: true,
      program: { select: { name: true, description: true } },
      programDay: { select: { name: true, notes: true } },
    },
    orderBy: [{ status: "desc" }, { scheduledAt: "asc" }],
  });

  if (planned?.workout) {
    return {
      workoutId: planned.workout.id,
      programId: planned.programId,
      programDayId: planned.programDayId,
      title: planned.workout.name,
      goal:
        planned.programDay?.notes?.trim() ||
        planned.workout.description?.trim() ||
        planned.program?.description?.trim() ||
        goalTitle,
      estimatedMinutes: planned.workout.estimatedMinutes,
      programName: planned.program?.name ?? null,
      description: planned.workout.description,
    };
  }

  const dayIndex = trainingDayIndexFromDate(now);
  const activeProgram = await prisma.program.findFirst({
    where: {
      athleteProfileId,
      kind: "athlete",
      status: "active",
    },
    include: {
      weeks: {
        orderBy: { weekNumber: "asc" },
        include: {
          days: {
            where: { dayIndex },
            include: { workout: true },
            take: 1,
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  if (activeProgram) {
    for (const week of activeProgram.weeks) {
      const day = week.days[0];
      if (day?.workout) {
        return {
          workoutId: day.workout.id,
          programId: activeProgram.id,
          programDayId: day.id,
          title: day.name?.trim() || day.workout.name,
          goal:
            day.notes?.trim() ||
            day.workout.description?.trim() ||
            activeProgram.description?.trim() ||
            goalTitle,
          estimatedMinutes: day.workout.estimatedMinutes,
          programName: activeProgram.name,
          description: day.workout.description,
        };
      }
    }

    // Fallback: first day with a workout in the program (honest “next session”).
    const anyDay = await prisma.programDay.findFirst({
      where: {
        workoutId: { not: null },
        programWeek: { programId: activeProgram.id },
      },
      include: { workout: true },
      orderBy: [{ dayIndex: "asc" }],
    });
    if (anyDay?.workout) {
      return {
        workoutId: anyDay.workout.id,
        programId: activeProgram.id,
        programDayId: anyDay.id,
        title: anyDay.name?.trim() || anyDay.workout.name,
        goal:
          anyDay.notes?.trim() ||
          anyDay.workout.description?.trim() ||
          activeProgram.description?.trim() ||
          goalTitle,
        estimatedMinutes: anyDay.workout.estimatedMinutes,
        programName: activeProgram.name,
        description: anyDay.workout.description,
      };
    }
  }

  return null;
}

/** Batch previous-performance lookups — Database Scale Audit (Prompt 153). */
async function loadPreviousPerformanceMap(
  athleteProfileId: string,
  exerciseIds: string[],
): Promise<Map<string, PreviousPerformanceSummary>> {
  const unique = [...new Set(exerciseIds.filter(Boolean))];
  const result = new Map<string, PreviousPerformanceSummary>();
  if (unique.length === 0) return result;

  const sets = await prisma.sessionSet.findMany({
    where: {
      OR: [
        { performedReps: { not: null } },
        { performedLoadKg: { not: null } },
        { completedAt: { not: null } },
      ],
      sessionExercise: {
        exerciseId: { in: unique },
        trainingSession: {
          athleteProfileId,
          status: "completed",
        },
      },
    },
    include: {
      sessionExercise: {
        select: {
          exerciseId: true,
          trainingSession: {
            select: { workoutNameSnapshot: true, completedAt: true },
          },
        },
      },
    },
    orderBy: [{ completedAt: "desc" }, { updatedAt: "desc" }],
    take: Math.min(unique.length * 20, 200),
  });

  for (const set of sets) {
    const exerciseId = set.sessionExercise.exerciseId;
    if (result.has(exerciseId)) continue;
    result.set(exerciseId, {
      performedReps: set.performedReps,
      performedLoadKg: set.performedLoadKg,
      performedRpe: set.performedRpe,
      completedAt:
        set.completedAt?.toISOString() ??
        set.sessionExercise.trainingSession.completedAt?.toISOString() ??
        null,
      sessionLabel:
        set.sessionExercise.trainingSession.workoutNameSnapshot ?? null,
    });
  }

  return result;
}

function mapSet(set: {
  id: string;
  setNumber: number;
  setType: string;
  prescribedReps: number | null;
  prescribedLoadKg: number | null;
  prescribedPercent: number | null;
  prescribedRpe: number | null;
  prescribedRir: number | null;
  prescribedRestSeconds: number | null;
  performedReps: number | null;
  performedLoadKg: number | null;
  performedRpe: number | null;
  performedRir: number | null;
  notes: string | null;
  completedAt: Date | null;
}): WorkoutSetView {
  return {
    sessionSetId: set.id,
    setNumber: set.setNumber,
    setType: set.setType,
    prescribedReps: set.prescribedReps,
    prescribedLoadKg: set.prescribedLoadKg,
    prescribedPercent: set.prescribedPercent,
    prescribedRpe: set.prescribedRpe,
    prescribedRir: set.prescribedRir,
    prescribedRestSeconds: set.prescribedRestSeconds,
    performedReps: set.performedReps,
    performedLoadKg: set.performedLoadKg,
    performedRpe: set.performedRpe,
    performedRir: set.performedRir,
    notes: set.notes,
    completedAt: set.completedAt?.toISOString() ?? null,
    isComplete: set.completedAt != null,
  };
}

export async function getTodayWorkout(
  userId: string,
): Promise<TodayWorkoutView | null> {
  const profile = await profileIdForUser(userId);
  if (!profile) return null;

  const active = await prisma.trainingSession.findFirst({
    where: {
      athleteProfileId: profile.id,
      status: "in_progress",
    },
    orderBy: { startedAt: "desc" },
  });

  const resolved = await resolveTodaysPrescription(
    profile.id,
    profile.goalTitle,
  );

  if (!resolved) {
    return {
      units: profile.units,
      goalTitle: profile.goalTitle,
      activeSessionId: active?.id ?? null,
      prescription: null,
      emptyReason: active
        ? null
        : "No workout is assigned for today. Assign an active program or schedule a session first.",
    };
  }

  const workout = await prisma.workout.findUnique({
    where: { id: resolved.workoutId },
    include: {
      workoutExercises: {
        orderBy: { sortOrder: "asc" },
        include: {
          exercise: {
            select: {
              name: true,
              setup: true,
              execution: true,
              commonMistakes: true,
            },
          },
        },
      },
    },
  });

  if (!workout) {
    return {
      units: profile.units,
      goalTitle: profile.goalTitle,
      activeSessionId: active?.id ?? null,
      prescription: null,
      emptyReason: "Assigned workout could not be loaded.",
    };
  }

  return {
    units: profile.units,
    goalTitle: profile.goalTitle,
    activeSessionId: active?.id ?? null,
    prescription: {
      workoutId: workout.id,
      programId: resolved.programId,
      programDayId: resolved.programDayId,
      title: resolved.title,
      goal: resolved.goal,
      estimatedMinutes: resolved.estimatedMinutes,
      programName: resolved.programName,
      exerciseCount: workout.workoutExercises.length,
      exercisesPreview: workout.workoutExercises.map((line) => ({
        name: line.exercise.name,
        targetSets: line.targetSets,
        targetReps: line.targetReps,
        targetLoadKg: line.targetLoadKg,
        targetRpe: line.targetRpe,
        targetRir: line.targetRir,
        restSeconds: line.restSeconds,
        techniqueCue: pickTechniqueCue({
          workoutNotes: line.notes,
          setup: line.exercise.setup,
          execution: line.exercise.execution,
          commonMistakesJson: line.exercise.commonMistakes,
        }),
      })),
    },
    emptyReason: null,
  };
}

export async function getWorkoutSessionView(
  userId: string,
  sessionId: string,
): Promise<WorkoutSessionView | null> {
  const profile = await profileIdForUser(userId);
  if (!profile) return null;

  const session = await prisma.trainingSession.findFirst({
    where: { id: sessionId, athleteProfileId: profile.id },
    include: {
      workout: true,
      program: { select: { name: true, description: true } },
      programDay: { select: { name: true, notes: true } },
      sessionExercises: {
        orderBy: { sortOrder: "asc" },
        include: {
          exercise: {
            select: {
              slug: true,
              setup: true,
              execution: true,
              commonMistakes: true,
            },
          },
          sessionSets: { orderBy: { setNumber: "asc" } },
        },
      },
    },
  });

  if (!session) return null;

  const previousByExercise = await loadPreviousPerformanceMap(
    profile.id,
    session.sessionExercises.map((line) => line.exerciseId),
  );

  const exercises: WorkoutExerciseView[] = [];
  for (const line of session.sessionExercises) {
    const previous = previousByExercise.get(line.exerciseId) ?? null;
    exercises.push({
      sessionExerciseId: line.id,
      exerciseId: line.exerciseId,
      exerciseSlug: line.exercise.slug,
      name: line.exerciseNameSnapshot,
      sortOrder: line.sortOrder,
      targetSets: line.prescribedSets,
      targetReps: line.prescribedReps,
      targetLoadKg: line.prescribedLoadKg,
      targetPercent: line.prescribedPercent,
      targetRpe: line.prescribedRpe,
      targetRir: line.prescribedRir,
      restSeconds: line.prescribedRestSeconds,
      techniqueCue: pickTechniqueCue({
        workoutNotes: line.notes,
        setup: line.exercise.setup,
        execution: line.exercise.execution,
        commonMistakesJson: line.exercise.commonMistakes,
      }),
      previous,
      sets: line.sessionSets.map(mapSet),
    });
  }

  const allSets = exercises.flatMap((ex) => ex.sets);
  const goal =
    session.programDay?.notes?.trim() ||
    session.workout?.description?.trim() ||
    session.program?.description?.trim() ||
    profile.goalTitle;

  return {
    sessionId: session.id,
    status: session.status,
    title:
      session.workoutNameSnapshot ||
      session.programDay?.name ||
      session.workout?.name ||
      "Workout",
    goal,
    estimatedMinutes: session.workout?.estimatedMinutes ?? null,
    units: profile.units,
    programName: session.program?.name ?? null,
    startedAt: session.startedAt?.toISOString() ?? null,
    completedAt: session.completedAt?.toISOString() ?? null,
    prescriptionLocked: isSessionPrescriptionLocked(session),
    notes: session.notes,
    exercises,
    completedSetCount: allSets.filter((s) => s.isComplete).length,
    totalSetCount: allSets.length,
  };
}

export async function startTodaysWorkout(
  userId: string,
): Promise<
  | { ok: true; sessionId: string; resumed: boolean }
  | { ok: false; error: string }
> {
  const profile = await profileIdForUser(userId);
  if (!profile) {
    return { ok: false, error: "Complete onboarding to start a workout." };
  }

  const existing = await prisma.trainingSession.findFirst({
    where: {
      athleteProfileId: profile.id,
      status: "in_progress",
    },
    orderBy: { startedAt: "desc" },
  });
  if (existing) {
    const snap = await snapshotSessionPrescription({
      trainingSessionId: existing.id,
      athleteProfileId: profile.id,
    });
    if (!snap.ok) return snap;
    const { trackProductEventSafe } = await import(
      "@/services/analytics/track"
    );
    trackProductEventSafe({
      name: "workout_started",
      props: { sessionId: existing.id, resumed: true },
      userId,
    });
    return { ok: true, sessionId: existing.id, resumed: true };
  }

  const resolved = await resolveTodaysPrescription(
    profile.id,
    profile.goalTitle,
  );
  if (!resolved) {
    return {
      ok: false,
      error:
        "No workout is assigned for today. Assign an active program or schedule a session first.",
    };
  }

  const planned = await prisma.trainingSession.findFirst({
    where: {
      athleteProfileId: profile.id,
      status: "planned",
      workoutId: resolved.workoutId,
      scheduledAt: {
        gte: startOfLocalDay(new Date()),
        lte: endOfLocalDay(new Date()),
      },
    },
  });

  const session =
    planned ??
    (await prisma.trainingSession.create({
      data: {
        athleteProfileId: profile.id,
        workoutId: resolved.workoutId,
        programId: resolved.programId,
        programDayId: resolved.programDayId,
        status: "planned",
        scheduledAt: new Date(),
      },
    }));

  await prisma.trainingSession.update({
    where: { id: session.id },
    data: {
      status: "in_progress",
      startedAt: session.startedAt ?? new Date(),
      workoutId: resolved.workoutId,
      programId: resolved.programId,
      programDayId: resolved.programDayId,
    },
  });

  const snap = await snapshotSessionPrescription({
    trainingSessionId: session.id,
    athleteProfileId: profile.id,
  });
  if (!snap.ok) return snap;

  const { trackProductEventSafe } = await import("@/services/analytics/track");
  trackProductEventSafe({
    name: "workout_started",
    props: { sessionId: session.id, resumed: false },
    userId,
  });

  return { ok: true, sessionId: session.id, resumed: false };
}

export async function logSessionSet(input: {
  userId: string;
  sessionSetId: string;
  performedLoadKg: number | null;
  performedReps: number | null;
  performedRpe: number | null;
  performedRir: number | null;
  notes: string | null;
  markComplete: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await profileIdForUser(input.userId);
  if (!profile) {
    return { ok: false, error: "Athlete profile not found." };
  }

  const set = await prisma.sessionSet.findFirst({
    where: { id: input.sessionSetId },
    include: {
      sessionExercise: {
        include: {
          trainingSession: true,
        },
      },
    },
  });

  if (!set) {
    return { ok: false, error: "Set not found." };
  }

  const session = set.sessionExercise.trainingSession;
  if (session.athleteProfileId !== profile.id) {
    return { ok: false, error: "Not allowed to log this set." };
  }

  if (isSessionPrescriptionLocked(session)) {
    return {
      ok: false,
      error: "This session is locked. Completed history cannot be edited here.",
    };
  }

  if (session.status !== "in_progress" && session.status !== "planned") {
    return { ok: false, error: "Session is not open for logging." };
  }

  if (session.status === "planned") {
    await prisma.trainingSession.update({
      where: { id: session.id },
      data: { status: "in_progress", startedAt: session.startedAt ?? new Date() },
    });
  }

  await prisma.sessionSet.update({
    where: { id: set.id },
    data: {
      performedLoadKg: input.performedLoadKg,
      performedReps: input.performedReps,
      performedRpe: input.performedRpe,
      performedRir: input.performedRir,
      notes: input.notes?.trim() || null,
      completedAt: input.markComplete ? new Date() : null,
      source: "reported",
    },
  });

  return { ok: true };
}

export async function updateSessionNotes(input: {
  userId: string;
  sessionId: string;
  notes: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await profileIdForUser(input.userId);
  if (!profile) return { ok: false, error: "Athlete profile not found." };

  const session = await prisma.trainingSession.findFirst({
    where: { id: input.sessionId, athleteProfileId: profile.id },
  });
  if (!session) return { ok: false, error: "Session not found." };
  if (isSessionPrescriptionLocked(session)) {
    return { ok: false, error: "Session is locked." };
  }

  await prisma.trainingSession.update({
    where: { id: session.id },
    data: { notes: input.notes?.trim() || null },
  });
  return { ok: true };
}

export async function completeWorkoutSession(
  userId: string,
  sessionId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await profileIdForUser(userId);
  if (!profile) return { ok: false, error: "Athlete profile not found." };

  const result = await lockSessionPrescription({
    trainingSessionId: sessionId,
    athleteProfileId: profile.id,
  });
  if (result.ok) {
    const { trackProductEventSafe } = await import(
      "@/services/analytics/track"
    );
    trackProductEventSafe({
      name: "workout_completed",
      props: { sessionId },
      userId,
    });
    const { enqueueDomainEventSafe } = await import("@/services/event-driven");
    enqueueDomainEventSafe({
      name: "workout.session_completed",
      payload: {
        userId,
        sessionId,
        athleteProfileId: profile.id,
      },
      dedupeParts: [sessionId],
    });
  }
  return result;
}
