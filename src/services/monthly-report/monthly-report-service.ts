/**
 * Automatic monthly performance report — lazy generate + archive + share.
 */

import { randomBytes } from "crypto";
import { featureFlags } from "@/config/feature-flags";
import {
  MONTHLY_REPORT_ENGINE_VERSION,
  assembleMonthlyAthleteReport,
  buildMonthlyReportSharePayload,
  monthWindowContaining,
  parseMonthKey,
  previousMonthWindow,
  type MonthWindow,
  type MonthlyAthleteReportPayload,
  type MonthlyMonthSignals,
  type MonthlyReportSharePayload,
} from "@/domain/monthly-report";
import { estimate1rmKg } from "@/domain/scoring/strength/e1rm";
import { setVolumeKg } from "@/domain/training-load/compute";
import { prisma } from "@/lib/db";
import { MAJOR_LIFTS } from "@/services/onboarding/options";
import {
  normalizeMassUnit,
  toCanonicalKg,
} from "@/services/units/convert";

const LIFT_KEYS = MAJOR_LIFTS.map((l) => l.metricKey);
const LIFT_LABEL: Record<string, string> = Object.fromEntries(
  MAJOR_LIFTS.map((l) => [l.metricKey, l.label]),
);

function guessLiftLabel(name: string): string | null {
  const n = name.toLowerCase();
  if (/deadlift/.test(n)) return "Deadlift";
  if (/bench/.test(n)) return "Bench";
  if (/squat/.test(n)) return "Squat";
  if (/press|ohp|overhead/.test(n)) return "Press";
  return null;
}

async function gatherMonthSignals(
  athleteProfileId: string,
  window: MonthWindow,
): Promise<MonthlyMonthSignals> {
  const { monthStart, monthEnd } = window;

  const [
    sessions,
    sets,
    techniqueRows,
    recoveryCount,
    bodyRows,
    progressRows,
    priorProgress,
    goals,
  ] = await Promise.all([
    prisma.trainingSession.findMany({
      where: {
        athleteProfileId,
        status: { in: ["completed", "skipped"] },
        OR: [
          { completedAt: { gte: monthStart, lt: monthEnd } },
          {
            completedAt: null,
            scheduledAt: { gte: monthStart, lt: monthEnd },
          },
        ],
      },
      select: { status: true, completedAt: true, scheduledAt: true },
    }),
    prisma.sessionSet.findMany({
      where: {
        completedAt: { gte: monthStart, lt: monthEnd },
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
        createdAt: { gte: monthStart, lt: monthEnd },
      },
      select: { overallScore: true },
    }),
    prisma.recoveryEntry.count({
      where: {
        athleteProfileId,
        recordedAt: { gte: monthStart, lt: monthEnd },
      },
    }),
    prisma.bodyMetric.findMany({
      where: {
        athleteProfileId,
        metricKey: "bodyweight",
        recordedAt: { gte: monthStart, lt: monthEnd },
      },
      select: { value: true, unit: true },
    }),
    prisma.progressMetric.findMany({
      where: {
        athleteProfileId,
        metricKey: { in: [...LIFT_KEYS] },
        recordedAt: { gte: monthStart, lt: monthEnd },
      },
      select: { metricKey: true, value: true, unit: true },
    }),
    prisma.progressMetric.findMany({
      where: {
        athleteProfileId,
        metricKey: { in: [...LIFT_KEYS] },
        recordedAt: { lt: monthStart },
      },
      orderBy: { recordedAt: "desc" },
      take: 80,
      select: { metricKey: true, value: true, unit: true },
    }),
    prisma.goal.findMany({
      where: { athleteProfileId, status: "active" },
      orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
      take: 8,
      select: { title: true, category: true },
    }),
  ]);

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
      if (!seenPr.has(row.metricKey)) {
        seenPr.add(row.metricKey);
        prLabels.push(`${label} ${Math.round(kg * 10) / 10} kg`);
      }
      const cur = priorBest.get(row.metricKey);
      if (cur == null || kg > cur) priorBest.set(row.metricKey, kg);
    }
  }

  const dayKeys = new Set<string>();
  for (const s of sessions) {
    if (s.status !== "completed") continue;
    const at = s.completedAt ?? s.scheduledAt;
    if (!at) continue;
    dayKeys.add(at.toISOString().slice(0, 10));
  }

  return {
    window,
    completedSessions: sessions.filter((s) => s.status === "completed").length,
    skippedSessions: sessions.filter((s) => s.status === "skipped").length,
    volumeKg: Math.round(volumeKg * 10) / 10,
    volumeSetCount,
    bestE1rmByLift,
    techniqueScores: techniqueRows.map((r) => r.overallScore!),
    recoveryCheckIns: recoveryCount,
    bodyweightKg: bodyRows.map((r) => toCanonicalKg(r.value, r.unit)),
    prLabels,
    goals: goals.map((g) => ({ title: g.title, category: g.category })),
    trainingDaysWithSession: dayKeys.size,
  };
}

export type MonthlyReportHistoryItem = {
  id: string;
  monthKey: string;
  monthStartIso: string;
  summary: string | null;
  updatedAtIso: string;
};

