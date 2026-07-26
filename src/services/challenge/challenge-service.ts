import { prisma } from "@/lib/db";
import {
  buildOptionalChallengeLeaderboard,
  CHALLENGE_CATALOG,
  CHALLENGE_HONESTY,
  computeChallengeProgress,
  getChallengeBadge,
  getChallengeById,
  isForbiddenChallengeKind,
  PILLAR_LABELS,
  resolveCompletionBadge,
  type ChallengeCompletionBadge,
  type ChallengeDefinition,
  type ChallengeLeaderboardRow,
  type ChallengeProgressResult,
} from "@/domain/challenge";

export type ChallengeCardView = {
  definition: ChallengeDefinition;
  pillarLabel: string;
  enrollment: {
    id: string;
    status: string;
    startedAt: string;
    completedAt: string | null;
    leaderboardOptIn: boolean;
    badgeAwardedAt: string | null;
  } | null;
  progress: ChallengeProgressResult | null;
  completionBadge: ChallengeCompletionBadge | null;
  leaderboard: ChallengeLeaderboardRow[] | null;
};

export type ChallengePageView = {
  honesty: readonly string[];
  challenges: ChallengeCardView[];
  earnedBadges: ChallengeCompletionBadge[];
};

async function collectProgressInput(
  athleteProfileId: string,
  def: ChallengeDefinition,
  startedAt: Date,
) {
  const now = new Date();
  const windowStart = startedAt;
  const windowEnd =
    def.durationDays != null
      ? new Date(
          windowStart.getTime() + def.durationDays * 24 * 60 * 60 * 1000,
        )
      : now;
  const createdTo = windowEnd > now ? now : windowEnd;

  const profile = await prisma.athleteProfile.findUnique({
    where: { id: athleteProfileId },
    select: { userId: true },
  });

  const [techniqueRows, sessions, academyEnrollments] = await Promise.all([
    prisma.techniqueAnalysis.findMany({
      where: {
        athleteProfileId,
        deletedAt: null,
        createdAt: { gte: windowStart, lte: createdTo },
      },
      orderBy: { createdAt: "asc" },
      select: {
        createdAt: true,
        overallScore: true,
        exercise: { select: { slug: true, name: true } },
      },
    }),
    prisma.trainingSession.findMany({
      where: {
        athleteProfileId,
        status: "completed",
        completedAt: { gte: windowStart },
      },
      select: { completedAt: true },
      orderBy: { completedAt: "asc" },
    }),
    profile
      ? prisma.academyEnrollment.findMany({
          where: { userId: profile.userId },
          select: { id: true },
        })
      : Promise.resolve([]),
  ]);

  const lessons =
    academyEnrollments.length === 0
      ? []
      : await prisma.academyLessonProgress.findMany({
          where: {
            enrollmentId: { in: academyEnrollments.map((e) => e.id) },
            completedAt: { gte: windowStart },
          },
          select: { completedAt: true },
        });

  const techniqueFiltered = def.focusExerciseKey
    ? techniqueRows.filter((t) => {
        const key = def.focusExerciseKey!.toLowerCase();
        const slug = t.exercise?.slug?.toLowerCase() ?? "";
        const name = t.exercise?.name?.toLowerCase() ?? "";
        return slug.includes(key) || name.includes(key);
      })
    : techniqueRows;

  return {
    techniqueDays: techniqueFiltered.map((t) => t.createdAt.toISOString()),
    completedSessionAt: sessions
      .map((s) => s.completedAt?.toISOString())
      .filter((x): x is string => Boolean(x)),
    techniqueScores: techniqueFiltered
      .map((t) => t.overallScore)
      .filter((s): s is number => s != null && Number.isFinite(s)),
    academyLessonCompletedAt: lessons.map((l) => l.completedAt.toISOString()),
    startedAt: startedAt.toISOString(),
    now: now.toISOString(),
  };
}

async function refreshEnrollmentProgress(
  enrollmentId: string,
  athleteProfileId: string,
  challengeId: string,
  startedAt: Date,
  currentStatus: string,
  currentCompletedAt: Date | null,
  currentBadgeAwardedAt: Date | null,
) {
  const def = getChallengeById(challengeId);
  if (!def || isForbiddenChallengeKind(def.safetyKind)) {
    return null;
  }

  const input = await collectProgressInput(athleteProfileId, def, startedAt);
  const progress = computeChallengeProgress(def, input);

  const nextStatus =
    progress.completed
      ? "completed"
      : currentStatus === "abandoned"
        ? "abandoned"
        : "active";

  const completedAt =
    nextStatus === "completed"
      ? currentCompletedAt ?? new Date()
      : null;

  const badgeAwardedAt =
    progress.completed && !currentBadgeAwardedAt
      ? new Date()
      : currentBadgeAwardedAt;

  await prisma.challengeEnrollment.update({
    where: { id: enrollmentId },
    data: {
      progressValue: progress.currentValue,
      progressJson: JSON.stringify(progress),
      status: nextStatus,
      completedAt,
      badgeAwardedAt,
    },
  });

  return { progress, badgeAwardedAt, status: nextStatus, completedAt };
}

