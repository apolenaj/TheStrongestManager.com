/**
 * Activation Metrics service — cohort load + snapshot (Prompt 160).
 */

import {
  ACTIVATION_DEFAULT_COHORT_DAYS,
  buildActivationMetricsSnapshot,
  evaluateAthleteActivation,
  type ActivationMetricsSnapshot,
  type AthleteActivationInput,
} from "@/domain/activation-metrics";
import { prisma } from "@/lib/db";

function minDate(dates: Date[]): Date | null {
  if (dates.length === 0) return null;
  let min = dates[0]!;
  for (const d of dates) {
    if (d.getTime() < min.getTime()) min = d;
  }
  return min;
}

/**
 * Load non-demo athlete signups in the cohort window and evaluate activation.
 */
export async function loadActivationCohortInputs(
  cohortDays: number = ACTIVATION_DEFAULT_COHORT_DAYS,
): Promise<AthleteActivationInput[]> {
  const since = new Date(
    Date.now() - cohortDays * 24 * 60 * 60 * 1000,
  );

  const users = await prisma.user.findMany({
    where: {
      isDemoAccount: false,
      isAthlete: true,
      createdAt: { gte: since },
      athleteProfile: { isNot: null },
    },
    select: {
      id: true,
      createdAt: true,
      athleteProfile: {
        select: {
          onboardingCompletedAt: true,
          trainingSessions: {
            where: {
              status: "completed",
              completedAt: { not: null },
            },
            select: { completedAt: true },
            orderBy: { completedAt: "asc" },
            take: 50,
          },
          techniqueAnalyses: {
            where: { deletedAt: null },
            select: { createdAt: true },
            orderBy: { createdAt: "asc" },
            take: 50,
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 2000,
  });

  return users.map((u) => {
    const profile = u.athleteProfile;
    const workoutAts = (profile?.trainingSessions ?? [])
      .map((s) => s.completedAt)
      .filter((d): d is Date => d != null);
    const techniqueAts = (profile?.techniqueAnalyses ?? []).map(
      (t) => t.createdAt,
    );
    return {
      userId: u.id,
      signedUpAt: u.createdAt,
      onboardingCompletedAt: profile?.onboardingCompletedAt ?? null,
      firstWorkoutCompletedAt: minDate(workoutAts),
      firstTechniqueUploadedAt: minDate(techniqueAts),
      activityTimestamps: [...workoutAts, ...techniqueAts],
    };
  });
}

export async function getActivationMetricsSnapshot(
  cohortDays: number = ACTIVATION_DEFAULT_COHORT_DAYS,
): Promise<ActivationMetricsSnapshot> {
  const inputs = await loadActivationCohortInputs(cohortDays);
  const results = inputs.map(evaluateAthleteActivation);
  return buildActivationMetricsSnapshot({ cohortDays, results });
}
