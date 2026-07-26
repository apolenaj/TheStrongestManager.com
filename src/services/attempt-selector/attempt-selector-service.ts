import { prisma } from "@/lib/db";
import { getAthleteState } from "@/services/performance-intelligence";
import { parseTargetLiftsJson } from "@/services/competition-mode/competition-mode-service";
import { PAIN_SAFE_SEEK_CARE_MESSAGE } from "@/domain/pain-safe-response-system";
import { isPainSafeModeActiveForAthlete } from "@/services/pain-safe-response-system";
import type {
  AttemptConfidence,
  AttemptLift,
  MeetAttemptHistoryEntry,
  StrengthEstimate,
} from "@/domain/attempt-selector";
import {
  inferTrainingPhase,
  mapTrendDirection,
  predictOneRmRange,
  type WorkingSetInput,
} from "@/domain/pr-prediction";

const SLUG_BY_LIFT: Record<AttemptLift, string> = {
  squat: "back-squat",
  bench: "bench-press",
  deadlift: "deadlift",
};

export type AttemptSelectorLiftContext = {
  lift: AttemptLift;
  recentStrength: StrengthEstimate | null;
  goalKg: number | null;
  history: Array<{
    meetDate: string;
    openerKg: number | null;
    secondKg: number | null;
    thirdKg: number | null;
    bestMadeKg: number | null;
    missedOpener: boolean | null;
  }>;
};

export type AttemptSelectorPageData = {
  profileId: string;
  lifts: AttemptSelectorLiftContext[];
  defaultConfidence: AttemptConfidence;
  defaultLift: AttemptLift;
  meetName: string | null;
  /** Pain-safe mode: withhold aggressive attempt planning. */
  painSafeModeActive: boolean;
  painSafeMessage: string | null;
};

function mapHistory(
  lift: AttemptLift,
  rows: MeetAttemptHistoryEntry[],
): AttemptSelectorLiftContext["history"] {
  return rows
    .filter((h) => h.lift === lift)
    .map((h) => ({
      meetDate: h.meetDate.toISOString(),
      openerKg: h.openerKg,
      secondKg: h.secondKg,
      thirdKg: h.thirdKg,
      bestMadeKg: h.bestMadeKg,
      missedOpener: h.missedOpener,
    }));
}

/**
 * Gather recent strength, goals, and any logged meet history for the attempt tool.
 */
