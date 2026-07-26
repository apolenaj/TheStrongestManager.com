/**
 * Retention Analytics service — cohort load + snapshot (Prompt 161).
 */

import {
  RETENTION_DEFAULT_COHORT_DAYS,
  buildRetentionAnalyticsSnapshot,
  evaluateRetentionAthlete,
  type RetentionAnalyticsSnapshot,
  type RetentionAthleteInput,
} from "@/domain/retention-analytics";
import { prisma } from "@/lib/db";

/**
 * Load non-demo athletes signed up in the cohort window.
 */
export async function loadRetentionCohortInputs(
  cohortDays: number = RETENTION_DEFAULT_COHORT_DAYS,
): Promise<RetentionAthleteInput[]> {
  const since = new Date(Date.now() - cohortDays * 24 * 60 * 60 * 1000);

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
      subscription: {
        select: {
          plan: true,
          status: true,
          createdAt: true,
          cancelAtPeriodEnd: true,
          currentPeriodEnd: true,
        },
      },
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
            take: 120,
          },
          techniqueAnalyses: {
            where: { deletedAt: null },
            select: { createdAt: true },
            orderBy: { createdAt: "asc" },
            take: 120,
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 2000,
  });

  return users.map((u) => {
    const profile = u.athleteProfile;
    return {
      userId: u.id,
      signedUpAt: u.createdAt,
      onboardingCompletedAt: profile?.onboardingCompletedAt ?? null,
      workoutCompletedAts: (profile?.trainingSessions ?? [])
        .map((s) => s.completedAt)
        .filter((d): d is Date => d != null),
      techniqueUploadedAts: (profile?.techniqueAnalyses ?? []).map(
        (t) => t.createdAt,
      ),
      subscription: u.subscription
        ? {
            plan: u.subscription.plan,
            status: u.subscription.status,
            createdAt: u.subscription.createdAt,
            cancelAtPeriodEnd: u.subscription.cancelAtPeriodEnd,
            currentPeriodEnd: u.subscription.currentPeriodEnd,
          }
        : null,
    };
  });
}

export async function getRetentionAnalyticsSnapshot(
  cohortDays: number = RETENTION_DEFAULT_COHORT_DAYS,
): Promise<RetentionAnalyticsSnapshot> {
  const inputs = await loadRetentionCohortInputs(cohortDays);
  const results = inputs.map(evaluateRetentionAthlete);
  return buildRetentionAnalyticsSnapshot({ cohortDays, results });
}
