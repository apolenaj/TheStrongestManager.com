/**
 * Deload Intelligence service (Prompt 124).
 * Gathers multi-signal inputs — never mutates the program.
 */

import { prisma } from "@/lib/db";
import { featureFlags } from "@/config/feature-flags";
import {
  DELOAD_LOOKBACK_DAYS,
  DELOAD_RECENT_SUPPRESS_DAYS,
  analyzeDeloadIntelligence,
  type DeloadIntelligenceAnalysis,
} from "@/domain/deload-intelligence";
import { getAthleteState } from "@/services/performance-intelligence";
import { getTrainingLoadView } from "@/services/training-load/training-load-service";

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export async function getDeloadIntelligenceAnalysis(input: {
  userId: string;
  athleteProfileId: string;
  windowDays?: number;
}): Promise<
  | { ok: true; analysis: DeloadIntelligenceAnalysis }
  | { ok: false; error: string }
> {
  if (!featureFlags.deloadIntelligence) {
    return { ok: false, error: "Deload Intelligence is not enabled." };
  }

  const days = input.windowDays ?? DELOAD_LOOKBACK_DAYS;
  const now = new Date();
  const windowStart = new Date(now);
  windowStart.setUTCDate(windowStart.getUTCDate() - days);
  const priorStart = new Date(windowStart);
  priorStart.setUTCDate(priorStart.getUTCDate() - days);
  const deloadSince = new Date(now);
  deloadSince.setUTCDate(
    deloadSince.getUTCDate() - DELOAD_RECENT_SUPPRESS_DAYS,
  );

  const [
    sessions,
    recoveryRecent,
    recoveryPrior,
    sets,
    recentDeloadRow,
    athleteState,
    loadView,
  ] = await Promise.all([
    prisma.trainingSession.findMany({
      where: {
        athleteProfileId: input.athleteProfileId,
        status: "completed",
        completedAt: { gte: windowStart, lte: now },
      },
      select: {
        id: true,
        perceivedEffort: true,
        completedAt: true,
      },
    }),
    prisma.recoveryEntry.findMany({
      where: {
        athleteProfileId: input.athleteProfileId,
        recordedAt: { gte: windowStart, lte: now },
        readiness: { not: null },
      },
      select: { readiness: true },
    }),
    prisma.recoveryEntry.findMany({
      where: {
        athleteProfileId: input.athleteProfileId,
        recordedAt: { gte: priorStart, lt: windowStart },
        readiness: { not: null },
      },
      select: { readiness: true },
    }),
    prisma.sessionSet.findMany({
      where: {
        sessionExercise: {
          trainingSession: {
            athleteProfileId: input.athleteProfileId,
            status: "completed",
            completedAt: { gte: windowStart, lte: now },
          },
        },
      },
      select: {
        prescribedReps: true,
        performedReps: true,
        performedRpe: true,
        prescribedRpe: true,
      },
      take: 400,
    }),
    prisma.programAdaptation.findFirst({
      where: {
        athleteProfileId: input.athleteProfileId,
        changeKind: "deload",
        OR: [
          { appliedAt: { gte: deloadSince } },
          {
            status: { in: ["accepted", "modified"] },
            decidedAt: { gte: deloadSince },
          },
          {
            status: { in: ["accepted", "modified"] },
            updatedAt: { gte: deloadSince },
          },
        ],
      },
      select: { id: true },
    }),
    getAthleteState(input.userId),
    getTrainingLoadView(input.userId, now),
  ]);

  const rpeValues = sessions
    .map((s) => s.perceivedEffort)
    .filter((n): n is number => n != null);

  const targetRpes = sets
    .map((s) => s.prescribedRpe)
    .filter((n): n is number => n != null);

  const comparable = sets.filter(
    (s) => s.prescribedReps != null && s.performedReps != null,
  );
  const missed = comparable.filter(
    (s) => (s.performedReps as number) < (s.prescribedReps as number),
  );

  const window7 = loadView?.windows.find((w) => w.key === "7d");
  const window28 = loadView?.windows.find((w) => w.key === "28d");
  const recentVol = window7?.totals.volumeKg ?? 0;
  const baselineDaily = loadView?.spike.baselineAvgDailyVolumeKg;
  const volumeTrendUp =
    baselineDaily != null &&
    baselineDaily > 0 &&
    recentVol / 7 >= baselineDaily * 1.2;

  const trendValue = athleteState?.state.performanceTrend.value ?? null;
  const direction =
    trendValue?.direction === "up" ||
    trendValue?.direction === "down" ||
    trendValue?.direction === "flat"
      ? trendValue.direction
      : null;

  const readinessRecent = recoveryRecent
    .map((r) => r.readiness)
    .filter((n): n is number => n != null);
  const readinessPrior = recoveryPrior
    .map((r) => r.readiness)
    .filter((n): n is number => n != null);

  const analysis = analyzeDeloadIntelligence({
    windowLabel: `${days} days`,
    sessionCount: sessions.length,
    recentDeload: recentDeloadRow != null,
    signals: {
      performanceDirection: direction,
      performanceDetail: athleteState?.state.performanceTrend.summary ?? null,
      sessionRpeMean: mean(rpeValues),
      targetRpeMean: mean(targetRpes),
      sessionsWithRpe: rpeValues.length,
      readinessRecentMean: mean(readinessRecent),
      readinessPriorMean: mean(readinessPrior),
      readinessSampleCount: readinessRecent.length,
      missedRepRate:
        comparable.length > 0 ? missed.length / comparable.length : null,
      setsWithRepComparison: comparable.length,
      loadSpikeFlagged: loadView?.spike.flagged ?? false,
      loadSpikeDetail: loadView?.spike.explanation ?? null,
      volumeTrendUp: Boolean(volumeTrendUp && window28),
    },
  });

  return { ok: true, analysis };
}
