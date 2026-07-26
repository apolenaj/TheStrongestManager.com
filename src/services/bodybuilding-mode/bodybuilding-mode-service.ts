/**
 * Gather Bodybuilding Mode signals — observed sets, muscles, bodyweight, recovery.
 */

import { featureFlags } from "@/config/feature-flags";
import {
  DEFAULT_BODYBUILDING_LOOKBACK_DAYS,
  assembleBodybuildingMode,
  type BodybuildingModePayload,
  type BodybuildingModeSignals,
} from "@/domain/bodybuilding-mode";
import { isHardSet, setVolumeKg } from "@/domain/training-load/compute";
import { prisma } from "@/lib/db";
import { toCanonicalKg } from "@/services/units/convert";

function daysAgo(days: number, now: Date): Date {
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() - days);
  return d;
}

function parseMuscleKeys(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

async function gatherSignals(
  athleteProfileId: string,
  lookbackDays: number,
  now: Date,
): Promise<BodybuildingModeSignals> {
  const from = daysAgo(lookbackDays, now);

  const [sets, bodyMetrics, recovery] = await Promise.all([
    prisma.sessionSet.findMany({
      where: {
        completedAt: { gte: from, lt: now },
        sessionExercise: {
          trainingSession: {
            athleteProfileId,
            status: "completed",
          },
        },
      },
      select: {
        performedLoadKg: true,
        performedReps: true,
        performedRpe: true,
        performedRir: true,
        completedAt: true,
        sessionExercise: {
          select: {
            exerciseId: true,
            exerciseNameSnapshot: true,
            exercise: {
              select: {
                slug: true,
                primaryMuscles: true,
                name: true,
              },
            },
            trainingSessionId: true,
          },
        },
      },
    }),
    prisma.bodyMetric.findMany({
      where: {
        athleteProfileId,
        metricKey: "bodyweight",
      },
      orderBy: { recordedAt: "desc" },
      take: 8,
      select: { value: true, unit: true, recordedAt: true },
    }),
    prisma.recoveryEntry.findFirst({
      where: {
        athleteProfileId,
        recordedAt: { gte: from, lt: now },
      },
      orderBy: { recordedAt: "desc" },
      select: { readiness: true },
    }),
  ]);

  const muscleMap = new Map<string, { setCount: number; volumeKg: number }>();
  const exerciseMap = new Map<
    string,
    {
      exerciseId: string;
      exerciseName: string;
      slug: string | null;
      setCount: number;
      volumeKg: number;
      loads: Array<{ at: Date; loadKg: number }>;
    }
  >();
  const sessionIds = new Set<string>();
  let volumeKg = 0;
  let setCount = 0;
  let hardSetCount = 0;

  for (const set of sets) {
    setCount += 1;
    sessionIds.add(set.sessionExercise.trainingSessionId);
    const vol = setVolumeKg({
      performedLoadKg: set.performedLoadKg,
      performedReps: set.performedReps,
    });
    if (vol != null) volumeKg += vol;
    if (
      isHardSet({
        performedRpe: set.performedRpe,
        performedRir: set.performedRir,
      })
    ) {
      hardSetCount += 1;
    }

    const muscles = parseMuscleKeys(set.sessionExercise.exercise.primaryMuscles);
    for (const muscleKey of muscles) {
      const row = muscleMap.get(muscleKey) ?? { setCount: 0, volumeKg: 0 };
      row.setCount += 1;
      row.volumeKg += vol ?? 0;
      muscleMap.set(muscleKey, row);
    }

    const exerciseId = set.sessionExercise.exerciseId;
    const ex = exerciseMap.get(exerciseId) ?? {
      exerciseId,
      exerciseName:
        set.sessionExercise.exercise.name ||
        set.sessionExercise.exerciseNameSnapshot,
      slug: set.sessionExercise.exercise.slug,
      setCount: 0,
      volumeKg: 0,
      loads: [] as Array<{ at: Date; loadKg: number }>,
    };
    ex.setCount += 1;
    ex.volumeKg += vol ?? 0;
    if (set.performedLoadKg != null && set.completedAt) {
      ex.loads.push({ at: set.completedAt, loadKg: set.performedLoadKg });
    }
    exerciseMap.set(exerciseId, ex);
  }

  const exercises = [...exerciseMap.values()].map((ex) => {
    const sorted = [...ex.loads].sort(
      (a, b) => b.at.getTime() - a.at.getTime(),
    );
    const latestLoadKg = sorted[0]?.loadKg ?? null;
    // Prior: max load from older half / previous session-ish
    const older = sorted.slice(1);
    const priorLoadKg =
      older.length > 0
        ? older.reduce((max, l) => Math.max(max, l.loadKg), 0)
        : null;
    return {
      exerciseId: ex.exerciseId,
      exerciseName: ex.exerciseName,
      slug: ex.slug,
      setCount: ex.setCount,
      volumeKg: ex.volumeKg,
      latestLoadKg,
      priorLoadKg,
    };
  });

  const bw = bodyMetrics.map((m) => ({
    kg: toCanonicalKg(m.value, m.unit ?? "kg"),
    at: m.recordedAt,
  }));

  return {
    now,
    lookbackDays,
    muscleSets: [...muscleMap.entries()].map(([muscleKey, row]) => ({
      muscleKey,
      setCount: row.setCount,
      volumeKg: row.volumeKg,
    })),
    exercises,
    weeklyVolume: {
      volumeKg: Math.round(volumeKg * 10) / 10,
      setCount,
      hardSetCount,
      sessionCount: sessionIds.size,
    },
    bodyweight: {
      latestKg: bw[0]?.kg ?? null,
      priorKg: bw[1]?.kg ?? null,
      sampleCount: bw.length,
    },
    recovery: {
      hasRecentEntry: Boolean(recovery),
      latestReadiness: recovery?.readiness ?? null,
    },
  };
}

export async function getBodybuildingMode(input: {
  userId: string;
  lookbackDays?: number;
}): Promise<
  | { ok: true; mode: BodybuildingModePayload }
  | { ok: false; error: string }
> {
  if (!featureFlags.bodybuildingMode) {
    return { ok: false, error: "Bodybuilding Mode is not enabled." };
  }

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: { id: true },
  });
  if (!profile) {
    return { ok: false, error: "Athlete profile required." };
  }

  const lookbackDays =
    input.lookbackDays ?? DEFAULT_BODYBUILDING_LOOKBACK_DAYS;
  const signals = await gatherSignals(profile.id, lookbackDays, new Date());
  return { ok: true, mode: assembleBodybuildingMode(signals) };
}
