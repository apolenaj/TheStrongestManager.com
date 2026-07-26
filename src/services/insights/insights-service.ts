import { featureFlags } from "@/config/feature-flags";
import {
  INSIGHT_HONESTY,
  classifyPerformanceTrend,
  estimateBodyweightTrendKgPerWeek,
  meanDelta,
  proposeCrossDomainInsights,
  volumeTrendPct,
  type InsightProposal,
  type InsightsEngineResult,
} from "@/domain/insights";
import {
  INSIGHT_BODYWEIGHT_LOOKBACK_DAYS,
  INSIGHT_RECOVERY_LOOKBACK_DAYS,
  INSIGHT_TRAINING_BASELINE_DAYS,
  INSIGHT_TRAINING_RECENT_DAYS,
} from "@/domain/insights/constants";
import { getActiveNutritionProvider } from "@/domain/nutrition";
import { setVolumeKg } from "@/domain/training-load/compute";
import { prisma } from "@/lib/db";

function daysAgo(days: number, now = new Date()): Date {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

export type InsightsDashboardView = {
  athleteProfileId: string;
  engine: InsightsEngineResult;
  honesty: readonly string[];
  topInsight: InsightProposal | null;
};

/**
 * Gather cross-domain signals and run the pure insights engine.
 * Does not auto-apply anything; does not invent nutrition numbers.
 */
export async function getCrossDomainInsights(
  userId: string,
): Promise<InsightsDashboardView | null> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return null;

  const now = new Date();
  const bwSince = daysAgo(INSIGHT_BODYWEIGHT_LOOKBACK_DAYS, now);
  const recoverySince = daysAgo(INSIGHT_RECOVERY_LOOKBACK_DAYS, now);
  const trainingSince = daysAgo(
    INSIGHT_TRAINING_RECENT_DAYS + INSIGHT_TRAINING_BASELINE_DAYS,
    now,
  );
  const recentCutoff = daysAgo(INSIGHT_TRAINING_RECENT_DAYS, now);
  const midRecovery = daysAgo(INSIGHT_RECOVERY_LOOKBACK_DAYS / 2, now);

  const [bodyRows, recoveryRows, sets, nutritionConnection] = await Promise.all(
    [
      prisma.bodyMetric.findMany({
        where: {
          athleteProfileId: profile.id,
          metricKey: "bodyweight",
          recordedAt: { gte: bwSince },
        },
        orderBy: { recordedAt: "asc" },
        select: { value: true, recordedAt: true },
      }),
      prisma.recoveryEntry.findMany({
        where: {
          athleteProfileId: profile.id,
          recordedAt: { gte: recoverySince },
          readiness: { not: null },
        },
        orderBy: { recordedAt: "asc" },
        select: { readiness: true, recordedAt: true },
      }),
      prisma.sessionSet.findMany({
        where: {
          completedAt: { gte: trainingSince },
          sessionExercise: {
            trainingSession: {
              athleteProfileId: profile.id,
              status: "completed",
            },
          },
        },
        select: {
          completedAt: true,
          performedLoadKg: true,
          performedReps: true,
          sessionExercise: {
            select: { trainingSessionId: true },
          },
        },
      }),
      getActiveNutritionProvider().getConnection({
        athleteProfileId: profile.id,
      }),
    ],
  );

  const dateKey = now.toISOString().slice(0, 10);
  const syncEnabled = featureFlags.mealnexioSync;
  let nutritionHasTargets = false;
  let nutritionHasSummary = false;
  if (syncEnabled && nutritionConnection.status === "connected") {
    const provider = getActiveNutritionProvider();
    const [targets, summary] = await Promise.all([
      provider.fetchDailyTargets({
        athleteProfileId: profile.id,
        date: dateKey,
      }),
      provider.fetchDailySummary({
        athleteProfileId: profile.id,
        date: dateKey,
      }),
    ]);
    nutritionHasTargets = targets != null;
    nutritionHasSummary = summary != null;
  }

  const bwPoints = bodyRows.map((r) => ({
    at: r.recordedAt,
    kg: r.value,
  }));
  const bodyweightTrendKgPerWeek = estimateBodyweightTrendKgPerWeek(bwPoints);
  const latestBodyweightKg =
    bwPoints.length > 0 ? bwPoints[bwPoints.length - 1]!.kg : null;

  const readinessRecent = recoveryRows
    .filter((r) => r.recordedAt >= midRecovery)
    .map((r) => r.readiness as number);
  const readinessPrior = recoveryRows
    .filter((r) => r.recordedAt < midRecovery)
    .map((r) => r.readiness as number);
  const recoveryReadinessDelta = meanDelta(readinessRecent, readinessPrior);
  const recoveryReadinessRecent =
    readinessRecent.length > 0
      ? Math.round(
          (readinessRecent.reduce((a, b) => a + b, 0) / readinessRecent.length) *
            10,
        ) / 10
      : null;

  let recentVolumeKg = 0;
  let priorVolumeKg = 0;
  let recentHasVolume = false;
  let priorHasVolume = false;
  const recentSessionIds = new Set<string>();
  const priorSessionIds = new Set<string>();
  let recentLoadProxy = 0;
  let priorLoadProxy = 0;
  let recentProxyN = 0;
  let priorProxyN = 0;

  for (const set of sets) {
    if (!set.completedAt) continue;
    const sessionId = set.sessionExercise.trainingSessionId;
    const vol = setVolumeKg(set);
    const isRecent = set.completedAt >= recentCutoff;
    if (isRecent) {
      recentSessionIds.add(sessionId);
      if (vol != null) {
        recentVolumeKg += vol;
        recentHasVolume = true;
      }
      if (set.performedLoadKg != null) {
        recentLoadProxy += set.performedLoadKg;
        recentProxyN += 1;
      }
    } else {
      priorSessionIds.add(sessionId);
      if (vol != null) {
        priorVolumeKg += vol;
        priorHasVolume = true;
      }
      if (set.performedLoadKg != null) {
        priorLoadProxy += set.performedLoadKg;
        priorProxyN += 1;
      }
    }
  }

  const trainingVolumeTrendPct =
    recentHasVolume && priorHasVolume
      ? volumeTrendPct(recentVolumeKg, priorVolumeKg)
      : null;
  const trainingPerformanceTrend = classifyPerformanceTrend(
    recentProxyN > 0 ? recentLoadProxy / recentProxyN : null,
    priorProxyN > 0 ? priorLoadProxy / priorProxyN : null,
  );

  const engine = proposeCrossDomainInsights({
    bodyweightTrendKgPerWeek,
    bodyweightSampleCount: bwPoints.length,
    latestBodyweightKg,
    trainingVolumeTrendPct,
    recentVolumeKg: recentHasVolume ? recentVolumeKg : null,
    priorVolumeKg: priorHasVolume ? priorVolumeKg : null,
    trainingPerformanceTrend,
    recoveryReadinessRecent,
    recoveryReadinessDelta,
    recoverySampleCount: recoveryRows.length,
    nutritionSyncFeatureEnabled: syncEnabled,
    nutritionHasTargets,
    nutritionHasSummary,
    completedSessionsRecent: recentSessionIds.size,
    completedSessionsBaseline: priorSessionIds.size,
  });

  return {
    athleteProfileId: profile.id,
    engine,
    honesty: INSIGHT_HONESTY,
    topInsight: engine.insights[0] ?? null,
  };
}
