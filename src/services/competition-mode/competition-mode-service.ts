import { prisma } from "@/lib/db";
import { getAthleteState } from "@/services/performance-intelligence";
import {
  assembleCompetitionMode,
  COMP_HEAVY_RPE_MIN,
  type CompetitionModeView,
  type CompetitionSport,
  type CompetitionTargetLifts,
  type LiftEstimateKg,
} from "@/domain/competition-mode";
import { normalizeTimezone } from "@/domain/timezone-system";
import {
  inferTrainingPhase,
  mapTrendDirection,
  predictOneRmRange,
  type WorkingSetInput,
} from "@/domain/pr-prediction";

const SLUG_TO_LIFT: Record<string, "squat" | "bench" | "deadlift"> = {
  "back-squat": "squat",
  "bench-press": "bench",
  deadlift: "deadlift",
};

export type CompetitionModePageView = {
  profileId: string;
  /** Athlete IANA timezone — countdowns and date labels use this. */
  timeZone: string;
  view: CompetitionModeView | null;
  /** Active prep row when present — for the setup form defaults. */
  prep: {
    id: string;
    sport: CompetitionSport;
    name: string | null;
    competitionDate: string;
    weightClassLabel: string | null;
    weightClassLimitKg: number | null;
    targets: CompetitionTargetLifts;
  } | null;
};

export function parseTargetLiftsJson(raw: string): CompetitionTargetLifts {
  try {
    const j = JSON.parse(raw) as Record<string, unknown>;
    const num = (v: unknown) =>
      typeof v === "number" && Number.isFinite(v) && v > 0 ? v : null;
    return {
      squatKg: num(j.squatKg),
      benchKg: num(j.benchKg),
      deadliftKg: num(j.deadliftKg),
      notes: typeof j.notes === "string" ? j.notes : null,
    };
  } catch {
    return {
      squatKg: null,
      benchKg: null,
      deadliftKg: null,
      notes: null,
    };
  }
}

export function serializeTargetLifts(t: CompetitionTargetLifts): string {
  return JSON.stringify({
    squatKg: t.squatKg,
    benchKg: t.benchKg,
    deadliftKg: t.deadliftKg,
    notes: t.notes,
  });
}

function isSport(v: string): v is CompetitionSport {
  return v === "powerlifting" || v === "deadlift_only" || v === "strongman";
}

/**
 * Load active competition prep + signals into Competition Mode view.
 */
