import { prisma } from "@/lib/db";
import { countDistinctTrainingWeeks } from "@/domain/achievement";
import {
  ATHLETE_LEVEL_HONESTY,
  FACTOR_LABELS,
  LEVEL_DESCRIPTIONS,
  resolveAthleteLevel,
  SPORT_STRENGTH_CLASS_BOUNDARY,
  type AthleteLevelEvidence,
  type AthleteLevelResult,
} from "@/domain/athlete-level";
import { detectPrEvents } from "@/domain/pr-intelligence";
import type {
  StrengthSample,
  TechniqueSample,
} from "@/domain/pr-intelligence";
import { isOfficiallyVerified } from "@/domain/verified-lift";
import {
  isLiftReviewStatus,
  isLiftVerificationLevel,
  parseLiftClaimMetadata,
} from "@/domain/verified-lift";

export type AthleteLevelPageView = {
  optedIn: boolean;
  honesty: readonly string[];
  sportStrengthBoundary: readonly string[];
  result: AthleteLevelResult | null;
  factorLabels: typeof FACTOR_LABELS;
  levelDescriptions: typeof LEVEL_DESCRIPTIONS;
};

const MAJOR_SLUGS = [
  "back-squat",
  "bench-press",
  "deadlift",
  "overhead-press",
] as const;

async function buildEvidence(
  athleteProfileId: string,
  userId: string,
): Promise<AthleteLevelEvidence> {
  const [sessions, techniqueRows, academyEnrollments, competitionCount, claims] =
    await Promise.all([
      prisma.trainingSession.findMany({
        where: { athleteProfileId, status: "completed" },
        select: { completedAt: true },
        orderBy: { completedAt: "asc" },
      }),
      prisma.techniqueAnalysis.findMany({
        where: {
          athleteProfileId,
          deletedAt: null,
          status: "completed",
          overallScore: { not: null },
        },
        orderBy: { createdAt: "asc" },
        select: { overallScore: true },
      }),
      prisma.academyEnrollment.findMany({
        where: { userId },
        select: { id: true },
      }),
      prisma.competitionPrep.count({
        where: { athleteProfileId, status: "completed" },
      }),
      prisma.verifiedLiftClaim.findMany({
        where: { athleteProfileId },
        select: {
          level: true,
          reviewStatus: true,
          techniqueAnalysisId: true,
          videoStorageKey: true,
          metadataJson: true,
          loadKg: true,
          reps: true,
        },
      }),
    ]);

  const lessons =
    academyEnrollments.length === 0
      ? []
      : await prisma.academyLessonProgress.findMany({
          where: {
            enrollmentId: { in: academyEnrollments.map((e) => e.id) },
          },
          select: { id: true },
        });

  const completedAt = sessions
    .map((s) => s.completedAt?.toISOString())
    .filter((x): x is string => Boolean(x));

  const scores = techniqueRows
    .map((t) => t.overallScore)
    .filter((s): s is number => s != null && Number.isFinite(s));

  let techniqueScoreDelta = 0;
  if (scores.length >= 2) {
    techniqueScoreDelta = Math.max(0, scores[scores.length - 1]! - scores[0]!);
  }

  let trainingHistorySpanDays = 0;
  if (completedAt.length >= 2) {
    const first = new Date(completedAt[0]!).getTime();
    const last = new Date(completedAt[completedAt.length - 1]!).getTime();
    trainingHistorySpanDays = Math.max(
      0,
      Math.round((last - first) / (24 * 60 * 60 * 1000)),
    );
  }

  const hasOfficialLift = claims.some((c) => {
    const level = isLiftVerificationLevel(c.level) ? c.level : "self_reported";
    const reviewStatus = isLiftReviewStatus(c.reviewStatus)
      ? c.reviewStatus
      : "none";
    return isOfficiallyVerified({
      level,
      reviewStatus,
      hasVideoEvidence: Boolean(
        c.techniqueAnalysisId || c.videoStorageKey?.trim(),
      ),
      metadata: parseLiftClaimMetadata(c.metadataJson),
      loadKg: c.loadKg,
      reps: c.reps,
    });
  });

  const loggedPrCount = await countLoggedPrs(athleteProfileId);

  return {
    distinctTrainingWeeks: countDistinctTrainingWeeks(completedAt),
    completedSessionCount: sessions.length,
    academyLessonsCompleted: lessons.length,
    scoredTechniqueCount: techniqueRows.length,
    techniqueScoreDelta,
    trainingHistorySpanDays,
    loggedPrCount,
    hasCompetitiveEvidence: competitionCount > 0 || hasOfficialLift,
    // Passed to prove we ignore engagement — not queried from DB.
    appOpenDaysIgnored: 0,
  };
}

