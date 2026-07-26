import { featureFlags } from "@/config/feature-flags";
import {
  assembleAthleteState,
  PI_HONESTY,
  PERFORMANCE_INTELLIGENCE_ENGINE_VERSION,
  type AthleteState,
  type IntelligenceParts,
} from "@/domain/performance-intelligence";
import {
  INSIGHT_BODYWEIGHT_LOOKBACK_DAYS,
  INSIGHT_RECOVERY_LOOKBACK_DAYS,
  INSIGHT_TRAINING_BASELINE_DAYS,
  INSIGHT_TRAINING_RECENT_DAYS,
} from "@/domain/insights/constants";
import { getActiveNutritionProvider } from "@/domain/nutrition";
import { computeAthleteScores } from "@/domain/scoring";
import { analyzeStrength } from "@/domain/scoring/strength";
import type {
  InputSourceKind,
  ScoringSnapshot,
} from "@/domain/scoring/types";
import {
  assessLoadSpike,
  buildDailyVolumeSeries,
  setVolumeKg,
  LOAD_WINDOW_7_DAYS,
  LOAD_WINDOW_28_DAYS,
  type LoadSetInput,
} from "@/domain/training-load";
import { prisma } from "@/lib/db";
import { MAJOR_LIFTS } from "@/services/onboarding/options";
import { toCanonicalKg } from "@/services/units/convert";

const LIFT_KEYS = MAJOR_LIFTS.map((lift) => lift.metricKey);

