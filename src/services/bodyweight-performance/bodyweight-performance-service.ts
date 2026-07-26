/**
 * Bodyweight / Performance Relationship service (Prompt 121).
 */

import { prisma } from "@/lib/db";
import { featureFlags } from "@/config/feature-flags";
import { estimate1rmKg } from "@/domain/scoring/strength/e1rm";
import {
  analyzeBodyweightPerformance,
  type BodyweightPerformanceAnalysis,
  type BwPerfSample,
} from "@/domain/bodyweight-performance";

const DEFAULT_WINDOW_DAYS = 56; // ~8 weeks

export async function getBodyweightPerformanceAnalysis(input: {
  athleteProfileId: string;
  windowDays?: number;
}): Promise<
  | { ok: true; analysis: BodyweightPerformanceAnalysis }
  | { ok: false; error: string }
> {
  if (!featureFlags.bodyweightPerformance) {
    return {
      ok: false,
      error: "Bodyweight / Performance Relationship is not enabled.",
    };
  }

  const days = input.windowDays ?? DEFAULT_WINDOW_DAYS;
  const windowEnd = new Date();
  const windowStart = new Date();
  windowStart.setUTCDate(windowStart.getUTCDate() - days);

  const bodyMetrics = await prisma.bodyMetric.findMany({
    where: {
      athleteProfileId: input.athleteProfileId,
      metricKey: "bodyweight",
      recordedAt: { gte: windowStart, lte: windowEnd },
    },
    orderBy: { recordedAt: "asc" },
  });

  const bodyweightSamples: BwPerfSample[] = bodyMetrics.map((m) => ({
    at: m.recordedAt.toISOString(),
    valueKg: m.unit === "lb" ? m.value / 2.2046226218 : m.value,
  }));

  const progressMetrics = await prisma.progressMetric.findMany({
    where: {
      athleteProfileId: input.athleteProfileId,
      recordedAt: { gte: windowStart, lte: windowEnd },
      metricKey: {
        in: [
          "e1rm_squat",
          "e1rm_bench",
          "e1rm_deadlift",
          "e1rm",
          "strength",
        ],
      },
    },
    orderBy: { recordedAt: "asc" },
  });

  const strengthFromMetrics: BwPerfSample[] = progressMetrics.map((m) => ({
    at: m.recordedAt.toISOString(),
    valueKg: m.value,
  }));

  const sessions = await prisma.trainingSession.findMany({
    where: {
      athleteProfileId: input.athleteProfileId,
      status: "completed",
      completedAt: { gte: windowStart, lte: windowEnd },
    },
    include: {
      sessionExercises: {
        include: { sessionSets: true },
      },
    },
  });

  const strengthFromSets: BwPerfSample[] = [];
  for (const session of sessions) {
    const at = (session.completedAt ?? session.updatedAt).toISOString();
    let bestEffort: number | null = null;
    for (const line of session.sessionExercises) {
      for (const set of line.sessionSets) {
        const load = set.performedLoadKg;
        const reps = set.performedReps;
        if (load == null || reps == null) continue;
        if (reps >= 2) {
          const e1rm = estimate1rmKg(load, reps);
          if (e1rm != null) {
            bestEffort = bestEffort == null ? e1rm : Math.max(bestEffort, e1rm);
          }
        } else if (reps === 1) {
          bestEffort = bestEffort == null ? load : Math.max(bestEffort, load);
        }
      }
    }
    if (bestEffort != null) {
      strengthFromSets.push({ at, valueKg: bestEffort });
    }
  }

  // Prefer progress metrics when present; otherwise session-derived e1RM.
  const estimatedStrengthSamples =
    strengthFromMetrics.length >= 2
      ? strengthFromMetrics
      : [...strengthFromMetrics, ...strengthFromSets];

  const analysis = analyzeBodyweightPerformance({
    windowLabel: `${days} days`,
    windowStart,
    windowEnd,
    bodyweightSamples,
    estimatedStrengthSamples,
  });

  return { ok: true, analysis };
}
