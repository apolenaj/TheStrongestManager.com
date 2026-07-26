import { prisma } from "@/lib/db";
import {
  assembleWeeklyAthleteReview,
  parseWeekKey,
  previousWeekWindow,
  weekWindowContaining,
  type WeeklyAthleteReviewPayload,
  type WeeklyWeekSignals,
  type WeekWindow,
  WEEKLY_REVIEW_ENGINE_VERSION,
} from "@/domain/weekly-review";
import { estimate1rmKg } from "@/domain/scoring/strength/e1rm";
import { setVolumeKg } from "@/domain/training-load/compute";
import { MAJOR_LIFTS } from "@/services/onboarding/options";
import {
  normalizeMassUnit,
  toCanonicalKg,
} from "@/services/units/convert";

const LIFT_KEYS = MAJOR_LIFTS.map((l) => l.metricKey);
const LIFT_LABEL: Record<string, string> = Object.fromEntries(
  MAJOR_LIFTS.map((l) => [l.metricKey, l.label]),
);

export type WeeklyReviewHistoryItem = {
  id: string;
  weekKey: string;
  weekStartIso: string;
  summary: string | null;
  updatedAtIso: string;
};

export type WeeklyReviewView = {
  athleteProfileId: string;
  review: WeeklyAthleteReviewPayload;
  /** Stored row id when persisted. */
  storedId: string;
  history: WeeklyReviewHistoryItem[];
  /** Previous week payload when available (for side-by-side). */
  previousReview: WeeklyAthleteReviewPayload | null;
};

