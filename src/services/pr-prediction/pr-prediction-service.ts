import { prisma } from "@/lib/db";
import { getAthleteState } from "@/services/performance-intelligence";
import { PAIN_SAFE_SEEK_CARE_MESSAGE } from "@/domain/pain-safe-response-system";
import { isPainSafeModeActiveForAthlete } from "@/services/pain-safe-response-system";
import {
  inferTrainingPhase,
  mapTrendDirection,
  predictPrRanges,
  PR_LOOKBACK_DAYS,
  type PrPredictionContext,
  type PrPredictionResult,
  type WorkingSetInput,
} from "@/domain/pr-prediction";

/** Competition-style lifts we attempt to predict by default. */
const PREDICTION_SLUGS = [
  "back-squat",
  "bench-press",
  "deadlift",
  "overhead-press",
] as const;

export type PrPredictionView = {
  profileId: string;
  result: PrPredictionResult;
  lookbackDays: number;
  painSafeModeActive: boolean;
  painSafeMessage: string | null;
};

function exerciseLabel(name: string, slug: string): string {
  return name.trim() || slug;
}

/**
 * Gather recent working sets + context and run conservative PR predictions.
 * UI must not invent ranges client-side.
 */
export async function getPrPredictions(
  userId: string,
): Promise<PrPredictionView | null> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return null;

  const now = new Date();
  const since = new Date(
    now.getTime() - PR_LOOKBACK_DAYS * 24 * 60 * 60 * 1000,
  );

  const [stateView, recovery, activeProgram, sets] = await Promise.all([
    getAthleteState(userId),
    prisma.recoveryEntry.findFirst({
      where: { athleteProfileId: profile.id },
      orderBy: { recordedAt: "desc" },
      select: { fatigue: true, readiness: true },
    }),
    prisma.program.findFirst({
      where: {
        athleteProfileId: profile.id,
        kind: "athlete",
        status: "active",
      },
      orderBy: { updatedAt: "desc" },
      select: {
        name: true,
        blocks: {
          orderBy: { blockNumber: "desc" },
          take: 1,
          select: { name: true, focus: true },
        },
      },
    }),
    prisma.sessionSet.findMany({
      where: {
        completedAt: { gte: since },
        performedLoadKg: { not: null },
        performedReps: { not: null },
        setType: { in: ["work", "amrap"] },
        sessionExercise: {
          exercise: { slug: { in: [...PREDICTION_SLUGS] } },
          trainingSession: {
            athleteProfileId: profile.id,
            status: "completed",
          },
        },
      },
      orderBy: { completedAt: "asc" },
      select: {
        performedLoadKg: true,
        performedReps: true,
        performedRpe: true,
        prescribedReps: true,
        completedAt: true,
        sessionExercise: {
          select: {
            exercise: { select: { slug: true, name: true } },
          },
        },
      },
    }),
  ]);

  const trend = mapTrendDirection(
    stateView?.state.performanceTrend.value?.direction,
  );
  const latestBlock = activeProgram?.blocks[0];
  const phaseSource =
    [latestBlock?.name, latestBlock?.focus, activeProgram?.name]
      .filter(Boolean)
      .join(" ") ||
    stateView?.state.programProgress.value?.activeProgramName ||
    null;
  const trainingPhase = inferTrainingPhase(phaseSource);
  const fatigue = recovery?.fatigue ?? null;
  const readiness = recovery?.readiness ?? null;

  const bySlug = new Map<string, { label: string; sets: WorkingSetInput[] }>();
  for (const slug of PREDICTION_SLUGS) {
    bySlug.set(slug, { label: slug, sets: [] });
  }

  for (const row of sets) {
    const ex = row.sessionExercise.exercise;
    if (!ex || row.performedLoadKg == null || row.performedReps == null) {
      continue;
    }
    if (row.completedAt == null) continue;

    const bucket = bySlug.get(ex.slug);
    if (!bucket) continue;

    bucket.label = exerciseLabel(ex.name, ex.slug);

    let hitRepTarget: boolean | null = null;
    if (row.prescribedReps != null) {
      hitRepTarget = row.performedReps >= row.prescribedReps;
    }

    bucket.sets.push({
      loadKg: row.performedLoadKg,
      reps: row.performedReps,
      rpe: row.performedRpe,
      completedAt: row.completedAt,
      hitRepTarget,
    });
  }

  const contexts: PrPredictionContext[] = [];
  for (const [slug, bucket] of bySlug) {
    // Skip lifts with zero history in lookback entirely from withheld noise
    // only if never trained — still report withheld when they have soft sets.
    if (bucket.sets.length === 0) continue;
    contexts.push({
      exerciseKey: slug,
      exerciseLabel: bucket.label,
      workingSets: bucket.sets,
      trend,
      trainingPhase,
      fatigue,
      readiness,
    });
  }

  const result = predictPrRanges(contexts, now);
  const painSafeModeActive = await isPainSafeModeActiveForAthlete(profile.id);

  return {
    profileId: profile.id,
    result,
    lookbackDays: PR_LOOKBACK_DAYS,
    painSafeModeActive,
    painSafeMessage: painSafeModeActive ? PAIN_SAFE_SEEK_CARE_MESSAGE : null,
  };
}