function daysAgo(days: number, now: Date): Date {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

function toInputSource(
  raw: string | null | undefined,
): InputSourceKind {
  if (
    raw === "observed" ||
    raw === "heuristic" ||
    raw === "reported" ||
    raw === "recommended"
  ) {
    return raw;
  }
  return "reported";
}

export type AthleteStateView = {
  state: AthleteState;
  honesty: readonly string[];
  engineVersion: string;
};

/**
 * Central Performance Intelligence entrypoint.
 * UI and other services must call this (or assembleAthleteState with service-built parts)
 * — never recompute AthleteState fields in components.
 */
export async function getAthleteState(
  userId: string,
): Promise<AthleteStateView | null> {
  const parts = await loadIntelligenceParts(userId);
  if (!parts) return null;

  return {
    state: assembleAthleteState(parts),
    honesty: PI_HONESTY,
    engineVersion: PERFORMANCE_INTELLIGENCE_ENGINE_VERSION,
  };
}

/**
 * Gather athlete signals once and map into IntelligenceParts for pure assembly.
 */
export async function loadIntelligenceParts(
  userId: string,
): Promise<IntelligenceParts | null> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    include: {
      goals: {
        where: { status: "active" },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        take: 1,
      },
      trainingExperience: true,
      bodyMetrics: {
        where: { metricKey: "bodyweight" },
        orderBy: { recordedAt: "desc" },
        take: 40,
      },
      progressMetrics: {
        where: { metricKey: { in: [...LIFT_KEYS] } },
        orderBy: { recordedAt: "desc" },
        take: 80,
      },
      trainingSessions: {
        orderBy: [{ scheduledAt: "desc" }, { createdAt: "desc" }],
        take: 60,
        select: {
          status: true,
          scheduledAt: true,
          completedAt: true,
          startedAt: true,
          programId: true,
        },
      },
      techniqueAnalyses: {
        where: { status: "completed", overallScore: { not: null } },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          overallScore: true,
          createdAt: true,
          confidenceBasis: true,
        },
      },
      recoveryEntries: {
        orderBy: { recordedAt: "desc" },
        take: 28,
        select: {
          readiness: true,
          recordedAt: true,
          source: true,
        },
      },
      programs: {
        where: { status: "active" },
        orderBy: { updatedAt: "desc" },
        take: 1,
        select: { id: true, name: true },
      },
    },
  });

  if (!profile) return null;

  const now = new Date();
  const activeProgram = profile.programs[0] ?? null;

  const snapshot: ScoringSnapshot = {
    now,
    lifts: profile.progressMetrics.map((m) => ({
      metricKey: m.metricKey,
      valueKg: toCanonicalKg(m.value, m.unit ?? "kg"),
      reps: m.reps,
      recordedAt: m.recordedAt,
      source: toInputSource(m.source),
    })),
    techniqueAnalyses: profile.techniqueAnalyses.map((a) => ({
      overallScore: a.overallScore as number,
      recordedAt: a.createdAt,
      confidenceBasis: toInputSource(a.confidenceBasis),
    })),
    recoveryEntries: profile.recoveryEntries
      .filter((e) => e.readiness != null)
      .map((e) => ({
        readiness: e.readiness as number,
        recordedAt: e.recordedAt,
        source: toInputSource(e.source),
      })),
    sessions: profile.trainingSessions.map((s) => ({
      status: s.status,
      scheduledAt: s.scheduledAt,
      completedAt: s.completedAt,
      startedAt: s.startedAt,
      programId: s.programId,
    })),
    activeProgramId: activeProgram?.id ?? null,
    activeProgramName: activeProgram?.name ?? null,
    bodyweightKg: profile.bodyMetrics[0]
      ? toCanonicalKg(
          profile.bodyMetrics[0].value,
          profile.bodyMetrics[0].unit,
        )
      : null,
    experienceLevel: profile.trainingExperience?.level ?? null,
    primaryDiscipline: profile.primaryDiscipline,
  };

  const scores = computeAthleteScores(snapshot);
  const strengthAssessment = analyzeStrength(snapshot);

  const trainingSince = daysAgo(
    INSIGHT_TRAINING_RECENT_DAYS + INSIGHT_TRAINING_BASELINE_DAYS,
    now,
  );
  const recentCutoff = daysAgo(INSIGHT_TRAINING_RECENT_DAYS, now);
  const bwSince = daysAgo(INSIGHT_BODYWEIGHT_LOOKBACK_DAYS, now);
  const loadSince = daysAgo(LOAD_WINDOW_28_DAYS, now);

  const [sets, nutritionConnection] = await Promise.all([
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
        performedRpe: true,
        performedRir: true,
        prescribedPercent: true,
        sessionExercise: {
          select: {
            trainingSessionId: true,
            exerciseId: true,
            exerciseNameSnapshot: true,
            trainingSession: {
              select: { perceivedEffort: true },
            },
          },
        },
      },
    }),
    getActiveNutritionProvider().getConnection({
      athleteProfileId: profile.id,
    }),
  ]);

  let recentVolumeKg = 0;
  let priorVolumeKg = 0;
  for (const set of sets) {
    if (!set.completedAt) continue;
    const vol = setVolumeKg({
      performedLoadKg: set.performedLoadKg,
      performedReps: set.performedReps,
    });
    if (vol == null) continue;
    if (set.completedAt >= recentCutoff) recentVolumeKg += vol;
    else priorVolumeKg += vol;
  }

  const loadSets: LoadSetInput[] = sets
    .filter((s) => s.completedAt != null && s.completedAt >= loadSince)
    .map((s) => ({
      sessionId: s.sessionExercise.trainingSessionId,
      exerciseId: s.sessionExercise.exerciseId,
      exerciseName: s.sessionExercise.exerciseNameSnapshot,
      completedAt: s.completedAt as Date,
      performedReps: s.performedReps,
      performedLoadKg: s.performedLoadKg,
      performedRpe: s.performedRpe,
      performedRir: s.performedRir,
      prescribedPercent: s.prescribedPercent,
      sessionRpe: s.sessionExercise.trainingSession.perceivedEffort,
    }));

  const daily = buildDailyVolumeSeries(loadSets);
  const loadSpike = assessLoadSpike({
    daily,
    recentDays: LOAD_WINDOW_7_DAYS,
    baselineDays: LOAD_WINDOW_28_DAYS - LOAD_WINDOW_7_DAYS,
    asOf: now,
  });

  const syncEnabled = featureFlags.mealnexioSync;
  let nutritionHasTargets = false;
  if (syncEnabled && nutritionConnection.status === "connected") {
    const targets = await getActiveNutritionProvider().fetchDailyTargets({
      athleteProfileId: profile.id,
      date: now.toISOString().slice(0, 10),
    });
    nutritionHasTargets = targets != null;
  }

  const bodyweightPoints = profile.bodyMetrics
    .filter((m) => m.recordedAt >= bwSince)
    .map((m) => ({
      at: m.recordedAt,
      kg: toCanonicalKg(m.value, m.unit),
    }))
    .reverse();

  const recoveryReadiness = profile.recoveryEntries
    .filter((e) => e.readiness != null)
    .filter(
      (e) =>
        e.recordedAt >= daysAgo(INSIGHT_RECOVERY_LOOKBACK_DAYS, now),
    )
    .map((e) => ({
      at: e.recordedAt,
      readiness: e.readiness as number,
    }));

  const signalTimestamps: { kind: string; at: Date }[] = [];
  for (const s of profile.trainingSessions) {
    const when = s.completedAt ?? s.startedAt ?? s.scheduledAt;
    if (when) signalTimestamps.push({ kind: "training_session", at: when });
  }
  for (const e of profile.recoveryEntries) {
    signalTimestamps.push({ kind: "recovery_checkin", at: e.recordedAt });
  }
  for (const a of profile.techniqueAnalyses) {
    signalTimestamps.push({ kind: "technique_analysis", at: a.createdAt });
  }
  for (const m of profile.bodyMetrics) {
    signalTimestamps.push({ kind: "bodyweight", at: m.recordedAt });
  }
  for (const m of profile.progressMetrics) {
    signalTimestamps.push({ kind: "lift_log", at: m.recordedAt });
  }

  const goal = profile.goals[0]
    ? {
        title: profile.goals[0].title,
        category: profile.goals[0].category,
        targetValue: profile.goals[0].targetValue,
      }
    : null;

  return {
    athleteProfileId: profile.id,
    now,
    scores,
    strengthTrend: strengthAssessment.trend,
    techniqueSamples: profile.techniqueAnalyses.map((a) => ({
      overallScore: a.overallScore as number,
      recordedAt: a.createdAt,
    })),
    bodyweightPoints,
    recoveryReadiness,
    recentVolumeKg,
    priorVolumeKg,
    loadSpike,
    goal,
    activeProgramName: activeProgram?.name ?? null,
    nutrition: {
      connected: nutritionConnection.status === "connected",
      hasTargets: nutritionHasTargets,
    },
    signalTimestamps,
  };
}
