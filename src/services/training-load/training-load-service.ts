import { prisma } from "@/lib/db";
import {
  LOAD_DISCLAIMERS,
  LOAD_WINDOW_28_DAYS,
  LOAD_WINDOW_7_DAYS,
  TRAINING_LOAD_ENGINE_VERSION,
} from "@/domain/training-load/constants";
import {
  aggregateExerciseWorkloads,
  aggregateLoadTotals,
  aggregateSessionSummaries,
  assessLoadSpike,
  buildDailyVolumeSeries,
  type DailyVolumePoint,
  type ExerciseWorkload,
  type LoadSetInput,
  type LoadSpikeAssessment,
  type LoadTotals,
  type SessionLoadSummary,
} from "@/domain/training-load/compute";
import { normalizeMassUnit, type MassUnit } from "@/services/units/convert";

export type WindowLoadView = {
  key: "7d" | "28d" | "block";
  label: string;
  description: string;
  startIso: string;
  endIso: string;
  totals: LoadTotals;
  /** Mean session RPE across sessions that logged perceivedEffort. */
  avgSessionRpe: number | null;
  sessionCount: number;
  sessionsWithRpe: number;
  daily: DailyVolumePoint[];
  exercises: ExerciseWorkload[];
  sessions: SessionLoadSummary[];
};

export type RecoveryIndicatorView = {
  readinessMean: number | null;
  readinessCount: number;
  sleepHoursMean: number | null;
  sorenessMean: number | null;
  windowDays: number;
  note: string;
};

