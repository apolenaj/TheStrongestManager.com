/**
 * Recovery Correlation Insights service (Prompt 122).
 */

import { prisma } from "@/lib/db";
import { featureFlags } from "@/config/feature-flags";
import {
  analyzeRecoveryCorrelations,
  bucketRecoveryPerformanceWeeks,
  type RecoveryCorrelationAnalysis,
} from "@/domain/recovery-correlation";

const DEFAULT_WINDOW_DAYS = 84; // ~12 weeks

export async function getRecoveryCorrelationAnalysis(input: {
  athleteProfileId: string;
  windowDays?: number;
}): Promise<
  | { ok: true; analysis: RecoveryCorrelationAnalysis }
  | { ok: false; error: string }
> {
  if (!featureFlags.recoveryCorrelation) {
    return {
      ok: false,
      error: "Recovery Correlation Insights is not enabled.",
    };
  }

  const days = input.windowDays ?? DEFAULT_WINDOW_DAYS;
  const windowEnd = new Date();
  const windowStart = new Date();
  windowStart.setUTCDate(windowStart.getUTCDate() - days);

  const [recoveryRows, sessionRows] = await Promise.all([
    prisma.recoveryEntry.findMany({
      where: {
        athleteProfileId: input.athleteProfileId,
        recordedAt: { gte: windowStart, lte: windowEnd },
      },
      select: {
        recordedAt: true,
        sleepHours: true,
        stress: true,
        soreness: true,
      },
      orderBy: { recordedAt: "asc" },
    }),
    prisma.trainingSession.findMany({
      where: {
        athleteProfileId: input.athleteProfileId,
        status: "completed",
        completedAt: { gte: windowStart, lte: windowEnd },
      },
      select: {
        completedAt: true,
        updatedAt: true,
        perceivedEffort: true,
        status: true,
      },
      orderBy: { completedAt: "asc" },
    }),
  ]);

  const weeks = bucketRecoveryPerformanceWeeks({
    recovery: recoveryRows.map((r) => ({
      at: r.recordedAt.toISOString(),
      sleepHours: r.sleepHours,
      stress: r.stress,
      soreness: r.soreness,
    })),
    sessions: sessionRows.map((s) => ({
      at: (s.completedAt ?? s.updatedAt).toISOString(),
      perceivedEffort: s.perceivedEffort,
      completed: true,
    })),
  });

  return { ok: true, analysis: analyzeRecoveryCorrelations(weeks) };
}