export async function getAttemptSelectorData(
  userId: string,
): Promise<AttemptSelectorPageData | null> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return null;

  const now = new Date();
  const since = new Date(now.getTime() - 56 * 24 * 60 * 60 * 1000);

  const [stateView, recovery, prep, completedPreps, sets, progressRows] =
    await Promise.all([
      getAthleteState(userId),
      prisma.recoveryEntry.findFirst({
        where: { athleteProfileId: profile.id },
        orderBy: { recordedAt: "desc" },
        select: { fatigue: true, readiness: true },
      }),
      prisma.competitionPrep.findFirst({
        where: {
          athleteProfileId: profile.id,
          status: { in: ["active", "planned"] },
        },
        orderBy: { competitionDate: "asc" },
      }),
      prisma.competitionPrep.findMany({
        where: {
          athleteProfileId: profile.id,
          status: "completed",
        },
        orderBy: { competitionDate: "desc" },
        take: 6,
      }),
      prisma.sessionSet.findMany({
        where: {
          completedAt: { gte: since },
          performedLoadKg: { not: null },
          performedReps: { not: null },
          setType: { in: ["work", "amrap"] },
          sessionExercise: {
            exercise: {
              slug: { in: Object.values(SLUG_BY_LIFT) },
            },
            trainingSession: {
              athleteProfileId: profile.id,
              status: "completed",
            },
          },
        },
        orderBy: { completedAt: "asc" },
        select: {
          performedLoadKg: true,
          performedReps: true,
          performedRpe: true,
          prescribedReps: true,
          completedAt: true,
          sessionExercise: {
            select: { exercise: { select: { slug: true } } },
          },
        },
      }),
      prisma.progressMetric.findMany({
        where: {
          athleteProfileId: profile.id,
          metricKey: {
            in: ["lift_squat", "lift_bench", "lift_deadlift"],
          },
          OR: [{ reps: 1 }, { reps: null }],
        },
        orderBy: { recordedAt: "desc" },
        take: 12,
        select: {
          metricKey: true,
          value: true,
          unit: true,
          recordedAt: true,
          source: true,
        },
      }),
    ]);

  const trend = mapTrendDirection(
    stateView?.state.performanceTrend.value?.direction,
  );
  const trainingPhase = inferTrainingPhase(
    stateView?.state.programProgress.value?.activeProgramName,
  );

  const bySlug = new Map<string, WorkingSetInput[]>();
  for (const slug of Object.values(SLUG_BY_LIFT)) bySlug.set(slug, []);

  for (const row of sets) {
    const slug = row.sessionExercise.exercise?.slug;
    if (!slug || !bySlug.has(slug)) continue;
    if (
      row.performedLoadKg == null ||
      row.performedReps == null ||
      row.completedAt == null
    ) {
      continue;
    }
    let hitRepTarget: boolean | null = null;
    if (row.prescribedReps != null) {
      hitRepTarget = row.performedReps >= row.prescribedReps;
    }
    bySlug.get(slug)!.push({
      loadKg: row.performedLoadKg,
      reps: row.performedReps,
      rpe: row.performedRpe,
      completedAt: row.completedAt,
      hitRepTarget,
    });
  }

  const targets = prep
    ? parseTargetLiftsJson(prep.targetLiftsJson)
    : { squatKg: null, benchKg: null, deadliftKg: null, notes: null };

  // History: completed meet targets as best-made proxies when present (honest: weak signal)
  const history: MeetAttemptHistoryEntry[] = [];
  for (const past of completedPreps) {
    const t = parseTargetLiftsJson(past.targetLiftsJson);
    const entries: Array<[AttemptLift, number | null]> = [
      ["squat", t.squatKg],
      ["bench", t.benchKg],
      ["deadlift", t.deadliftKg],
    ];
    for (const [lift, kg] of entries) {
      if (kg == null) continue;
      history.push({
        meetDate: past.competitionDate,
        lift,
        openerKg: null,
        secondKg: null,
        thirdKg: kg,
        bestMadeKg: kg,
        missedOpener: null,
      });
    }
  }

  // Also treat verified/reported singles on progress metrics as historical makes
  for (const row of progressRows) {
    let lift: AttemptLift | null = null;
    if (row.metricKey === "lift_squat") lift = "squat";
    if (row.metricKey === "lift_bench") lift = "bench";
    if (row.metricKey === "lift_deadlift") lift = "deadlift";
    if (!lift) continue;
    let kg = row.value;
    if (row.unit === "lb" || row.unit === "lbs") kg = row.value * 0.45359237;
    history.push({
      meetDate: row.recordedAt,
      lift,
      openerKg: null,
      secondKg: null,
      thirdKg: null,
      bestMadeKg: kg,
      missedOpener: null,
    });
  }

  const lifts: AttemptLift[] = ["squat", "bench", "deadlift"];
  const contexts: AttemptSelectorLiftContext[] = [];

  for (const lift of lifts) {
    const slug = SLUG_BY_LIFT[lift];
    const workingSets = bySlug.get(slug) ?? [];
    let recentStrength: StrengthEstimate | null = null;
    if (workingSets.length > 0) {
      const predicted = predictOneRmRange(
        {
          exerciseKey: slug,
          exerciseLabel: lift,
          workingSets,
          trend,
          trainingPhase,
          fatigue: recovery?.fatigue ?? null,
          readiness: recovery?.readiness ?? null,
        },
        now,
      );
      if ("prediction" in predicted) {
        recentStrength = {
          lowKg: predicted.prediction.rangeKg.low,
          highKg: predicted.prediction.rangeKg.high,
          sourceLabel: `PR prediction (${predicted.prediction.confidence})`,
        };
      }
    }

    const goalKg =
      lift === "squat"
        ? targets.squatKg
        : lift === "bench"
          ? targets.benchKg
          : targets.deadliftKg;

    contexts.push({
      lift,
      recentStrength,
      goalKg,
      history: mapHistory(lift, history),
    });
  }

  // Default confidence from readiness
  let defaultConfidence: AttemptConfidence = "moderate";
  if (recovery?.readiness != null) {
    if (recovery.readiness >= 75) defaultConfidence = "high";
    else if (recovery.readiness < 50) defaultConfidence = "low";
  }

  const sport = prep?.sport;
  const defaultLift: AttemptLift =
    sport === "deadlift_only" ? "deadlift" : "deadlift";

  const painSafeModeActive = await isPainSafeModeActiveForAthlete(profile.id);

  return {
    profileId: profile.id,
    lifts: contexts,
    defaultConfidence: painSafeModeActive ? "low" : defaultConfidence,
    defaultLift,
    meetName: prep?.name ?? null,
    painSafeModeActive,
    painSafeMessage: painSafeModeActive ? PAIN_SAFE_SEEK_CARE_MESSAGE : null,
  };
}