export type TrainingLoadView = {
  units: MassUnit;
  engineVersion: string;
  disclaimers: readonly string[];
  windows: WindowLoadView[];
  spike: LoadSpikeAssessment;
  recovery: RecoveryIndicatorView;
  empty: boolean;
};

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function daysAgo(asOf: Date, days: number): Date {
  const d = startOfDay(asOf);
  d.setDate(d.getDate() - (days - 1));
  return d;
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

async function loadSetsForProfile(
  athleteProfileId: string,
  from: Date,
  to: Date,
): Promise<LoadSetInput[]> {
  const sets = await prisma.sessionSet.findMany({
    where: {
      completedAt: { gte: from, lte: to },
      sessionExercise: {
        trainingSession: {
          athleteProfileId,
          status: "completed",
        },
      },
    },
    include: {
      sessionExercise: {
        include: {
          trainingSession: {
            select: {
              id: true,
              perceivedEffort: true,
              completedAt: true,
            },
          },
          exercise: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { completedAt: "asc" },
  });

  return sets.map((set) => ({
    sessionId: set.sessionExercise.trainingSession.id,
    exerciseId: set.sessionExercise.exercise.id,
    exerciseName:
      set.sessionExercise.exerciseNameSnapshot ||
      set.sessionExercise.exercise.name,
    completedAt:
      set.completedAt ??
      set.sessionExercise.trainingSession.completedAt ??
      set.updatedAt,
    performedReps: set.performedReps,
    performedLoadKg: set.performedLoadKg,
    performedRpe: set.performedRpe,
    performedRir: set.performedRir,
    prescribedPercent: set.prescribedPercent,
    sessionRpe: set.sessionExercise.trainingSession.perceivedEffort,
  }));
}

function buildWindowView(input: {
  key: WindowLoadView["key"];
  label: string;
  description: string;
  from: Date;
  to: Date;
  sets: LoadSetInput[];
}): WindowLoadView {
  const totals = aggregateLoadTotals(input.sets);
  const sessions = aggregateSessionSummaries(input.sets);
  const sessionRpes = sessions
    .map((s) => s.sessionRpe)
    .filter((v): v is number => v != null);

  return {
    key: input.key,
    label: input.label,
    description: input.description,
    startIso: input.from.toISOString(),
    endIso: input.to.toISOString(),
    totals,
    avgSessionRpe: mean(sessionRpes),
    sessionCount: sessions.length,
    sessionsWithRpe: sessionRpes.length,
    daily: buildDailyVolumeSeries(input.sets),
    exercises: aggregateExerciseWorkloads(input.sets).slice(0, 12),
    sessions: sessions.slice(0, 12),
  };
}

async function resolveBlockWindow(
  athleteProfileId: string,
  asOf: Date,
): Promise<{ from: Date; to: Date; label: string; description: string } | null> {
  const program = await prisma.program.findFirst({
    where: {
      athleteProfileId,
      kind: "athlete",
      status: "active",
    },
    include: {
      blocks: { orderBy: { blockNumber: "asc" } },
    },
    orderBy: { updatedAt: "desc" },
  });

  if (!program) return null;

  const datedBlock = program.blocks.find((block) => {
    if (block.startDate && block.endDate) {
      return block.startDate <= asOf && block.endDate >= asOf;
    }
    if (block.startDate && !block.endDate) {
      return block.startDate <= asOf;
    }
    return false;
  });

  if (datedBlock?.startDate) {
    return {
      from: startOfDay(datedBlock.startDate),
      to: endOfDay(datedBlock.endDate ?? asOf),
      label: datedBlock.name?.trim()
        ? `Block · ${datedBlock.name}`
        : `Block ${datedBlock.blockNumber}`,
      description:
        "Estimated training load for the dated training block on your active program.",
    };
  }

  // Fallback: active program start → now (honest “approx block”)
  if (program.startDate) {
    return {
      from: startOfDay(program.startDate),
      to: endOfDay(asOf),
      label: `Program · ${program.name}`,
      description:
        "No dated block on the active program — showing estimated load since program start.",
    };
  }

  // Last resort: 56-day approx block window
  const from = daysAgo(asOf, 56);
  return {
    from,
    to: endOfDay(asOf),
    label: `Approx. block · ${program.name}`,
    description:
      "Block dates are not set — using an approximate 56-day window on the active program. Not a physiological mesocycle measure.",
  };
}

export async function getTrainingLoadView(
  userId: string,
  asOf = new Date(),
): Promise<TrainingLoadView | null> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true, units: true },
  });
  if (!profile) return null;

  const units = normalizeMassUnit(profile.units);
  const end = endOfDay(asOf);
  const from28 = daysAgo(asOf, LOAD_WINDOW_28_DAYS);
  const from7 = daysAgo(asOf, LOAD_WINDOW_7_DAYS);

  // Fetch enough history for spike baseline (7 recent + 21 prior = 28)
  const allSets28 = await loadSetsForProfile(profile.id, from28, end);
  const sets7 = allSets28.filter((s) => s.completedAt >= from7);

  const block = await resolveBlockWindow(profile.id, asOf);
  let setsBlock: LoadSetInput[] = [];
  if (block) {
    // May extend before 28d — fetch if needed
    if (block.from < from28) {
      setsBlock = await loadSetsForProfile(profile.id, block.from, end);
    } else {
      setsBlock = allSets28.filter((s) => s.completedAt >= block.from);
    }
  }

  const windows: WindowLoadView[] = [
    buildWindowView({
      key: "7d",
      label: "7 days",
      description: "Estimated training load over the last 7 calendar days.",
      from: from7,
      to: end,
      sets: sets7,
    }),
    buildWindowView({
      key: "28d",
      label: "28 days",
      description: "Estimated training load over the last 28 calendar days.",
      from: from28,
      to: end,
      sets: allSets28,
    }),
  ];

  if (block) {
    windows.push(
      buildWindowView({
        key: "block",
        label: block.label,
        description: block.description,
        from: block.from,
        to: block.to,
        sets: setsBlock,
      }),
    );
  }

  const daily28 = buildDailyVolumeSeries(allSets28);
  const spike = assessLoadSpike({
    daily: daily28,
    recentDays: LOAD_WINDOW_7_DAYS,
    baselineDays: LOAD_WINDOW_28_DAYS - LOAD_WINDOW_7_DAYS,
    asOf,
  });

  const recoverySince = daysAgo(asOf, LOAD_WINDOW_7_DAYS);
  const recoveryRows = await prisma.recoveryEntry.findMany({
    where: {
      athleteProfileId: profile.id,
      recordedAt: { gte: recoverySince, lte: end },
    },
    select: {
      readiness: true,
      sleepHours: true,
      soreness: true,
    },
  });

  const readiness = recoveryRows
    .map((r) => r.readiness)
    .filter((v): v is number => v != null);
  const sleep = recoveryRows
    .map((r) => r.sleepHours)
    .filter((v): v is number => v != null);
  const soreness = recoveryRows
    .map((r) => r.soreness)
    .filter((v): v is number => v != null);

  const recovery: RecoveryIndicatorView = {
    readinessMean: mean(readiness),
    readinessCount: readiness.length,
    sleepHoursMean: mean(sleep),
    sorenessMean: mean(soreness),
    windowDays: LOAD_WINDOW_7_DAYS,
    note:
      "Recovery indicators are logged readiness/sleep/soreness signals — not a medical diagnosis or validated fatigue model.",
  };

  const empty = allSets28.length === 0;

  return {
    units,
    engineVersion: TRAINING_LOAD_ENGINE_VERSION,
    disclaimers: LOAD_DISCLAIMERS,
    windows,
    spike,
    recovery,
    empty,
  };
}
