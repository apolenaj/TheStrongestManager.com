/**
 * Gather stated + observed signals for the Training Style Profiler.
 */

import { featureFlags } from "@/config/feature-flags";
import {
  DEFAULT_TRAINING_STYLE_LOOKBACK_DAYS,
  assembleTrainingStyleProfile,
  type TrainingStyleProfilePayload,
  type TrainingStyleSignals,
} from "@/domain/training-style";
import { prisma } from "@/lib/db";

function daysAgo(days: number, now: Date): Date {
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() - days);
  return d;
}

async function gatherSignals(
  athleteProfileId: string,
  lookbackDays: number,
  now: Date,
): Promise<TrainingStyleSignals> {
  const from = daysAgo(lookbackDays, now);

  const [
    experience,
    sessions,
    sets,
    adaptations,
    feedback,
  ] = await Promise.all([
    prisma.trainingExperience.findUnique({
      where: { athleteProfileId },
      select: {
        daysPerWeek: true,
        sessionLengthMinutes: true,
        coachingStatus: true,
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
        id: true,
        status: true,
        completedAt: true,
        scheduledAt: true,
        perceivedEffort: true,
      },
    }),
    prisma.sessionSet.findMany({
      where: {
        completedAt: { gte: from, lt: now },
        sessionExercise: {
          trainingSession: {
            athleteProfileId,
            status: "completed",
          },
        },
      },
      select: {
        performedRpe: true,
        sessionExerciseId: true,
        sessionExercise: { select: { trainingSessionId: true } },
      },
    }),
    prisma.programAdaptation.findMany({
      where: {
        athleteProfileId,
        decidedAt: { gte: from, lt: now },
        status: { in: ["accepted", "modified", "declined"] },
      },
      select: { changeKind: true, status: true },
    }),
    prisma.modelFeedback.findMany({
      where: {
        athleteProfileId,
        role: "athlete",
        relatedType: "program_adaptation",
        createdAt: { gte: from, lt: now },
      },
      select: { verdict: true },
    }),
  ]);

  const completed = sessions.filter((s) => s.status === "completed");
  const skipped = sessions.filter((s) => s.status === "skipped");

  const dayKeys = new Set<string>();
  for (const s of completed) {
    const at = s.completedAt ?? s.scheduledAt;
    if (at) dayKeys.add(at.toISOString().slice(0, 10));
  }

  const rpeSamples: number[] = [];
  for (const set of sets) {
    if (set.performedRpe != null) rpeSamples.push(set.performedRpe);
  }
  for (const s of completed) {
    if (s.perceivedEffort != null) rpeSamples.push(s.perceivedEffort);
  }
  const meanRpe =
    rpeSamples.length === 0
      ? null
      : rpeSamples.reduce((a, b) => a + b, 0) / rpeSamples.length;

  const setsBySession = new Map<string, number>();
  for (const set of sets) {
    const sid = set.sessionExercise.trainingSessionId;
    setsBySession.set(sid, (setsBySession.get(sid) ?? 0) + 1);
  }
  const setCounts = [...setsBySession.values()];
  const meanSetsPerSession =
    setCounts.length === 0
      ? null
      : setCounts.reduce((a, b) => a + b, 0) / setCounts.length;

  let acceptedReduceVolume = 0;
  let acceptedIncreaseVolume = 0;
  let acceptedIncreaseLoad = 0;
  let acceptedReduceLoad = 0;
  let declinedIncreaseLoad = 0;
  let declinedReduceVolume = 0;

  for (const a of adaptations) {
    const accepted = a.status === "accepted" || a.status === "modified";
    const declined = a.status === "declined";
    if (accepted && a.changeKind === "reduce_volume") acceptedReduceVolume += 1;
    if (accepted && a.changeKind === "increase_volume")
      acceptedIncreaseVolume += 1;
    if (accepted && a.changeKind === "increase_load") acceptedIncreaseLoad += 1;
    if (accepted && (a.changeKind === "reduce_load" || a.changeKind === "deload"))
      acceptedReduceLoad += 1;
    if (declined && a.changeKind === "increase_load") declinedIncreaseLoad += 1;
    if (declined && a.changeKind === "reduce_volume") declinedReduceVolume += 1;
  }

  return {
    now,
    lookbackDays,
    stated: {
      daysPerWeek: experience?.daysPerWeek ?? null,
      sessionLengthMinutes: experience?.sessionLengthMinutes ?? null,
      coachingStatus: experience?.coachingStatus ?? null,
    },
    completedSessions: completed.length,
    skippedSessions: skipped.length,
    trainingDays: dayKeys.size,
    meanRpe: meanRpe == null ? null : Math.round(meanRpe * 10) / 10,
    rpeSampleCount: rpeSamples.length,
    meanSetsPerSession:
      meanSetsPerSession == null
        ? null
        : Math.round(meanSetsPerSession * 10) / 10,
    acceptedReduceVolume,
    acceptedIncreaseVolume,
    acceptedIncreaseLoad,
    acceptedReduceLoad,
    declinedIncreaseLoad,
    declinedReduceVolume,
    feedbackHelpful: feedback.filter((f) => f.verdict === "helpful").length,
    feedbackNotHelpful: feedback.filter((f) => f.verdict === "not_helpful")
      .length,
  };
}

export async function getTrainingStyleProfile(input: {
  userId: string;
  lookbackDays?: number;
}): Promise<
  | { ok: true; profile: TrainingStyleProfilePayload }
  | { ok: false; error: string }
> {
  if (!featureFlags.trainingStyleProfiler) {
    return { ok: false, error: "Training Style Profiler is not enabled." };
  }

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: { id: true },
  });
  if (!profile) {
    return { ok: false, error: "Athlete profile required." };
  }

  const lookbackDays =
    input.lookbackDays ?? DEFAULT_TRAINING_STYLE_LOOKBACK_DAYS;
  const signals = await gatherSignals(
    profile.id,
    lookbackDays,
    new Date(),
  );

  return { ok: true, profile: assembleTrainingStyleProfile(signals) };
}