export type MonthlyReportView = {
  athleteProfileId: string;
  athleteDisplayName: string;
  report: MonthlyAthleteReportPayload;
  storedId: string;
  history: MonthlyReportHistoryItem[];
  previousReport: MonthlyAthleteReportPayload | null;
};

export async function getMonthlyAthleteReport(input: {
  userId: string;
  monthKey?: string | null;
}): Promise<MonthlyReportView | null> {
  if (!featureFlags.monthlyPerformanceReport) {
    return null;
  }

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: {
      id: true,
      units: true,
      displayName: true,
      user: { select: { name: true } },
    },
  });
  if (!profile) return null;

  const now = new Date();
  const window =
    (input.monthKey ? parseMonthKey(input.monthKey, now) : null) ??
    monthWindowContaining(now);
  const prevWindow = previousMonthWindow(window);

  const [thisSignals, prevSignals] = await Promise.all([
    gatherMonthSignals(profile.id, window),
    gatherMonthSignals(profile.id, prevWindow),
  ]);

  const unitsLabel = normalizeMassUnit(profile.units);
  const athleteDisplayName =
    profile.displayName?.trim() || profile.user.name?.trim() || "Athlete";

  const report = assembleMonthlyAthleteReport({
    thisMonth: thisSignals,
    previousMonth: prevSignals,
    athleteDisplayName,
    now,
    unitsLabel,
  });

  const previousReport = assembleMonthlyAthleteReport({
    thisMonth: prevSignals,
    previousMonth: await gatherMonthSignals(
      profile.id,
      previousMonthWindow(prevWindow),
    ),
    athleteDisplayName,
    now: prevWindow.monthEnd,
    unitsLabel,
  });

  const summary = report.headline ?? report.month.label;

  const stored = await prisma.monthlyAthleteReport.upsert({
    where: {
      athleteProfileId_monthKey: {
        athleteProfileId: profile.id,
        monthKey: window.monthKey,
      },
    },
    create: {
      athleteProfileId: profile.id,
      monthStart: window.monthStart,
      monthKey: window.monthKey,
      engineVersion: MONTHLY_REPORT_ENGINE_VERSION,
      summary,
      reportJson: JSON.stringify(report),
    },
    update: {
      monthStart: window.monthStart,
      engineVersion: MONTHLY_REPORT_ENGINE_VERSION,
      summary,
      reportJson: JSON.stringify(report),
    },
    select: { id: true },
  });

  await prisma.monthlyAthleteReport.upsert({
    where: {
      athleteProfileId_monthKey: {
        athleteProfileId: profile.id,
        monthKey: prevWindow.monthKey,
      },
    },
    create: {
      athleteProfileId: profile.id,
      monthStart: prevWindow.monthStart,
      monthKey: prevWindow.monthKey,
      engineVersion: MONTHLY_REPORT_ENGINE_VERSION,
      summary: previousReport.headline ?? previousReport.month.label,
      reportJson: JSON.stringify(previousReport),
    },
    update: {
      monthStart: prevWindow.monthStart,
      engineVersion: MONTHLY_REPORT_ENGINE_VERSION,
      summary: previousReport.headline ?? previousReport.month.label,
      reportJson: JSON.stringify(previousReport),
    },
  });

  const historyRows = await prisma.monthlyAthleteReport.findMany({
    where: { athleteProfileId: profile.id },
    orderBy: { monthStart: "desc" },
    take: 24,
    select: {
      id: true,
      monthKey: true,
      monthStart: true,
      summary: true,
      updatedAt: true,
    },
  });

  return {
    athleteProfileId: profile.id,
    athleteDisplayName,
    report,
    storedId: stored.id,
    previousReport,
    history: historyRows.map((r) => ({
      id: r.id,
      monthKey: r.monthKey,
      monthStartIso: r.monthStart.toISOString(),
      summary: r.summary,
      updatedAtIso: r.updatedAt.toISOString(),
    })),
  };
}

export async function createMonthlyReportShare(input: {
  userId: string;
  monthKey?: string | null;
}): Promise<
  { ok: true; token: string; path: string } | { ok: false; error: string }
> {
  if (!featureFlags.monthlyPerformanceReport) {
    return { ok: false, error: "Monthly reports are not enabled." };
  }

  const view = await getMonthlyAthleteReport({
    userId: input.userId,
    monthKey: input.monthKey,
  });
  if (!view) {
    return { ok: false, error: "Could not build monthly report." };
  }

  const payload = buildMonthlyReportSharePayload({
    athleteDisplayName: view.athleteDisplayName,
    report: view.report,
  });

  const token = randomBytes(16).toString("hex");
  await prisma.monthlyReportShare.create({
    data: {
      athleteProfileId: view.athleteProfileId,
      reportId: view.storedId,
      token,
      payloadJson: JSON.stringify(payload),
    },
  });

  return { ok: true, token, path: `/share/monthly/${token}` };
}

export async function getMonthlyReportShareByToken(
  token: string,
): Promise<MonthlyReportSharePayload | null> {
  const row = await prisma.monthlyReportShare.findUnique({
    where: { token },
  });
  if (!row) return null;
  if (row.expiresAt && row.expiresAt.getTime() < Date.now()) return null;
  try {
    return JSON.parse(row.payloadJson) as MonthlyReportSharePayload;
  } catch {
    return null;
  }
}
