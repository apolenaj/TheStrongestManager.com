import { prisma } from "@/lib/db";
import {
  ACHIEVEMENT_CATALOG,
  ACHIEVEMENT_HONESTY,
  evaluateAllAchievements,
  getAchievementById,
  PILLAR_LABELS,
  type AchievementDefinition,
  type AchievementEvaluation,
  type AchievementEvidence,
} from "@/domain/achievement";
import { detectPrEvents } from "@/domain/pr-intelligence";
import type {
  StrengthSample,
  TechniqueSample,
} from "@/domain/pr-intelligence";

export type AchievementCardView = {
  definition: AchievementDefinition;
  pillarLabel: string;
  evaluation: AchievementEvaluation;
  earnedAt: string | null;
};

export type AchievementPageView = {
  honesty: readonly string[];
  cards: AchievementCardView[];
  earnedCount: number;
  totalCount: number;
};

const MAJOR_SLUGS = [
  "back-squat",
  "bench-press",
  "deadlift",
  "overhead-press",
] as const;

async function buildEvidence(
  athleteProfileId: string,
): Promise<AchievementEvidence> {
  const [sessions, techniqueRows, competitionCount] = await Promise.all([
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
      select: { overallScore: true, createdAt: true },
    }),
    prisma.competitionPrep.count({
      where: { athleteProfileId, status: "completed" },
    }),
  ]);

  const completedSessionAt = sessions
    .map((s) => s.completedAt?.toISOString())
    .filter((x): x is string => Boolean(x));

  const techniqueScores = techniqueRows
    .map((t) => t.overallScore)
    .filter((s): s is number => s != null && Number.isFinite(s));

  const hasLoggedPr = await detectHasLoggedPr(athleteProfileId);

  return {
    completedSessionCount: sessions.length,
    completedSessionAt,
    techniqueScoreCount: techniqueRows.length,
    techniqueScores,
    hasLoggedPr,
    hasCompletedCompetition: competitionCount > 0,
  };
}

async function detectHasLoggedPr(athleteProfileId: string): Promise<boolean> {
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
      take: 500,
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
      take: 200,
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
  // Prefer strength / technique PRs — exclude estimated-only if that's the sole type?
  // Prompt says First PR — any logged PR event counts; e1RM alone still "logged" but honesty note in catalog.
  return timeline.events.some(
    (e) =>
      e.types.includes("one_rm") ||
      e.types.includes("rep_pr") ||
      e.types.includes("volume_pr") ||
      e.types.includes("technical_pr"),
  );
}

/**
 * Recompute evidence, persist newly earned achievements, return page view.
 */
export async function getAchievementPage(
  userId: string,
): Promise<AchievementPageView | null> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      achievements: true,
    },
  });
  if (!profile) return null;

  const evidence = await buildEvidence(profile.id);
  const evaluations = evaluateAllAchievements(evidence);
  const earnedById = new Map(
    profile.achievements.map((a) => [a.achievementId, a]),
  );

  for (const ev of evaluations) {
    if (!ev.unlocked) continue;
    if (earnedById.has(ev.id)) continue;
    const created = await prisma.athleteAchievement.create({
      data: {
        athleteProfileId: profile.id,
        achievementId: ev.id,
        evidenceJson: JSON.stringify({
          reason: ev.reason,
          evidenceSummary: ev.evidenceSummary,
        }),
      },
    });
    earnedById.set(ev.id, created);
  }

  const cards: AchievementCardView[] = ACHIEVEMENT_CATALOG.map((def) => {
    const evaluation =
      evaluations.find((e) => e.id === def.id) ??
      evaluateAllAchievements(evidence).find((e) => e.id === def.id)!;
    const row = earnedById.get(def.id);
    return {
      definition: def,
      pillarLabel: PILLAR_LABELS[def.pillar],
      evaluation,
      earnedAt: row?.earnedAt.toISOString() ?? null,
    };
  });

  const earnedCount = cards.filter((c) => c.earnedAt).length;

  return {
    honesty: ACHIEVEMENT_HONESTY,
    cards,
    earnedCount,
    totalCount: ACHIEVEMENT_CATALOG.length,
  };
}

export { getAchievementById };
