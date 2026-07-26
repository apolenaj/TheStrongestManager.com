/**
 * Gather retention signals — planned rest inferred for gaps between activity.
 */

import { featureFlags } from "@/config/feature-flags";
import {
  DEFAULT_RETENTION_LOOKBACK_DAYS,
  assembleBehavioralRetention,
  resolveRetentionDay,
  type BehavioralRetentionPayload,
  type BehavioralRetentionSignals,
  type RetentionDaySignal,
} from "@/domain/behavioral-retention";
import { prisma } from "@/lib/db";

function daysAgo(days: number, now: Date): Date {
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() - days);
  return d;
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function eachDayKey(from: Date, to: Date): string[] {
  const keys: string[] = [];
  const cur = new Date(from);
  cur.setUTCHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setUTCHours(0, 0, 0, 0);
  while (cur <= end) {
    keys.push(dayKey(cur));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return keys;
}

async function gatherSignals(
  athleteProfileId: string,
  lookbackDays: number,
  now: Date,
): Promise<BehavioralRetentionSignals> {
  const from = daysAgo(lookbackDays, now);

  const [sessions, weeklyReview, goal, progressCount, technique] =
    await Promise.all([
      prisma.trainingSession.findMany({
        where: {
          athleteProfileId,
          OR: [
            { completedAt: { gte: from, lt: now } },
            { scheduledAt: { gte: from, lt: now } },
            { startedAt: { gte: from, lt: now } },
            {
              status: { in: ["planned", "in_progress"] },
              createdAt: { gte: from, lt: now },
            },
          ],
        },
        select: {
          status: true,
          completedAt: true,
          scheduledAt: true,
          startedAt: true,
        },
      }),
      prisma.weeklyAthleteReview.findFirst({
        where: { athleteProfileId },
        orderBy: { weekStart: "desc" },
        select: { weekKey: true, summary: true, createdAt: true },
      }),
      prisma.goal.findFirst({
        where: { athleteProfileId, status: "active" },
        orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
        select: { title: true, category: true },
      }),
      prisma.progressMetric.count({
        where: {
          athleteProfileId,
          recordedAt: { gte: from, lt: now },
        },
      }),
      prisma.techniqueAnalysis.findMany({
        where: {
          athleteProfileId,
          status: "completed",
          overallScore: { not: null },
          deletedAt: null,
          createdAt: { gte: daysAgo(90, now), lt: now },
        },
        orderBy: { createdAt: "asc" },
        take: 12,
        select: { overallScore: true },
      }),
    ]);

  type Bucket = {
    completed: number;
    skipped: number;
    inProgress: number;
    planned: number;
  };
  const byDay = new Map<string, Bucket>();

  for (const s of sessions) {
    const at = s.completedAt ?? s.startedAt ?? s.scheduledAt;
    if (!at) continue;
    const key = dayKey(at);
    const bucket = byDay.get(key) ?? {
      completed: 0,
      skipped: 0,
      inProgress: 0,
      planned: 0,
    };
    if (s.status === "completed") bucket.completed += 1;
    else if (s.status === "skipped") bucket.skipped += 1;
    else if (s.status === "in_progress") bucket.inProgress += 1;
    else if (s.status === "planned") bucket.planned += 1;
    byDay.set(key, bucket);
  }

  const activityKeys = [...byDay.keys()].sort();
  const days: RetentionDaySignal[] = [];

  if (activityKeys.length > 0) {
    const first = activityKeys[0]!;
    const rangeStart = new Date(`${first}T00:00:00.000Z`);
    for (const key of eachDayKey(rangeStart, now)) {
      const bucket = byDay.get(key);
      if (bucket) {
        const resolution = resolveRetentionDay(bucket);
        days.push({
          dayKey: key,
          resolution,
          sessionCount:
            bucket.completed +
            bucket.skipped +
            bucket.inProgress +
            bucket.planned,
        });
      } else {
        // Gap between first activity and now with no session = planned rest
        days.push({
          dayKey: key,
          resolution: "planned_rest",
          sessionCount: 0,
        });
      }
    }
  }

  const weekFresh =
    weeklyReview &&
    now.getTime() - weeklyReview.createdAt.getTime() < 8 * 24 * 3600 * 1000;

  const scores = technique
    .map((t) => t.overallScore)
    .filter((v): v is number => v != null);
  let techniqueDelta: number | null = null;
  let direction: BehavioralRetentionSignals["technique"]["direction"] = null;
  if (scores.length >= 2) {
    techniqueDelta =
      Math.round((scores[scores.length - 1]! - scores[0]!) * 10) / 10;
    if (techniqueDelta >= 3) direction = "improved";
    else if (techniqueDelta <= -3) direction = "regressed";
    else direction = "stable";
  }

  let progressLabel: string | null = null;
  if (progressCount > 0 && goal) {
    // Honest qualitative: logged progress exists — detailed trajectory lives on goal-progress
    progressLabel = "logged";
  }

  return {
    now,
    lookbackDays,
    days,
    weeklyReview: {
      hasCurrentWeekReview: Boolean(weekFresh),
      weekKey: weekFresh ? weeklyReview!.weekKey : null,
      summary: weekFresh ? weeklyReview!.summary : null,
    },
    goal: {
      title: goal?.title ?? null,
      category: goal?.category ?? null,
      progressLabel,
      hasLoggedProgress: progressCount > 0,
    },
    technique: {
      sampleCount: scores.length,
      delta: techniqueDelta,
      direction,
    },
  };
}

export async function getBehavioralRetention(input: {
  userId: string;
  lookbackDays?: number;
}): Promise<
  | { ok: true; retention: BehavioralRetentionPayload }
  | { ok: false; error: string }
> {
  if (!featureFlags.behavioralRetention) {
    return { ok: false, error: "Behavioral retention is not enabled." };
  }

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: { id: true },
  });
  if (!profile) {
    return { ok: false, error: "Athlete profile required." };
  }

  const lookbackDays =
    input.lookbackDays ?? DEFAULT_RETENTION_LOOKBACK_DAYS;
  const signals = await gatherSignals(
    profile.id,
    lookbackDays,
    new Date(),
  );

  return { ok: true, retention: assembleBehavioralRetention(signals) };
}