async function countLoggedPrs(athleteProfileId: string): Promise<number> {
  const [sets, techniqueRows] = await Promise.all([
    prisma.sessionSet.findMany({
      where: {
        performedLoadKg: { not: null },
        performedReps: { not: null },
        setType: { in: ["work", "amrap"] },
        sessionExercise: {
          exercise: { slug: { in: [...MAJOR_SLUGS] } },
          trainingSession: {
            athleteProfileId,
            status: "completed",
          },
        },
      },
      orderBy: { completedAt: "asc" },
      take: 400,
      select: {
        id: true,
        performedLoadKg: true,
        performedReps: true,
        completedAt: true,
        sessionExercise: {
          select: {
            exercise: { select: { slug: true, name: true } },
          },
        },
      },
    }),
    prisma.techniqueAnalysis.findMany({
      where: {
        athleteProfileId,
        deletedAt: null,
        status: "completed",
        overallScore: { not: null },
        exerciseId: { not: null },
      },
      orderBy: { createdAt: "asc" },
      take: 150,
      select: {
        id: true,
        overallScore: true,
        createdAt: true,
        exercise: { select: { slug: true, name: true } },
      },
    }),
  ]);

  const strength: StrengthSample[] = sets.flatMap((s) => {
    const load = s.performedLoadKg;
    const reps = s.performedReps;
    const at = s.completedAt;
    const ex = s.sessionExercise.exercise;
    if (load == null || reps == null || !at || !ex) return [];
    return [
      {
        id: s.id,
        exerciseKey: ex.slug,
        exerciseLabel: ex.name,
        loadKg: load,
        reps,
        at,
      },
    ];
  });

  const technique: TechniqueSample[] = techniqueRows.flatMap((t) => {
    if (t.overallScore == null || !t.exercise) return [];
    return [
      {
        id: t.id,
        exerciseKey: t.exercise.slug,
        exerciseLabel: t.exercise.name,
        overallScore: t.overallScore,
        at: t.createdAt,
      },
    ];
  });

  const timeline = detectPrEvents(strength, technique);
  return timeline.events.filter(
    (e) =>
      e.types.includes("one_rm") ||
      e.types.includes("rep_pr") ||
      e.types.includes("volume_pr") ||
      e.types.includes("technical_pr"),
  ).length;
}

export async function getAthleteLevelPage(
  userId: string,
): Promise<AthleteLevelPageView | null> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      athleteLevelOptIn: true,
    },
  });
  if (!profile) return null;

  const optedIn = profile.athleteLevelOptIn?.optedIn ?? false;
  let result: AthleteLevelResult | null = null;

  if (optedIn) {
    const evidence = await buildEvidence(profile.id, userId);
    result = resolveAthleteLevel(evidence);

    await prisma.athleteLevelOptIn.update({
      where: { athleteProfileId: profile.id },
      data: {
        lastLevelId: result.level,
        lastComposite: result.composite,
        lastComputedAt: new Date(),
      },
    });
  }

  return {
    optedIn,
    honesty: ATHLETE_LEVEL_HONESTY,
    sportStrengthBoundary: SPORT_STRENGTH_CLASS_BOUNDARY,
    result,
    factorLabels: FACTOR_LABELS,
    levelDescriptions: LEVEL_DESCRIPTIONS,
  };
}

export async function setAthleteLevelOptIn(
  userId: string,
  optedIn: boolean,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return { ok: false, error: "No athlete profile." };

  await prisma.athleteLevelOptIn.upsert({
    where: { athleteProfileId: profile.id },
    create: {
      athleteProfileId: profile.id,
      optedIn,
    },
    update: {
      optedIn,
      ...(optedIn
        ? {}
        : { lastLevelId: null, lastComposite: null, lastComputedAt: null }),
    },
  });

  return { ok: true };
}
