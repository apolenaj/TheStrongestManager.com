import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  estimatedRirFromRpe,
  liftKeyFromExerciseId,
  proposeTmReductionFromRpe,
  suggestedWeightKg,
} from "@/domain/catalog-workout/rules";
import type {
  ProgramDayPrescription,
  ProgramWeekPrescription,
  TrainingMaxesJson,
} from "@/types/programs";

function asWeek(value: unknown): ProgramWeekPrescription | null {
  if (!value || typeof value !== "object") return null;
  const week = value as ProgramWeekPrescription;
  if (typeof week.week !== "number" || !Array.isArray(week.days)) return null;
  return week;
}

function asTrainingMaxes(value: unknown): TrainingMaxesJson {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: TrainingMaxesJson = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
  }
  return out;
}

function dayKeyOf(day: ProgramDayPrescription): string {
  return String(day.day);
}

export type WorkoutSetView = {
  setIndex: number;
  prescribedReps: number | null;
  prescribedPercent: number | null;
  prescribedRpe: number | null;
  estimatedRir: number | null;
  suggestedWeight: number | null;
  actualWeight: number | null;
  actualRpe: number | null;
  actualRir: number | null;
  notes: string | null;
  painFlag: boolean;
  logId: string | null;
};

export type WorkoutExerciseView = {
  exerciseId: string;
  name: string;
  notes: string | null;
  sets: WorkoutSetView[];
};

export type PendingTmAdjustmentView = {
  id: string;
  liftKey: string;
  fromTm: number;
  toTm: number;
  reason: string;
};

export type CatalogWorkoutView = {
  userProgramId: string;
  productName: string;
  unitSystem: string;
  weekNumber: number;
  dayKey: string;
  dayLabel: string;
  dayNotes: string | null;
  sessionId: string;
  sessionStatus: string;
  exercises: WorkoutExerciseView[];
  pendingAdjustments: PendingTmAdjustmentView[];
  trainingMaxes: TrainingMaxesJson;
};

