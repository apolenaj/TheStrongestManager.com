import { prisma } from "@/lib/db";
import { getAthleteState } from "@/services/performance-intelligence";
import {
  assessGoalsProgress,
  estimateSetE1rmKg,
  GOAL_TRAJECTORY_LOOKBACK_DAYS,
  inferLiftFromTitle,
  inferTrainingPhase,
  mapTrendDirection,
  predictOneRmRange,
  type GoalProgressInput,
  type GoalProgressResult,
  type TrajectorySample,
  type WorkingSetInput,
} from "@/domain/goal-probability/service-deps";

const LIFT_SLUGS = [
  "back-squat",
  "bench-press",
  "deadlift",
  "overhead-press",
] as const;

export type GoalProbabilityView = {
  profileId: string;
  result: GoalProgressResult;
  lookbackDays: number;
};

function bestDailyEstimates(sets: WorkingSetInput[]): TrajectorySample[] {
  const byDay = new Map<string, number>();
  for (const set of sets) {
    const e = estimateSetE1rmKg(set);
    if (e == null) continue;
    const day = set.completedAt.toISOString().slice(0, 10);
    const prev = byDay.get(day);
    if (prev == null || e > prev) byDay.set(day, e);
  }
  return [...byDay.entries()]
    .map(([day, estimateKg]) => ({
      at: new Date(`${day}T12:00:00.000Z`),
      estimateKg,
    }))
    .sort((a, b) => a.at.getTime() - b.at.getTime());
}

/**
 * Goal progress estimation — qualitative trajectory, never a probability %.
 */
export async function getGoalProbability(
  userId: string,
): Promise<GoalProbabilityView | null> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return null;

  const now = new Date();
  const since = new Date(
    now.getTime() - GOAL_TRAJECTORY_LOOKBACK_DAYS * 24 * 60 * 60 * 1000,
  );

  const [goals, stateView, recovery, activeProgram, sets] = await Promise.all([
    prisma.goal.findMany({
      where: {
        athleteProfileId: profile.id,
        status: { in: ["active", "paused"] },
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      take: 8,
    }),
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
          exercise: { slug: { in: [...LIFT_SLUGS] } },
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
            exercise: { select: { slug: true } },
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

  const setsBySlug = new Map<string, WorkingSetInput[]>();
  for (const slug of LIFT_SLUGS) setsBySlug.set(slug, []);

  for (const row of sets) {
    const slug = row.sessionExercise.exercise?.slug;
    if (!slug || !setsBySlug.has(slug)) continue;
    if (
      row.performedLoadKg == null ||
      row.performedReps == null ||
      row.completedAt == null
    ) {
      continue;
    }
    let hitRepTarget: boolean | null = null;
    if (row.prescribedReps != null) {
      hitRepTarget = row.performedReps >= row.prescribedReps;
    }
    setsBySlug.get(slug)!.push({
      loadKg: row.performedLoadKg,
      reps: row.performedReps,
      rpe: row.performedRpe,
      completedAt: row.completedAt,
      hitRepTarget,
    });
  }

  const inputs: GoalProgressInput[] = goals.map((goal) => {
    const liftSlug = inferLiftFromTitle(goal.title);
    const workingSets = liftSlug ? (setsBySlug.get(liftSlug) ?? []) : [];

    let currentEstimateKg: GoalProgressInput["currentEstimateKg"] = null;
    if (liftSlug && workingSets.length > 0) {
      const predicted = predictOneRmRange(
        {
          exerciseKey: liftSlug,
          exerciseLabel: liftSlug,
          workingSets,
          trend,
          trainingPhase,
          fatigue,
          readiness,
        },
        now,
      );
      if ("prediction" in predicted) {
        currentEstimateKg = predicted.prediction.rangeKg;
      }
    }

    return {
      goal: {
        id: goal.id,
        title: goal.title,
        category: goal.category,
        targetValue: goal.targetValue,
        targetUnit: goal.targetUnit,
        targetDate: goal.targetDate,
        status: goal.status,
        liftSlug,
      },
      currentEstimateKg,
      trajectorySamples: bestDailyEstimates(workingSets),
    };
  });

  return {
    profileId: profile.id,
    result: assessGoalsProgress(inputs, now),
    lookbackDays: GOAL_TRAJECTORY_LOOKBACK_DAYS,
  };
}
