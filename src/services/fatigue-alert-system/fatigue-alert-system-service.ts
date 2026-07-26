/**
 * Fatigue Alert System service (Prompt 125).
 * Composes training load, performance, and recovery — never mutates programs.
 */

import { prisma } from "@/lib/db";
import { featureFlags } from "@/config/feature-flags";
import {
  FATIGUE_ALERT_LOOKBACK_DAYS,
  analyzeFatigueAlert,
  type FatigueAlertAnalysis,
} from "@/domain/fatigue-alert-system";
import { getAthleteState } from "@/services/performance-intelligence";
import { getTrainingLoadView } from "@/services/training-load/training-load-service";

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export async function getFatigueAlertAnalysis(input: {
  userId: string;
  athleteProfileId: string;
  windowDays?: number;
}): Promise<
  | { ok: true; analysis: FatigueAlertAnalysis }
  | { ok: false; error: string }
> {
  if (!featureFlags.fatigueAlertSystem) {
    return { ok: false, error: "Fatigue Alert System is not enabled." };
  }

  const days = input.windowDays ?? FATIGUE_ALERT_LOOKBACK_DAYS;
  const now = new Date();
  const windowStart = new Date(now);
  windowStart.setUTCDate(windowStart.getUTCDate() - days);
  const priorStart = new Date(windowStart);
  priorStart.setUTCDate(priorStart.getUTCDate() - days);

  const [sessions, recoveryRecent, recoveryPrior, athleteState, loadView] =
    await Promise.all([
      prisma.trainingSession.count({
        where: {
          athleteProfileId: input.athleteProfileId,
          status: "completed",
          completedAt: { gte: windowStart, lte: now },
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
      getAthleteState(input.userId),
      getTrainingLoadView(input.userId, now),
    ]);

  const readinessRecent = recoveryRecent
    .map((r) => r.readiness)
    .filter((n): n is number => n != null);
  const readinessPrior = recoveryPrior
    .map((r) => r.readiness)
    .filter((n): n is number => n != null);

  const trendValue = athleteState?.state.performanceTrend.value ?? null;
  const direction =
    trendValue?.direction === "up" ||
    trendValue?.direction === "down" ||
    trendValue?.direction === "flat"
      ? trendValue.direction
      : null;

  const window7 = loadView?.windows.find((w) => w.key === "7d");
  const baselineDaily = loadView?.spike.baselineAvgDailyVolumeKg;
  const recentVol = window7?.totals.volumeKg ?? 0;
  const volumeTrendUp =
    baselineDaily != null &&
    baselineDaily > 0 &&
    recentVol / 7 >= baselineDaily * 1.2;

  const analysis = analyzeFatigueAlert({
    windowLabel: `${days} days`,
    sessionCount: sessions,
    signals: {
      loadSpikeFlagged: loadView?.spike.flagged ?? false,
      loadSpikeDetail: loadView?.spike.explanation ?? null,
      volumeTrendUp,
      performanceDirection: direction,
      performanceDetail: athleteState?.state.performanceTrend.summary ?? null,
      readinessRecentMean: mean(readinessRecent),
      readinessPriorMean: mean(readinessPrior),
      readinessSampleCount: readinessRecent.length,
    },
  });

  return { ok: true, analysis };
}