export async function getCatalogWorkoutView(input: {
  userId: string;
  userProgramId: string;
  dayKey: string;
}): Promise<{ ok: true; workout: CatalogWorkoutView } | { ok: false; error: string }> {
  const run = await prisma.userProgram.findFirst({
    where: { id: input.userProgramId, userId: input.userId },
    include: {
      programVersion: {
        select: { product: { select: { name: true } } },
      },
      tmAdjustments: {
        where: { status: "pending" },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!run) return { ok: false, error: "Program run not found." };
  if (run.status !== "active") {
    return { ok: false, error: "This program run is not active." };
  }

  const week = asWeek(run.firstWeekJson);
  if (!week) return { ok: false, error: "No week prescription on file." };

  const day = week.days.find((d) => dayKeyOf(d) === input.dayKey);
  if (!day) return { ok: false, error: "Workout day not found in this week." };

  const trainingMaxes = asTrainingMaxes(run.trainingMaxes);

  let session = await prisma.catalogWorkoutSession.findUnique({
    where: {
      userProgramId_weekNumber_dayKey: {
        userProgramId: run.id,
        weekNumber: run.currentWeek,
        dayKey: input.dayKey,
      },
    },
    include: { setLogs: true },
  });

  if (!session) {
    session = await prisma.catalogWorkoutSession.create({
      data: {
        userProgramId: run.id,
        weekNumber: run.currentWeek,
        dayKey: input.dayKey,
        dayLabel: day.label ?? `Day ${day.day}`,
        status: "in_progress",
      },
      include: { setLogs: true },
    });
  }

  const logMap = new Map(
    session.setLogs.map((l) => [`${l.exerciseId}:${l.setIndex}`, l]),
  );

  const exercises: WorkoutExerciseView[] = day.exercises.map((ex) => {
    const liftKey = liftKeyFromExerciseId(ex.exerciseId);
    const tm = liftKey ? trainingMaxes[liftKey] : undefined;
    const sets: WorkoutSetView[] = ex.sets.map((set, index) => {
      const setIndex = index + 1;
      const log = logMap.get(`${ex.exerciseId}:${setIndex}`);
      const prescribedRpe = set.rpe ?? ex.defaultRpe ?? null;
      const suggested = suggestedWeightKg({
        prescribedWeight: set.weight,
        percentOfTm: set.percentOfTm,
        trainingMaxKg: tm,
      });
      return {
        setIndex,
        prescribedReps: set.reps ?? null,
        prescribedPercent: set.percentOfTm ?? null,
        prescribedRpe,
        estimatedRir: estimatedRirFromRpe(prescribedRpe),
        suggestedWeight: suggested,
        actualWeight: log?.actualWeight ?? null,
        actualRpe: log?.actualRpe ?? null,
        actualRir: log?.actualRir ?? null,
        notes: log?.notes ?? null,
        painFlag: log?.painFlag ?? false,
        logId: log?.id ?? null,
      };
    });

    return {
      exerciseId: ex.exerciseId,
      name: ex.name ?? ex.exerciseId,
      notes: ex.notes ?? null,
      sets,
    };
  });

  return {
    ok: true,
    workout: {
      userProgramId: run.id,
      productName: run.programVersion.product.name,
      unitSystem: run.unitSystem,
      weekNumber: run.currentWeek,
      dayKey: input.dayKey,
      dayLabel: day.label ?? `Day ${day.day}`,
      dayNotes: day.notes ?? null,
      sessionId: session.id,
      sessionStatus: session.status,
      exercises,
      pendingAdjustments: run.tmAdjustments.map((a) => ({
        id: a.id,
        liftKey: a.liftKey,
        fromTm: a.fromTm,
        toTm: a.toTm,
        reason: a.reason,
      })),
      trainingMaxes,
    },
  };
}

export type LogCatalogSetInput = {
  userId: string;
  sessionId: string;
  exerciseId: string;
  exerciseName: string;
  setIndex: number;
  prescribedReps: number | null;
  prescribedPercent: number | null;
  prescribedRpe: number | null;
  suggestedWeight: number | null;
  actualWeight: number | null;
  actualRpe: number | null;
  actualRir: number | null;
  notes: string | null;
  painFlag: boolean;
};

export type LogCatalogSetResult =
  | {
      ok: true;
      logId: string;
      createdAdjustmentId: string | null;
    }
  | { ok: false; error: string };

export async function logCatalogWorkoutSet(
  input: LogCatalogSetInput,
): Promise<LogCatalogSetResult> {
  const session = await prisma.catalogWorkoutSession.findFirst({
    where: {
      id: input.sessionId,
      userProgram: { userId: input.userId },
    },
    include: {
      userProgram: { select: { id: true, trainingMaxes: true } },
    },
  });

  if (!session) return { ok: false, error: "Workout session not found." };
  if (session.status === "completed") {
    return { ok: false, error: "This workout is already completed." };
  }

  if (
    input.actualWeight != null &&
    (!Number.isFinite(input.actualWeight) || input.actualWeight < 0)
  ) {
    return { ok: false, error: "Enter a valid actual weight." };
  }
  if (
    input.actualRpe != null &&
    (!Number.isFinite(input.actualRpe) ||
      input.actualRpe < 1 ||
      input.actualRpe > 10)
  ) {
    return { ok: false, error: "Actual RPE must be between 1 and 10." };
  }
  if (
    input.actualRir != null &&
    (!Number.isFinite(input.actualRir) ||
      input.actualRir < 0 ||
      input.actualRir > 10)
  ) {
    return { ok: false, error: "Actual RIR must be between 0 and 10." };
  }

  const log = await prisma.catalogWorkoutSetLog.upsert({
    where: {
      sessionId_exerciseId_setIndex: {
        sessionId: session.id,
        exerciseId: input.exerciseId,
        setIndex: input.setIndex,
      },
    },
    create: {
      sessionId: session.id,
      exerciseId: input.exerciseId,
      exerciseName: input.exerciseName,
      setIndex: input.setIndex,
      prescribedReps: input.prescribedReps,
      prescribedPercent: input.prescribedPercent,
      prescribedRpe: input.prescribedRpe,
      suggestedWeight: input.suggestedWeight,
      actualWeight: input.actualWeight,
      actualRpe: input.actualRpe,
      actualRir: input.actualRir,
      notes: input.notes,
      painFlag: input.painFlag,
    },
    update: {
      exerciseName: input.exerciseName,
      prescribedReps: input.prescribedReps,
      prescribedPercent: input.prescribedPercent,
      prescribedRpe: input.prescribedRpe,
      suggestedWeight: input.suggestedWeight,
      actualWeight: input.actualWeight,
      actualRpe: input.actualRpe,
      actualRir: input.actualRir,
      notes: input.notes,
      painFlag: input.painFlag,
    },
  });

  if (session.status === "planned") {
    await prisma.catalogWorkoutSession.update({
      where: { id: session.id },
      data: { status: "in_progress" },
    });
  }

  let createdAdjustmentId: string | null = null;
  const liftKey = liftKeyFromExerciseId(input.exerciseId);
  const maxes = asTrainingMaxes(session.userProgram.trainingMaxes);
  const proposal = proposeTmReductionFromRpe({
    liftKey,
    currentTm: liftKey ? maxes[liftKey] : null,
    prescribedRpe: input.prescribedRpe,
    actualRpe: input.actualRpe,
  });

  if (proposal) {
    const existing = await prisma.catalogTmAdjustment.findFirst({
      where: {
        userProgramId: session.userProgram.id,
        liftKey: proposal.liftKey,
        status: "pending",
      },
      select: { id: true },
    });
    if (!existing) {
      const created = await prisma.catalogTmAdjustment.create({
        data: {
          userProgramId: session.userProgram.id,
          liftKey: proposal.liftKey,
          fromTm: proposal.fromTm,
          toTm: proposal.toTm,
          reason: proposal.reason,
          status: "pending",
          triggerSetLogId: log.id,
        },
        select: { id: true },
      });
      createdAdjustmentId = created.id;
    }
  }

  return { ok: true, logId: log.id, createdAdjustmentId };
}

export async function completeCatalogWorkoutSession(input: {
  userId: string;
  sessionId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await prisma.catalogWorkoutSession.findFirst({
    where: {
      id: input.sessionId,
      userProgram: { userId: input.userId },
    },
  });
  if (!session) return { ok: false, error: "Workout session not found." };

  await prisma.catalogWorkoutSession.update({
    where: { id: session.id },
    data: { status: "completed", completedAt: new Date() },
  });
  return { ok: true };
}

export async function resolveCatalogTmAdjustment(input: {
  userId: string;
  adjustmentId: string;
  decision: "approved" | "dismissed";
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const adjustment = await prisma.catalogTmAdjustment.findFirst({
    where: {
      id: input.adjustmentId,
      status: "pending",
      userProgram: { userId: input.userId },
    },
    include: {
      userProgram: { select: { id: true, trainingMaxes: true } },
    },
  });

  if (!adjustment) {
    return { ok: false, error: "Pending adjustment not found." };
  }

  if (input.decision === "dismissed") {
    await prisma.catalogTmAdjustment.update({
      where: { id: adjustment.id },
      data: { status: "dismissed", resolvedAt: new Date() },
    });
    return { ok: true };
  }

  const maxes = asTrainingMaxes(adjustment.userProgram.trainingMaxes);
  maxes[adjustment.liftKey] = adjustment.toTm;

  await prisma.$transaction([
    prisma.userProgram.update({
      where: { id: adjustment.userProgram.id },
      data: { trainingMaxes: maxes as Prisma.InputJsonValue },
    }),
    prisma.catalogTmAdjustment.update({
      where: { id: adjustment.id },
      data: { status: "approved", resolvedAt: new Date() },
    }),
  ]);

  return { ok: true };
}
