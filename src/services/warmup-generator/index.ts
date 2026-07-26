import { prisma } from "@/lib/db";
import {
  WARMUP_HISTORY_LOOKBACK_DAYS,
  WARMUP_KNOWN_EXERCISES,
  buildWarmupGeneratorSnapshot,
  type WarmupExerciseId,
  type WarmupGeneratorSnapshot,
  type WarmupHistorySignal,
} from "@/domain/warmup-generator";

export type WarmupGeneratorPageData = {
  profileId: string;
  exercises: Array<{
    id: WarmupExerciseId;
    label: string;
    history: WarmupHistorySignal;
    /** Suggested target from heaviest recent working set, if any. */
    suggestedTargetKg: number | null;
  }>;
  defaultExerciseId: WarmupExerciseId;
};

const SLUGS: WarmupExerciseId[] = [
  "back-squat",
  "bench-press",
  "deadlift",
  "overhead-press",
  "front-squat",
];

/**
 * Load recent working-set history per known exercise for warm-up planning.
 * Never invents volume — empty history is honest.
 */
export async function getWarmupGeneratorData(
  userId: string,
): Promise<WarmupGeneratorPageData | null> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return null;

  const since = new Date(
    Date.now() - WARMUP_HISTORY_LOOKBACK_DAYS * 24 * 60 * 60 * 1000,
  );

  const sets = await prisma.sessionSet.findMany({
    where: {
      completedAt: { gte: since },
      performedLoadKg: { not: null },
      performedReps: { not: null },
      setType: { in: ["work", "amrap"] },
      sessionExercise: {
        exercise: { slug: { in: [...SLUGS] } },
        trainingSession: {
          athleteProfileId: profile.id,
          status: "completed",
        },
      },
    },
    select: {
      performedLoadKg: true,
      performedReps: true,
      completedAt: true,
      sessionExercise: {
        select: {
          exercise: { select: { slug: true } },
          trainingSession: { select: { completedAt: true, id: true } },
        },
      },
    },
  });

  const bySlug = new Map<
    string,
    {
      volume: number;
      heaviest: number | null;
      sessions: Set<string>;
      lastAt: Date | null;
    }
  >();

  for (const row of sets) {
    const slug = row.sessionExercise.exercise.slug;
    const load = row.performedLoadKg;
    const reps = row.performedReps;
    if (load == null || reps == null) continue;
    let bucket = bySlug.get(slug);
    if (!bucket) {
      bucket = {
        volume: 0,
        heaviest: null,
        sessions: new Set(),
        lastAt: null,
      };
      bySlug.set(slug, bucket);
    }
    bucket.volume += load * reps;
    bucket.heaviest =
      bucket.heaviest == null ? load : Math.max(bucket.heaviest, load);
    const sid = row.sessionExercise.trainingSession.id;
    bucket.sessions.add(sid);
    const at =
      row.completedAt ?? row.sessionExercise.trainingSession.completedAt ?? null;
    if (at && (!bucket.lastAt || at > bucket.lastAt)) bucket.lastAt = at;
  }

  const exercises: WarmupGeneratorPageData["exercises"] = WARMUP_KNOWN_EXERCISES.map(
    (ex) => {
      if (ex.id === "custom") {
        return {
          id: ex.id,
          label: ex.label,
          history: {
            sessionCount: 0,
            volumeKgReps: 0,
            heaviestLoadKg: null,
            lastTrainedAt: null,
          },
          suggestedTargetKg: null,
        };
      }
      const b = bySlug.get(ex.id);
      return {
        id: ex.id,
        label: ex.label,
        history: {
          sessionCount: b?.sessions.size ?? 0,
          volumeKgReps: b?.volume ?? 0,
          heaviestLoadKg: b?.heaviest ?? null,
          lastTrainedAt: b?.lastAt?.toISOString() ?? null,
        },
        suggestedTargetKg: b?.heaviest ?? null,
      };
    },
  );

  const withHistory = exercises.find(
    (e) => e.id !== "custom" && e.history.sessionCount > 0,
  );

  return {
    profileId: profile.id,
    exercises,
    defaultExerciseId: withHistory?.id ?? "back-squat",
  };
}

export function getWarmupGeneratorAdminSnapshot(): WarmupGeneratorSnapshot {
  return buildWarmupGeneratorSnapshot();
}