export async function getChallengePage(
  userId: string,
): Promise<ChallengePageView | null> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      displayName: true,
      challengeEnrollments: true,
    },
  });
  if (!profile) return null;

  const byChallenge = new Map(
    profile.challengeEnrollments.map((e) => [e.challengeId, e]),
  );

  const challenges: ChallengeCardView[] = [];
  const earnedBadges: ChallengeCompletionBadge[] = [];

  for (const def of CHALLENGE_CATALOG) {
    if (isForbiddenChallengeKind(def.safetyKind)) continue;

    const enrollment = byChallenge.get(def.id) ?? null;
    let progress: ChallengeProgressResult | null = null;
    let badgeAwardedAt: string | null = enrollment?.badgeAwardedAt?.toISOString() ?? null;
    let enrollmentView = enrollment
      ? {
          id: enrollment.id,
          status: enrollment.status,
          startedAt: enrollment.startedAt.toISOString(),
          completedAt: enrollment.completedAt?.toISOString() ?? null,
          leaderboardOptIn: enrollment.leaderboardOptIn,
          badgeAwardedAt,
        }
      : null;

    if (enrollment && enrollment.status !== "abandoned") {
      const refreshed = await refreshEnrollmentProgress(
        enrollment.id,
        profile.id,
        def.id,
        enrollment.startedAt,
        enrollment.status,
        enrollment.completedAt,
        enrollment.badgeAwardedAt,
      );
      if (refreshed) {
        progress = refreshed.progress;
        badgeAwardedAt = refreshed.badgeAwardedAt?.toISOString() ?? null;
        enrollmentView = {
          id: enrollment.id,
          status: refreshed.status,
          startedAt: enrollment.startedAt.toISOString(),
          completedAt: refreshed.completedAt?.toISOString() ?? null,
          leaderboardOptIn: enrollment.leaderboardOptIn,
          badgeAwardedAt,
        };
      }
    }

    const completionBadge = resolveCompletionBadge(
      def.completionBadgeId,
      Boolean(badgeAwardedAt) || Boolean(progress?.completed),
    );
    if (completionBadge && badgeAwardedAt) {
      earnedBadges.push(completionBadge);
    }

    let leaderboard: ChallengeLeaderboardRow[] | null = null;
    if (def.leaderboardEnabled) {
      const peers = await prisma.challengeEnrollment.findMany({
        where: {
          challengeId: def.id,
          leaderboardOptIn: true,
          status: { in: ["active", "completed"] },
        },
        take: 50,
        include: {
          athleteProfile: { select: { id: true, displayName: true } },
        },
        orderBy: { progressValue: "desc" },
      });
      leaderboard = buildOptionalChallengeLeaderboard(
        def,
        peers.map((p) => ({
          athleteProfileId: p.athleteProfileId,
          displayLabel:
            p.athleteProfile.displayName?.trim() ||
            `Athlete ${p.athleteProfileId.slice(-4).toUpperCase()}`,
          progressValue: p.progressValue,
          completed: p.status === "completed",
        })),
      );
    }

    challenges.push({
      definition: def,
      pillarLabel: PILLAR_LABELS[def.rewardPillar],
      enrollment: enrollmentView,
      progress,
      completionBadge,
      leaderboard,
    });
  }

  return {
    honesty: CHALLENGE_HONESTY,
    challenges,
    earnedBadges,
  };
}

export async function enrollInChallenge(
  userId: string,
  challengeId: string,
  leaderboardOptIn = false,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const def = getChallengeById(challengeId);
  if (!def) return { ok: false, error: "Challenge not found." };
  if (isForbiddenChallengeKind(def.safetyKind)) {
    return { ok: false, error: "This challenge type is not allowed." };
  }

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return { ok: false, error: "No athlete profile." };

  const existing = await prisma.challengeEnrollment.findUnique({
    where: {
      athleteProfileId_challengeId: {
        athleteProfileId: profile.id,
        challengeId: def.id,
      },
    },
  });
  if (existing && existing.status !== "abandoned") {
    return { ok: false, error: "Already enrolled in this challenge." };
  }

  if (existing) {
    await prisma.challengeEnrollment.update({
      where: { id: existing.id },
      data: {
        status: "active",
        startedAt: new Date(),
        completedAt: null,
        progressValue: 0,
        progressJson: "{}",
        badgeAwardedAt: null,
        leaderboardOptIn: def.leaderboardEnabled ? leaderboardOptIn : false,
      },
    });
  } else {
    await prisma.challengeEnrollment.create({
      data: {
        athleteProfileId: profile.id,
        challengeId: def.id,
        status: "active",
        leaderboardOptIn: def.leaderboardEnabled ? leaderboardOptIn : false,
      },
    });
  }

  return { ok: true };
}

export async function setChallengeLeaderboardOptIn(
  userId: string,
  challengeId: string,
  optIn: boolean,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const def = getChallengeById(challengeId);
  if (!def?.leaderboardEnabled) {
    return { ok: false, error: "This challenge has no leaderboard." };
  }

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return { ok: false, error: "No athlete profile." };

  const enrollment = await prisma.challengeEnrollment.findUnique({
    where: {
      athleteProfileId_challengeId: {
        athleteProfileId: profile.id,
        challengeId,
      },
    },
  });
  if (!enrollment) return { ok: false, error: "Not enrolled." };

  await prisma.challengeEnrollment.update({
    where: { id: enrollment.id },
    data: { leaderboardOptIn: optIn },
  });
  return { ok: true };
}

export async function abandonChallenge(
  userId: string,
  challengeId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return { ok: false, error: "No athlete profile." };

  const enrollment = await prisma.challengeEnrollment.findUnique({
    where: {
      athleteProfileId_challengeId: {
        athleteProfileId: profile.id,
        challengeId,
      },
    },
  });
  if (!enrollment) return { ok: false, error: "Not enrolled." };

  await prisma.challengeEnrollment.update({
    where: { id: enrollment.id },
    data: { status: "abandoned" },
  });
  return { ok: true };
}

/** Expose catalog badge lookup for UI. */
export { getChallengeBadge };
