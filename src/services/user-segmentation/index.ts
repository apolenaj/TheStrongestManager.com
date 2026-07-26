/**
 * User Segmentation service — cohort load + snapshot (Prompt 163).
 */

import {
  USER_SEGMENTATION_DEFAULT_COHORT_DAYS,
  assignUserSegments,
  buildUserSegmentationSnapshot,
  parsePreferredSports,
  type UserSegmentationInput,
  type UserSegmentationSnapshot,
} from "@/domain/user-segmentation";
import { prisma } from "@/lib/db";

export async function loadUserSegmentationInputs(
  cohortDays: number = USER_SEGMENTATION_DEFAULT_COHORT_DAYS,
): Promise<UserSegmentationInput[]> {
  const since = new Date(Date.now() - cohortDays * 24 * 60 * 60 * 1000);

  const users = await prisma.user.findMany({
    where: {
      isDemoAccount: false,
      createdAt: { gte: since },
      OR: [{ isAthlete: true }, { isCoach: true }],
      athleteProfile: { isNot: null },
    },
    select: {
      id: true,
      isCoach: true,
      subscription: {
        select: { plan: true, status: true },
      },
      athleteProfile: {
        select: {
          primaryDiscipline: true,
          trainingExperience: {
            select: { level: true, preferredSports: true },
          },
          trainingSessions: {
            where: {
              status: "completed",
              completedAt: { not: null },
            },
            select: { completedAt: true },
            orderBy: { completedAt: "desc" },
            take: 60,
          },
          techniqueAnalyses: {
            where: { deletedAt: null },
            select: { createdAt: true },
            orderBy: { createdAt: "desc" },
            take: 60,
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 2000,
  });

  return users.map((u) => {
    const profile = u.athleteProfile;
    const exp = profile?.trainingExperience;
    return {
      userId: u.id,
      experienceLevel: exp?.level ?? null,
      primaryDiscipline: profile?.primaryDiscipline ?? null,
      preferredSports: parsePreferredSports(exp?.preferredSports),
      isCoach: u.isCoach,
      subscriptionPlan: u.subscription?.plan ?? null,
      subscriptionStatus: u.subscription?.status ?? null,
      workoutCompletedAts: (profile?.trainingSessions ?? [])
        .map((s) => s.completedAt)
        .filter((d): d is Date => d != null),
      techniqueUploadedAts: (profile?.techniqueAnalyses ?? []).map(
        (t) => t.createdAt,
      ),
    };
  });
}

export async function getUserSegmentationSnapshot(
  cohortDays: number = USER_SEGMENTATION_DEFAULT_COHORT_DAYS,
): Promise<UserSegmentationSnapshot> {
  const inputs = await loadUserSegmentationInputs(cohortDays);
  const results = inputs.map(assignUserSegments);
  return buildUserSegmentationSnapshot({ cohortDays, results });
}