async function gatherWeekSignals(
  athleteProfileId: string,
  window: WeekWindow,
): Promise<WeeklyWeekSignals> {
  const { weekStart, weekEnd } = window;

  const [
    sessions,
    sets,
    techniqueRows,
    recoveryRows,
    bodyRows,
    progressRows,
    priorProgress,
  ] = await Promise.all([
      prisma.trainingSession.findMany({
        where: {
          athleteProfileId,
          status: { in: ["completed", "skipped"] },
          OR: [
            { completedAt: { gte: weekStart, lt: weekEnd } },
            {
              completedAt: null,
              scheduledAt: { gte: weekStart, lt: weekEnd },
            },
          ],
        },
        select: {
          status: true,
          programId: true,
          completedAt: true,
        },
      }),
      prisma.sessionSet.findMany({
        where: {
          completedAt: { gte: weekStart, lt: weekEnd },
          sessionExercise: {
            trainingSession: {
              athleteProfileId,
              status: "completed",
            },
          },
        },
        select: {
          performedLoadKg: true,
          performedReps: true,
          completedAt: true,
          sessionExercise: {
            select: {
              exerciseNameSnapshot: true,
              exercise: { select: { name: true } },
            },
          },
        },
      }),
      prisma.techniqueAnalysis.findMany({
        where: {
          athleteProfileId,
          status: "completed",
          overallScore: { not: null },
          deletedAt: null,
          createdAt: { gte: weekStart, lt: weekEnd },
        },
        select: { overallScore: true },
      }),
      prisma.recoveryEntry.findMany({
        where: {
          athleteProfileId,
          recordedAt: { gte: weekStart, lt: weekEnd },
          readiness: { not: null },
        },
        select: { readiness: true },
      }),
      prisma.bodyMetric.findMany({
        where: {
          athleteProfileId,
          metricKey: "bodyweight",
          recordedAt: { gte: weekStart, lt: weekEnd },
        },
        orderBy: { recordedAt: "asc" },
        select: { value: true, unit: true },
      }),
      prisma.progressMetric.findMany({
        where: {
          athleteProfileId,
          metricKey: { in: [...LIFT_KEYS] },
          recordedAt: { gte: weekStart, lt: weekEnd },
        },
        orderBy: { recordedAt: "asc" },
        select: {
          metricKey: true,
          value: true,
          unit: true,
          recordedAt: true,
        },
      }),
      prisma.progressMetric.findMany({
        where: {
          athleteProfileId,
          metricKey: { in: [...LIFT_KEYS] },
          recordedAt: { lt: weekStart },
        },
        orderBy: { recordedAt: "desc" },
        take: 80,
        select: {
          metricKey: true,
          value: true,
          unit: true,
        },
      }),
    ]);

  const completedSessions = sessions.filter((s) => s.status === "completed")
    .length;
  const programLinkedCompleted = sessions.filter(
    (s) => s.status === "completed" && s.programId,
  ).length;
  const skippedProgramSessions = sessions.filter(
    (s) => s.status === "skipped" && s.programId,
  ).length;

  let volumeKg = 0;
  let volumeSetCount = 0;
  const bestE1rmByLift: Record<string, number> = {};

  for (const set of sets) {
    const vol = setVolumeKg(set);
    if (vol != null) {
      volumeKg += vol;
      volumeSetCount += 1;
    }
    if (set.performedLoadKg != null && set.performedReps != null) {
      const e1rm = estimate1rmKg(set.performedLoadKg, set.performedReps);
      if (e1rm == null) continue;
      const name =
        set.sessionExercise.exercise?.name ??
        set.sessionExercise.exerciseNameSnapshot ??
        "";
      const liftKey = guessLiftLabel(name);
      if (!liftKey) continue;
      const prev = bestE1rmByLift[liftKey];
      if (prev == null || e1rm > prev) bestE1rmByLift[liftKey] = e1rm;
    }
  }

  const priorBest = new Map<string, number>();
  for (const row of priorProgress) {
    const kg = toCanonicalKg(row.value, row.unit ?? "kg");
    const existing = priorBest.get(row.metricKey);
    if (existing == null || kg > existing) priorBest.set(row.metricKey, kg);
  }

  const prLabels: string[] = [];
  const seenPr = new Set<string>();
  for (const row of progressRows) {
    const kg = toCanonicalKg(row.value, row.unit ?? "kg");
    const priorKg = priorBest.get(row.metricKey) ?? null;
    if (priorKg == null || kg > priorKg) {
      const label = LIFT_LABEL[row.metricKey] ?? row.metricKey;
      const display = `${label} ${Math.round(kg * 10) / 10} kg`;
      if (!seenPr.has(row.metricKey)) {
        seenPr.add(row.metricKey);
        prLabels.push(display);
      }
      // Raise prior so later same-week logs don't re-count weaker values as PRs
      const cur = priorBest.get(row.metricKey);
      if (cur == null || kg > cur) priorBest.set(row.metricKey, kg);
    }
  }

  return {
    window,
    completedSessions,
    skippedProgramSessions,
    programLinkedCompleted,
    volumeKg: Math.round(volumeKg * 10) / 10,
    volumeSetCount,
    bestE1rmByLift,
    techniqueScores: techniqueRows.map((r) => r.overallScore!),
    recoveryReadiness: recoveryRows.map((r) => r.readiness!),
    bodyweightKg: bodyRows.map((r) => toCanonicalKg(r.value, r.unit)),
    prLabels,
  };
}

function guessLiftLabel(name: string): string | null {
  const n = name.toLowerCase();
  if (/deadlift/.test(n)) return "Deadlift";
  if (/bench/.test(n)) return "Bench";
  if (/squat/.test(n)) return "Squat";
  if (/press|ohp|overhead/.test(n)) return "Press";
  return null;
}

/**
 * Build (or refresh) the weekly review for a week, persist it, and return
 * this week + previous week for comparison plus history list.
 */
