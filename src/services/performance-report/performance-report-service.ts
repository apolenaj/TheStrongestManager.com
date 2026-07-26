/**
 * Gather athlete signals and build a downloadable Performance Report PDF.
 */

import { featureFlags } from "@/config/feature-flags";
import { getPlatformBrandingDefaults } from "@/domain/branding/defaults";
import {
  assemblePerformanceReport,
  buildPerformanceReportPeriod,
  defaultPerformanceReportWindow,
  type PerformanceReportPayload,
  type PerformanceReportSignals,
} from "@/domain/performance-report";
import { estimate1rmKg } from "@/domain/scoring/strength/e1rm";
import { setVolumeKg } from "@/domain/training-load/compute";
import { prisma } from "@/lib/db";
import { renderPerformanceReportPdf } from "@/services/performance-report/render-pdf";
import {
  normalizeMassUnit,
  toCanonicalKg,
} from "@/services/units/convert";

function guessLiftLabel(name: string): string | null {
  const n = name.toLowerCase();
  if (/deadlift/.test(n)) return "Deadlift";
  if (/bench/.test(n)) return "Bench";
  if (/squat/.test(n)) return "Squat";
  if (/press|ohp|overhead/.test(n)) return "Press";
  return null;
}

async function gatherSignals(input: {
  athleteProfileId: string;
  from: Date;
  to: Date;
}): Promise<PerformanceReportSignals | null> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { id: input.athleteProfileId },
    select: {
      displayName: true,
      primaryDiscipline: true,
      units: true,
      user: { select: { name: true } },
      trainingExperience: { select: { level: true } },
      goals: {
        where: { status: "active" },
        orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
        take: 5,
        select: { title: true },
      },
    },
  });
  if (!profile) return null;

  const { from, to } = input;
  const unitsLabel = normalizeMassUnit(profile.units) === "lb" ? "lb" : "kg";
  const brandingDefaults = getPlatformBrandingDefaults();

  const [
    sessions,
    sets,
    techniqueRows,
    recoveryRows,
    bodyRows,
    progressRows,
    recommendations,
  ] = await Promise.all([
    prisma.trainingSession.findMany({
      where: {
        athleteProfileId: input.athleteProfileId,
        status: { in: ["completed", "skipped"] },
        OR: [
          { completedAt: { gte: from, lt: to } },
          {
            completedAt: null,
            scheduledAt: { gte: from, lt: to },
          },
        ],
      },
      select: { status: true },
    }),
    prisma.sessionSet.findMany({
      where: {
        completedAt: { gte: from, lt: to },
        sessionExercise: {
          trainingSession: {
            athleteProfileId: input.athleteProfileId,
            status: "completed",
          },
        },
      },
      select: {
        performedLoadKg: true,
        performedReps: true,
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
        athleteProfileId: input.athleteProfileId,
        deletedAt: null,
        status: "completed",
        createdAt: { gte: from, lt: to },
      },
      select: { overallScore: true },
    }),
    prisma.recoveryEntry.findMany({
      where: {
        athleteProfileId: input.athleteProfileId,
        recordedAt: { gte: from, lt: to },
      },
      select: { readiness: true },
    }),
    prisma.bodyMetric.findMany({
      where: {
        athleteProfileId: input.athleteProfileId,
        metricKey: "bodyweight",
        recordedAt: { gte: from, lt: to },
      },
      select: { value: true, unit: true },
    }),
    prisma.progressMetric.findMany({
      where: {
        athleteProfileId: input.athleteProfileId,
        recordedAt: { gte: from, lt: to },
      },
      select: { metricKey: true },
      take: 40,
    }),
    prisma.recommendation.findMany({
      where: {
        athleteProfileId: input.athleteProfileId,
        createdAt: { gte: from, lt: to },
        status: { in: ["pending", "accepted"] },
      },
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
      take: 10,
      select: { title: true, category: true },
    }),
  ]);

  const bestE1rmByLiftKg: Record<string, number> = {};
  let setCountWithLoad = 0;
  let volumeKg = 0;
  let volumeSetCount = 0;

  for (const set of sets) {
    const vol = setVolumeKg(set);
    if (vol != null) {
      volumeKg += vol;
      volumeSetCount += 1;
    }
    if (set.performedLoadKg != null && set.performedReps != null) {
      setCountWithLoad += 1;
      const e1rm = estimate1rmKg(set.performedLoadKg, set.performedReps);
      if (e1rm == null) continue;
      const name =
        set.sessionExercise.exercise?.name ??
        set.sessionExercise.exerciseNameSnapshot ??
        "";
      const liftKey = guessLiftLabel(name);
      if (!liftKey) continue;
      const prev = bestE1rmByLiftKg[liftKey];
      if (prev == null || e1rm > prev) bestE1rmByLiftKg[liftKey] = e1rm;
    }
  }

  const bodyweightKgSamples: number[] = [];
  for (const b of bodyRows) {
    const kg = toCanonicalKg(b.value, b.unit);
    if (kg != null && Number.isFinite(kg)) bodyweightKgSamples.push(kg);
  }

  const period = buildPerformanceReportPeriod({ from, to });

  return {
    athleteDisplayName:
      profile.displayName?.trim() ||
      profile.user.name?.trim() ||
      "Athlete",
    period,
    unitsLabel,
    branding: {
      displayName: brandingDefaults.displayName,
      accentHex: brandingDefaults.colors.accent,
    },
    now: new Date(),
    overview: {
      primaryDiscipline: profile.primaryDiscipline,
      activeGoals: profile.goals.map((g) => g.title),
      experienceLevel: profile.trainingExperience?.level ?? null,
    },
    strength: {
      bestE1rmByLiftKg,
      setCountWithLoad,
    },
    technique: {
      scoredAnalyses: techniqueRows
        .map((t) => t.overallScore)
        .filter((s): s is number => s != null),
      analysisCount: techniqueRows.length,
    },
    training: {
      completedSessions: sessions.filter((s) => s.status === "completed")
        .length,
      skippedSessions: sessions.filter((s) => s.status === "skipped").length,
      volumeKg: Math.round(volumeKg * 10) / 10,
      volumeSetCount,
    },
    recovery: {
      checkInCount: recoveryRows.length,
      readinessScores: recoveryRows
        .map((r) => r.readiness)
        .filter((s): s is number => s != null),
    },
    progress: {
      metricLabels: [...new Set(progressRows.map((p) => p.metricKey))],
      bodyweightKgSamples,
    },
    recommendations: {
      titles: recommendations.map((r) => r.title),
      sources: recommendations.map((r) => r.category),
    },
  };
}