export async function getCompetitionMode(
  userId: string,
): Promise<CompetitionModePageView | null> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true, timezone: true },
  });
  if (!profile) return null;
  const timeZone = normalizeTimezone(profile.timezone);

  const now = new Date();
  const since56 = new Date(now.getTime() - 56 * 24 * 60 * 60 * 1000);

  const [prepRow, stateView, recovery, bodyMetrics, sets] = await Promise.all([
    prisma.competitionPrep.findFirst({
      where: {
        athleteProfileId: profile.id,
        status: { in: ["active", "planned"] },
      },
      orderBy: { competitionDate: "asc" },
    }),
    getAthleteState(userId),
    prisma.recoveryEntry.findFirst({
      where: { athleteProfileId: profile.id },
      orderBy: { recordedAt: "desc" },
      select: {
        readiness: true,
        readinessConfidence: true,
        fatigue: true,
      },
    }),
    prisma.bodyMetric.findMany({
      where: {
        athleteProfileId: profile.id,
        metricKey: "bodyweight",
        recordedAt: { gte: since56 },
      },
      orderBy: { recordedAt: "asc" },
      select: { value: true, unit: true, recordedAt: true },
    }),
    prisma.sessionSet.findMany({
      where: {
        completedAt: { gte: since56 },
        performedLoadKg: { not: null },
        performedReps: { not: null },
        setType: { in: ["work", "amrap"] },
        sessionExercise: {
          exercise: {
            slug: { in: ["back-squat", "bench-press", "deadlift"] },
          },
          trainingSession: {
            athleteProfileId: profile.id,
            status: "completed",
          },
        },
      },
      orderBy: { completedAt: "desc" },
      select: {
        performedLoadKg: true,
        performedReps: true,
        performedRpe: true,
        prescribedReps: true,
        completedAt: true,
        sessionExercise: {
          select: {
            exercise: { select: { slug: true, name: true } },
          },
        },
      },
    }),
  ]);

  if (!prepRow || !isSport(prepRow.sport)) {
    return { profileId: profile.id, timeZone, view: null, prep: null };
  }

  const targets = parseTargetLiftsJson(prepRow.targetLiftsJson);
  const prep = {
    id: prepRow.id,
    sport: prepRow.sport,
    name: prepRow.name,
    competitionDate: prepRow.competitionDate.toISOString(),
    weightClassLabel: prepRow.weightClassLabel,
    weightClassLimitKg: prepRow.weightClassLimitKg,
    targets,
  };

  const trend = mapTrendDirection(
    stateView?.state.performanceTrend.value?.direction,
  );
  const trainingPhase = inferTrainingPhase(
    stateView?.state.programProgress.value?.activeProgramName,
  );

  const byLift = new Map<string, WorkingSetInput[]>();
  for (const slug of Object.keys(SLUG_TO_LIFT)) byLift.set(slug, []);

  let lastHeavy: {
    at: Date;
    exerciseLabel: string;
    loadKg: number;
    reps: number;
    rpe: number | null;
  } | null = null;

  for (const row of sets) {
    const ex = row.sessionExercise.exercise;
    if (!ex || row.completedAt == null) continue;
    if (row.performedLoadKg == null || row.performedReps == null) continue;

    const bucket = byLift.get(ex.slug);
    if (bucket) {
      let hitRepTarget: boolean | null = null;
      if (row.prescribedReps != null) {
        hitRepTarget = row.performedReps >= row.prescribedReps;
      }
      bucket.push({
        loadKg: row.performedLoadKg,
        reps: row.performedReps,
        rpe: row.performedRpe,
        completedAt: row.completedAt,
        hitRepTarget,
      });
    }

    const isHeavy =
      (row.performedRpe != null && row.performedRpe >= COMP_HEAVY_RPE_MIN) ||
      row.performedReps <= 3;
    if (isHeavy && lastHeavy == null) {
      lastHeavy = {
        at: row.completedAt,
        exerciseLabel: ex.name || ex.slug,
        loadKg: row.performedLoadKg,
        reps: row.performedReps,
        rpe: row.performedRpe,
      };
    }
  }

  const liftEstimates: LiftEstimateKg[] = [];
  for (const [slug, lift] of Object.entries(SLUG_TO_LIFT)) {
    const workingSets = byLift.get(slug) ?? [];
    if (workingSets.length === 0) {
      liftEstimates.push({ lift, rangeKg: null });
      continue;
    }
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
    liftEstimates.push({
      lift,
      rangeKg:
        "prediction" in predicted ? predicted.prediction.rangeKg : null,
    });
  }

  // Bodyweight trend (kg) — assume stored kg when unit missing/kg
  const bwSamples = bodyMetrics
    .map((m) => {
      let kg = m.value;
      if (m.unit === "lb" || m.unit === "lbs") kg = m.value * 0.45359237;
      return { at: m.recordedAt, kg };
    })
    .filter((s) => s.kg > 0);

  let kgPerWeek: number | null = null;
  if (bwSamples.length >= 3) {
    const mid = Math.floor(bwSamples.length / 2);
    const early = bwSamples.slice(0, mid);
    const late = bwSamples.slice(mid);
    const mean = (xs: { kg: number }[]) =>
      xs.reduce((s, x) => s + x.kg, 0) / xs.length;
    const earlyMid = early[Math.floor(early.length / 2)]!.at;
    const lateMid = late[Math.floor(late.length / 2)]!.at;
    const weeks =
      (lateMid.getTime() - earlyMid.getTime()) / (7 * 24 * 60 * 60 * 1000);
    if (weeks >= 1.5) {
      kgPerWeek = (mean(late) - mean(early)) / weeks;
    }
  }

  const view = assembleCompetitionMode(
    {
      competition: {
        id: prepRow.id,
        sport: prepRow.sport,
        name: prepRow.name,
        competitionDate: prepRow.competitionDate,
        weightClassLabel: prepRow.weightClassLabel,
        weightClassLimitKg: prepRow.weightClassLimitKg,
        targets,
        status: prepRow.status,
      },
      liftEstimates,
      lastHeavySession: lastHeavy,
      bodyweight: {
        latestKg: bwSamples.at(-1)?.kg ?? null,
        kgPerWeek,
        sampleCount: bwSamples.length,
      },
      readiness: {
        latest: recovery?.readiness ?? null,
        confidence: recovery?.readinessConfidence ?? null,
        fatigue: recovery?.fatigue ?? null,
      },
    },
    now,
    timeZone,
  );

  return { profileId: profile.id, timeZone, view, prep };
}

export async function upsertCompetitionPrep(
  userId: string,
  input: {
    sport: CompetitionSport;
    name?: string | null;
    competitionDate: Date;
    weightClassLabel?: string | null;
    weightClassLimitKg?: number | null;
    targets: CompetitionTargetLifts;
  },
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return { ok: false, error: "No athlete profile." };

  if (Number.isNaN(input.competitionDate.getTime())) {
    return { ok: false, error: "Invalid competition date." };
  }

  const existing = await prisma.competitionPrep.findFirst({
    where: {
      athleteProfileId: profile.id,
      status: { in: ["active", "planned"] },
    },
    orderBy: { competitionDate: "asc" },
  });

  const data = {
    sport: input.sport,
    name: input.name?.trim() || null,
    competitionDate: input.competitionDate,
    weightClassLabel: input.weightClassLabel?.trim() || null,
    weightClassLimitKg:
      input.weightClassLimitKg != null && input.weightClassLimitKg > 0
        ? input.weightClassLimitKg
        : null,
    targetLiftsJson: serializeTargetLifts(input.targets),
    status: "active" as const,
  };

  if (existing) {
    await prisma.competitionPrep.update({
      where: { id: existing.id },
      data,
    });
    return { ok: true, id: existing.id };
  }

  const created = await prisma.competitionPrep.create({
    data: {
      athleteProfileId: profile.id,
      ...data,
    },
  });
  return { ok: true, id: created.id };
}