export async function getWeeklyAthleteReview(input: {
  userId: string;
  weekKey?: string | null;
}): Promise<WeeklyReviewView | null> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: { id: true, units: true },
  });
  if (!profile) return null;

  const now = new Date();
  const window =
    (input.weekKey ? parseWeekKey(input.weekKey, now) : null) ??
    weekWindowContaining(now);
  const prevWindow = previousWeekWindow(window);

  const [thisSignals, prevSignals] = await Promise.all([
    gatherWeekSignals(profile.id, window),
    gatherWeekSignals(profile.id, prevWindow),
  ]);

  const unitsLabel = normalizeMassUnit(profile.units);
  const review = assembleWeeklyAthleteReview({
    thisWeek: thisSignals,
    previousWeek: prevSignals,
    now,
    unitsLabel,
  });

  const previousReview = assembleWeeklyAthleteReview({
    thisWeek: prevSignals,
    previousWeek: await gatherWeekSignals(
      profile.id,
      previousWeekWindow(prevWindow),
    ),
    now: prevWindow.weekEnd,
    unitsLabel,
  });

  const summary =
    review.mainImprovement?.title ??
    review.biggestLimitation?.title ??
    `Week ${review.week.weekKey}`;

  const stored = await prisma.weeklyAthleteReview.upsert({
    where: {
      athleteProfileId_weekKey: {
        athleteProfileId: profile.id,
        weekKey: window.weekKey,
      },
    },
    create: {
      athleteProfileId: profile.id,
      weekStart: window.weekStart,
      weekKey: window.weekKey,
      engineVersion: WEEKLY_REVIEW_ENGINE_VERSION,
      summary,
      reviewJson: JSON.stringify(review),
    },
    update: {
      weekStart: window.weekStart,
      engineVersion: WEEKLY_REVIEW_ENGINE_VERSION,
      summary,
      reviewJson: JSON.stringify(review),
    },
    select: { id: true },
  });

  const { enqueueDomainEventSafe } = await import("@/services/event-driven");
  enqueueDomainEventSafe({
    name: "weekly_review.ready",
    payload: {
      userId: input.userId,
      weekKey: window.weekKey,
      reviewId: stored.id,
    },
    dedupeParts: [profile.id, window.weekKey],
  });

  // Also persist previous week snapshot for history
  await prisma.weeklyAthleteReview.upsert({
    where: {
      athleteProfileId_weekKey: {
        athleteProfileId: profile.id,
        weekKey: prevWindow.weekKey,
      },
    },
    create: {
      athleteProfileId: profile.id,
      weekStart: prevWindow.weekStart,
      weekKey: prevWindow.weekKey,
      engineVersion: WEEKLY_REVIEW_ENGINE_VERSION,
      summary:
        previousReview.mainImprovement?.title ??
        previousReview.biggestLimitation?.title ??
        `Week ${previousReview.week.weekKey}`,
      reviewJson: JSON.stringify(previousReview),
    },
    update: {
      weekStart: prevWindow.weekStart,
      engineVersion: WEEKLY_REVIEW_ENGINE_VERSION,
      summary:
        previousReview.mainImprovement?.title ??
        previousReview.biggestLimitation?.title ??
        `Week ${previousReview.week.weekKey}`,
      reviewJson: JSON.stringify(previousReview),
    },
  });

  const historyRows = await prisma.weeklyAthleteReview.findMany({
    where: { athleteProfileId: profile.id },
    orderBy: { weekStart: "desc" },
    take: 12,
    select: {
      id: true,
      weekKey: true,
      weekStart: true,
      summary: true,
      updatedAt: true,
    },
  });

  return {
    athleteProfileId: profile.id,
    review,
    storedId: stored.id,
    previousReview,
    history: historyRows.map((r) => ({
      id: r.id,
      weekKey: r.weekKey,
      weekStartIso: r.weekStart.toISOString(),
      summary: r.summary,
      updatedAtIso: r.updatedAt.toISOString(),
    })),
  };
}

export async function listWeeklyReviewHistory(
  userId: string,
): Promise<WeeklyReviewHistoryItem[]> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return [];

  const rows = await prisma.weeklyAthleteReview.findMany({
    where: { athleteProfileId: profile.id },
    orderBy: { weekStart: "desc" },
    take: 24,
    select: {
      id: true,
      weekKey: true,
      weekStart: true,
      summary: true,
      updatedAt: true,
    },
  });

  return rows.map((r) => ({
    id: r.id,
    weekKey: r.weekKey,
    weekStartIso: r.weekStart.toISOString(),
    summary: r.summary,
    updatedAtIso: r.updatedAt.toISOString(),
  }));
}