export async function buildPerformanceReportForUser(input: {
  userId: string;
  from?: Date;
  to?: Date;
}): Promise<
  | { ok: true; report: PerformanceReportPayload }
  | { ok: false; error: string }
> {
  if (!featureFlags.performanceReportPdf) {
    return { ok: false, error: "Performance Report PDF is not enabled." };
  }

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: { id: true },
  });
  if (!profile) {
    return { ok: false, error: "Athlete profile required." };
  }

  const window =
    input.from && input.to
      ? { from: input.from, to: input.to }
      : defaultPerformanceReportWindow();

  if (window.to.getTime() <= window.from.getTime()) {
    return { ok: false, error: "Invalid data period." };
  }

  const signals = await gatherSignals({
    athleteProfileId: profile.id,
    from: window.from,
    to: window.to,
  });
  if (!signals) {
    return { ok: false, error: "Athlete profile required." };
  }

  return { ok: true, report: assemblePerformanceReport(signals) };
}

export async function generatePerformanceReportPdfForUser(input: {
  userId: string;
  from?: Date;
  to?: Date;
}): Promise<
  | { ok: true; pdf: Buffer; report: PerformanceReportPayload; filename: string }
  | { ok: false; error: string }
> {
  const built = await buildPerformanceReportForUser(input);
  if (!built.ok) return built;

  const pdf = await renderPerformanceReportPdf(built.report);
  const safeName = built.report.athleteDisplayName
    .replace(/[^\w.\- ]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 40);
  const filename = `performance-report-${safeName || "athlete"}-${built.report.period.fromIso}_${built.report.period.toIso}.pdf`;

  return { ok: true, pdf, report: built.report, filename };
}
