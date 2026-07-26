import { MAJOR_LIFTS } from "@/services/onboarding/options";
import { prisma } from "@/lib/db";
import { toCanonicalKg } from "@/services/units/convert";
import { getAthleteState } from "@/services/performance-intelligence";
import { parseStoredMovementReport } from "@/services/movement/persist-report";
import {
  detectWeakPoints,
  type WeakPointIntelligenceResult,
  type WeakPointLiftSample,
  type WeakPointSignals,
  type WeakPointTechniqueSample,
} from "@/domain/weak-point-intelligence";
import type { ConfidenceLevel } from "@/domain/scoring/types";

const LIFT_KEYS = MAJOR_LIFTS.map((l) => l.metricKey);
const LIFT_LABEL: Record<string, string> = Object.fromEntries(
  MAJOR_LIFTS.map((l) => [l.metricKey, l.label]),
);

const LOOKBACK_28D_MS = 28 * 24 * 60 * 60 * 1000;
const LOOKBACK_7D_MS = 7 * 24 * 60 * 60 * 1000;
const TECHNIQUE_TAKE = 6;

function asConfidence(raw: string | undefined): ConfidenceLevel {
  if (raw === "none" || raw === "low" || raw === "medium" || raw === "high") {
    return raw;
  }
  return "low";
}

export type WeakPointIntelligenceView = {
  result: WeakPointIntelligenceResult;
  profileId: string;
};

/**
 * Gather logged signals and run evidence-backed weak-point detection.
 * UI must not invent findings client-side.
 */
export async function getWeakPointIntelligence(
  userId: string,
): Promise<WeakPointIntelligenceView | null> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return null;

  const now = new Date();
  const since28 = new Date(now.getTime() - LOOKBACK_28D_MS);
  const since7 = new Date(now.getTime() - LOOKBACK_7D_MS);

  const [
    stateView,
    techniqueRows,
    progressMetrics,
    sessions,
    activeProgram,
    recoveryRows,
  ] = await Promise.all([
    getAthleteState(userId),
    prisma.techniqueAnalysis.findMany({
      where: {
        athleteProfileId: profile.id,
        deletedAt: null,
        status: "completed",
        OR: [
          { overallScore: { not: null } },
          { movementReportJson: { not: null } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: TECHNIQUE_TAKE,
      select: {
        id: true,
        createdAt: true,
        overallScore: true,
        movementReportJson: true,
      },
    }),
    prisma.progressMetric.findMany({
      where: {
        athleteProfileId: profile.id,
        metricKey: { in: [...LIFT_KEYS] },
      },
      orderBy: { recordedAt: "desc" },
      take: 40,
      select: {
        metricKey: true,
        value: true,
        unit: true,
        recordedAt: true,
      },
    }),
    prisma.trainingSession.findMany({
      where: {
        athleteProfileId: profile.id,
        status: { in: ["completed", "skipped"] },
        OR: [
          { completedAt: { gte: since28 } },
          { scheduledAt: { gte: since28 } },
          { startedAt: { gte: since28 } },
        ],
      },
      select: {
        status: true,
        programId: true,
        completedAt: true,
        scheduledAt: true,
        startedAt: true,
      },
    }),
    prisma.program.findFirst({
      where: {
        athleteProfileId: profile.id,
        kind: "athlete",
        status: "active",
      },
      select: { id: true },
    }),
    prisma.recoveryEntry.findMany({
      where: {
        athleteProfileId: profile.id,
        recordedAt: { gte: since7 },
        readiness: { not: null },
      },
      orderBy: { recordedAt: "desc" },
      select: { readiness: true },
    }),
  ]);

  const techniqueSamples: WeakPointTechniqueSample[] = techniqueRows.map(
    (row) => {
      const report = parseStoredMovementReport(row.movementReportJson);
      const components =
        report?.techniqueAssessment?.components?.map((c) => ({
          id: c.id,
          label: c.label,
          score: c.score,
          status: c.status,
          confidence: asConfidence(c.confidence),
          evidence: c.evidence,
        })) ?? [];
      return {
        analysisId: row.id,
        createdAtIso: row.createdAt.toISOString(),
        overallScore: row.overallScore,
        components,
      };
    },
  );

  const lifts: WeakPointLiftSample[] = progressMetrics.map((m) => ({
    metricKey: m.metricKey,
    label: LIFT_LABEL[m.metricKey] ?? m.metricKey,
    valueKg: toCanonicalKg(m.value, m.unit ?? "kg"),
    recordedAtIso: m.recordedAt.toISOString(),
  }));

  const completedSessionsLast28Days = sessions.filter(
    (s) => s.status === "completed",
  ).length;
  const skippedProgramSessionsLast28Days = sessions.filter(
    (s) => s.status === "skipped" && s.programId,
  ).length;

  const readinessValues = recoveryRows
    .map((r) => r.readiness)
    .filter((r): r is number => r != null);
  const avgReadinessLast7Days =
    readinessValues.length > 0
      ? readinessValues.reduce((a, b) => a + b, 0) / readinessValues.length
      : null;

  const state = stateView?.state ?? null;

  const signals: WeakPointSignals = {
    techniqueSamples,
    lifts,
    completedSessionsLast28Days,
    skippedProgramSessionsLast28Days,
    hasActiveProgram: Boolean(activeProgram),
    recoveryCheckInsLast7Days: recoveryRows.length,
    latestReadiness: state?.recoveryStatus.value?.latestReadiness ?? null,
    avgReadinessLast7Days,
    performanceTrendDirection:
      state?.performanceTrend.value?.direction ?? null,
    techniqueTrendDirection: state?.techniqueTrend.value?.direction ?? null,
    loadSpikeFlagged: state?.fatigueTrend.value?.loadSpikeFlagged === true,
  };

  return {
    profileId: profile.id,
    result: detectWeakPoints(signals),
  };
}
