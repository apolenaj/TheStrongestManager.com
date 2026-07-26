/**
 * Gather personalization inputs and assemble a cross-surface plan.
 * Never reads sex / birthYear for ranking. Never touches billing prices.
 */

import { featureFlags } from "@/config/feature-flags";
import {
  DEFAULT_PERSONALIZATION_LOOKBACK_DAYS,
  assemblePersonalizationPlan,
  type PersonalizationPlan,
  type PersonalizationSignals,
} from "@/domain/personalization";
import { assembleTrainingStyleProfile } from "@/domain/training-style";
import { prisma } from "@/lib/db";

function daysAgo(days: number, now: Date): Date {
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() - days);
  return d;
}

function parseJsonStringArray(raw: string | null | undefined): string[] {
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
): Promise<PersonalizationSignals> {
  const from = daysAgo(lookbackDays, now);

  const [
    profile,
    goal,
    experience,
    sessions,
    techniqueCount,
    activeProgramCount,
    adaptations,
    feedback,
    recommendations,
  ] = await Promise.all([
    prisma.athleteProfile.findUnique({
      where: { id: athleteProfileId },
      select: {
        primaryDiscipline: true,
        // Intentionally omit sex / birthYear — never personalization inputs.
      },
    }),
    prisma.goal.findFirst({
      where: { athleteProfileId, status: "active" },
      orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
      select: { title: true, category: true },
    }),
    prisma.trainingExperience.findUnique({
      where: { athleteProfileId },
      select: {
        daysPerWeek: true,
        sessionLengthMinutes: true,
        preferredSports: true,
      },
    }),
    prisma.trainingSession.findMany({
      where: {
        athleteProfileId,
        status: { in: ["completed", "skipped"] },
        OR: [
          { completedAt: { gte: from, lt: now } },
          {
            completedAt: null,
            scheduledAt: { gte: from, lt: now },
          },
        ],
      },
      select: {
        status: true,
        completedAt: true,
        scheduledAt: true,
      },
    }),
    prisma.techniqueAnalysis.count({
      where: {
        athleteProfileId,
        status: "completed",
        deletedAt: null,
      },
    }),
    prisma.program.count({
      where: { athleteProfileId, status: "active" },
    }),
    prisma.programAdaptation.findMany({
      where: {
        athleteProfileId,
        decidedAt: { gte: from, lt: now },
        status: { in: ["accepted", "modified", "declined"] },
      },
      select: { status: true },
    }),
    prisma.modelFeedback.findMany({
      where: {
        athleteProfileId,
        role: "athlete",
        createdAt: { gte: from, lt: now },
      },
      select: { verdict: true },
    }),
    prisma.recommendation.findMany({
      where: { athleteProfileId, status: "pending" },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      take: 12,
      select: {
        id: true,
        title: true,
        body: true,
        category: true,
        priority: true,
      },
    }),
  ]);

  const completed = sessions.filter((s) => s.status === "completed");
  const skipped = sessions.filter((s) => s.status === "skipped");
  const dayKeys = new Set<string>();
  for (const s of completed) {
    const at = s.completedAt ?? s.scheduledAt;
    if (at) dayKeys.add(at.toISOString().slice(0, 10));
  }

  // Prefer training-style bands when profiler flag is on and data exists.
  let intensityBand: string | null = null;
  let frequencyBand: string | null = null;
  let volumeToleranceBand: string | null = null;
  if (featureFlags.trainingStyleProfiler) {
    const style = assembleTrainingStyleProfile({
      now,
      lookbackDays,
      stated: {
        daysPerWeek: experience?.daysPerWeek ?? null,
        sessionLengthMinutes: experience?.sessionLengthMinutes ?? null,
        coachingStatus: null,
      },
      completedSessions: completed.length,
      skippedSessions: skipped.length,
      trainingDays: dayKeys.size,
      meanRpe: null,
      rpeSampleCount: 0,
      meanSetsPerSession: null,
      acceptedReduceVolume: 0,
      acceptedIncreaseVolume: 0,
      acceptedIncreaseLoad: 0,
      acceptedReduceLoad: 0,
      declinedIncreaseLoad: 0,
      declinedReduceVolume: 0,
      feedbackHelpful: 0,
      feedbackNotHelpful: 0,
    });
    intensityBand =
      style.dimensions.find((d) => d.id === "intensity_preference")?.band ??
      null;
    frequencyBand =
      style.dimensions.find((d) => d.id === "frequency_preference")?.band ??
      null;
    volumeToleranceBand =
      style.dimensions.find((d) => d.id === "volume_tolerance")?.band ?? null;
  }

  return {
    now,
    lookbackDays,
    goal: {
      title: goal?.title ?? null,
      category: goal?.category ?? null,
    },
    sport: {
      primaryDiscipline: profile?.primaryDiscipline ?? null,
      preferredSports: parseJsonStringArray(experience?.preferredSports),
    },
    history: {
      completedSessions: completed.length,
      skippedSessions: skipped.length,
      trainingDays: dayKeys.size,
      hasActiveProgram: activeProgramCount > 0,
      techniqueUploads: techniqueCount,
    },
    behavior: {
      acceptedAdaptations: adaptations.filter(
        (a) => a.status === "accepted" || a.status === "modified",
      ).length,
      declinedAdaptations: adaptations.filter((a) => a.status === "declined")
        .length,
      feedbackHelpful: feedback.filter((f) => f.verdict === "helpful").length,
      feedbackNotHelpful: feedback.filter((f) => f.verdict === "not_helpful")
        .length,
    },
    preferences: {
      daysPerWeek: experience?.daysPerWeek ?? null,
      sessionLengthMinutes: experience?.sessionLengthMinutes ?? null,
      intensityBand,
      frequencyBand,
      volumeToleranceBand,
    },
    pendingRecommendations: recommendations.map((r) => ({
      id: r.id,
      title: r.title,
      body: r.body,
      category: r.category,
      priority: r.priority,
    })),
  };
}

export async function getPersonalizationPlan(input: {
  userId: string;
  lookbackDays?: number;
}): Promise<
  | { ok: true; plan: PersonalizationPlan }
  | { ok: false; error: string }
> {
  if (!featureFlags.personalizationEngine) {
    return { ok: false, error: "Personalization engine is not enabled." };
  }

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: { id: true },
  });
  if (!profile) {
    return { ok: false, error: "Athlete profile required." };
  }

  const lookbackDays =
    input.lookbackDays ?? DEFAULT_PERSONALIZATION_LOOKBACK_DAYS;
  const signals = await gatherSignals(profile.id, lookbackDays, new Date());
  return { ok: true, plan: assemblePersonalizationPlan(signals) };
}
