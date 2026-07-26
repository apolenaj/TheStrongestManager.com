import { prisma } from "@/lib/db";
import {
  parseProgressRangeId,
  PROGRESS_RANGES,
  rangeStartDate,
  type ChartPoint,
  type ProgressRangeId,
  type ProgressSeries,
} from "@/domain/progress/ranges";
import {
  bestPerDay,
  bucketWeeklyVolume,
  buildPrTimeline,
  e1rmPointsFromSets,
} from "@/domain/progress/series";
import { setVolumeKg } from "@/domain/training-load/compute";
import { toDayKey } from "@/domain/training-load/compute";
import { MAJOR_LIFTS } from "@/services/onboarding/options";
import {
  formatMass,
  fromCanonicalKg,
  normalizeMassUnit,
  roundDisplay,
  toCanonicalKg,
  type MassUnit,
} from "@/services/units/convert";

export type ExerciseOption = {
  id: string;
  label: string;
  /** When set, also pull ProgressMetric rows for this key. */
  metricKey: string | null;
};

export type ProgressAnalyticsView = {
  units: MassUnit;
  rangeId: ProgressRangeId;
  rangeLabel: string;
  exerciseId: string | null;
  exercises: ExerciseOption[];
  series: {
    strengthTrend: ProgressSeries;
    prTimeline: ProgressSeries;
    estimated1rm: ProgressSeries;
    volume: ProgressSeries;
    bodyweight: ProgressSeries;
    techniqueTrend: ProgressSeries;
    consistency: ProgressSeries;
    programAdherence: ProgressSeries;
  };
  /** Summary chips for consistency / adherence in the selected range. */
  summaries: {
    consistencyPct: number | null;
    programAdherencePct: number | null;
    completedSessions: number;
    skippedSessions: number;
    programLinkedCompleted: number;
    programLinkedSkipped: number;
  };
};

function massUnitLabel(units: MassUnit): string {
  return units;
}

function toDisplayMass(kg: number, units: MassUnit): number {
  return roundDisplay(fromCanonicalKg(kg, units), units === "lb" ? 1 : 1);
}

function filterFrom(
  rangeId: ProgressRangeId,
  asOf: Date,
): Date | null {
  return rangeStartDate(rangeId, asOf);
}

function inRange(at: Date, from: Date | null, to: Date): boolean {
  if (at > to) return false;
  if (from && at < from) return false;
  return true;
}

export async function getProgressAnalytics(input: {
  userId: string;
  rangeId?: string | null;
  exerciseId?: string | null;
  asOf?: Date;
}): Promise<ProgressAnalyticsView | null> {
  const asOf = input.asOf ?? new Date();
  const rangeId = parseProgressRangeId(input.rangeId);
  const rangeDef = PROGRESS_RANGES.find((r) => r.id === rangeId)!;
  const from = filterFrom(rangeId, asOf);
  const to = asOf;

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: { id: true, units: true },
  });
  if (!profile) return null;

  const units = normalizeMassUnit(profile.units);
  const unitLabel = massUnitLabel(units);

  // Exercise catalog for selector: logged session exercises + major lifts
  const loggedExercises = await prisma.sessionExercise.findMany({
    where: {
      trainingSession: {
        athleteProfileId: profile.id,
        status: "completed",
      },
    },
    select: {
      exerciseId: true,
      exercise: { select: { name: true, slug: true } },
    },
    distinct: ["exerciseId"],
    orderBy: { exercise: { name: "asc" } },
    take: 80,
  });

  const exercises: ExerciseOption[] = [
    ...MAJOR_LIFTS.map((lift) => ({
      id: `metric:${lift.metricKey}`,
      label: `${lift.label} (log)`,
      metricKey: lift.metricKey,
    })),
    ...loggedExercises.map((row) => ({
      id: row.exerciseId,
      label: row.exercise.name,
      metricKey: null as string | null,
    })),
  ];

  // Dedupe by id
  const seen = new Set<string>();
  const uniqueExercises = exercises.filter((ex) => {
    if (seen.has(ex.id)) return false;
    seen.add(ex.id);
    return true;
  });

  const selectedId =
    input.exerciseId && uniqueExercises.some((e) => e.id === input.exerciseId)
      ? input.exerciseId
      : uniqueExercises[0]?.id ?? null;

  const selected = uniqueExercises.find((e) => e.id === selectedId) ?? null;

  // —— Strength / PR / e1RM sources ——
  const strengthPoints: ChartPoint[] = [];
  const prSamples: Array<{ at: string; valueKg: number; label: string }> = [];
  const e1rmRaw: ChartPoint[] = [];

  if (selected?.metricKey) {
    const metrics = await prisma.progressMetric.findMany({
      where: {
        athleteProfileId: profile.id,
        metricKey: selected.metricKey,
        ...(from ? { recordedAt: { gte: from, lte: to } } : { recordedAt: { lte: to } }),
      },
      orderBy: { recordedAt: "asc" },
    });

    for (const row of metrics) {
      const kg = toCanonicalKg(row.value, row.unit ?? "kg");
      const at = row.recordedAt.toISOString();
      const display = toDisplayMass(kg, units);
      strengthPoints.push({
        at,
        value: display,
        meta: `${formatMass(kg, units)} · ${row.source}`,
      });
      if (row.source === "observed" && (row.reps == null || row.reps === 1)) {
        prSamples.push({
          at,
          valueKg: kg,
          label: formatMass(kg, units),
        });
      }
      if (row.reps != null && row.reps >= 2) {
        const e1 = e1rmPointsFromSets([
          { at, loadKg: kg, reps: row.reps },
        ]);
        for (const p of e1) {
          e1rmRaw.push({
            ...p,
            value: toDisplayMass(p.value, units),
            meta: p.meta,
          });
        }
      }
    }
  }

  if (selected && !selected.metricKey) {
    const sets = await prisma.sessionSet.findMany({
      where: {
        completedAt: from
          ? { gte: from, lte: to }
          : { lte: to },
        performedLoadKg: { not: null },
        sessionExercise: {
          exerciseId: selected.id,
          trainingSession: {
            athleteProfileId: profile.id,
            status: "completed",
          },
        },
      },
      orderBy: { completedAt: "asc" },
    });

    for (const set of sets) {
      if (set.performedLoadKg == null || set.completedAt == null) continue;
      const at = set.completedAt.toISOString();
      const kg = set.performedLoadKg;
      const display = toDisplayMass(kg, units);
      strengthPoints.push({
        at,
        value: display,
        meta: [
          formatMass(kg, units),
          set.performedReps != null ? `${set.performedReps} reps` : null,
          set.performedRpe != null ? `RPE ${set.performedRpe}` : null,
        ]
          .filter(Boolean)
          .join(" · "),
      });
      if (set.performedReps == null || set.performedReps === 1) {
        prSamples.push({
          at,
          valueKg: kg,
          label: formatMass(kg, units),
        });
      }
      if (set.performedReps != null && set.performedReps >= 2) {
        const e1 = e1rmPointsFromSets([
          { at, loadKg: kg, reps: set.performedReps },
        ]);
        for (const p of e1) {
          e1rmRaw.push({
            ...p,
            value: toDisplayMass(p.value, units),
          });
        }
      }
    }
  }

  // Best load per day for strength trend readability
  const strengthTrendPoints = bestPerDay(strengthPoints);
  const prTimelinePoints = buildPrTimeline(prSamples).map((p) => ({
    ...p,
    value: toDisplayMass(p.value, units),
  }));
  const estimated1rmPoints = bestPerDay(e1rmRaw);

  // —— Volume (athlete-wide or exercise-filtered) ——
  const volumeSets = await prisma.sessionSet.findMany({
    where: {
      completedAt: from ? { gte: from, lte: to } : { lte: to },
      sessionExercise: {
        ...(selected && !selected.metricKey
          ? { exerciseId: selected.id }
          : {}),
        trainingSession: {
          athleteProfileId: profile.id,
          status: "completed",
        },
      },
    },
    select: {
      performedLoadKg: true,
      performedReps: true,
      completedAt: true,
    },
  });

  const dailyVol = new Map<string, number>();
  for (const set of volumeSets) {
    if (!set.completedAt) continue;
    // For metric-selected majors without session filter, volume still uses all sets
    // unless we only want that lift — metric keys don't map 1:1 to exerciseId always.
    const vol = setVolumeKg(set);
    if (vol == null) continue;
    const key = toDayKey(set.completedAt);
    dailyVol.set(key, (dailyVol.get(key) ?? 0) + vol);
  }
  const volumePoints = bucketWeeklyVolume(
    [...dailyVol.entries()].map(([dayKey, volumeKg]) => ({ dayKey, volumeKg })),
  ).map((p) => ({
    ...p,
    value:
      units === "lb"
        ? Math.round(p.value * 2.2046226218)
        : Math.round(p.value),
    meta: `Weekly volume (${units}·reps)`,
  }));

  // —— Bodyweight ——
  const bodyRows = await prisma.bodyMetric.findMany({
    where: {
      athleteProfileId: profile.id,
      metricKey: "bodyweight",
      ...(from ? { recordedAt: { gte: from, lte: to } } : { recordedAt: { lte: to } }),
    },
    orderBy: { recordedAt: "asc" },
  });
  const bodyweightPoints: ChartPoint[] = bodyRows.map((row) => {
    const kg = toCanonicalKg(row.value, row.unit);
    return {
      at: row.recordedAt.toISOString(),
      value: toDisplayMass(kg, units),
      meta: formatMass(kg, units),
    };
  });

  // —— Technique ——
  const techniqueWhere = {
    athleteProfileId: profile.id,
    status: "completed",
    overallScore: { not: null },
    deletedAt: null,
    ...(from ? { createdAt: { gte: from, lte: to } } : { createdAt: { lte: to } }),
    ...(selected && !selected.metricKey ? { exerciseId: selected.id } : {}),
  };
  const techniqueRows = await prisma.techniqueAnalysis.findMany({
    where: techniqueWhere,
    orderBy: { createdAt: "asc" },
    select: { overallScore: true, createdAt: true, confidenceBasis: true },
  });
  const techniquePoints: ChartPoint[] = techniqueRows.map((row) => ({
    at: row.createdAt.toISOString(),
    value: row.overallScore!,
    meta: row.confidenceBasis
      ? `Score · ${row.confidenceBasis}`
      : "Technique score",
  }));

  // —— Consistency & program adherence ——
  const sessions = await prisma.trainingSession.findMany({
    where: {
      athleteProfileId: profile.id,
      status: { in: ["completed", "skipped"] },
      OR: [
        { completedAt: from ? { gte: from, lte: to } : { lte: to } },
        {
          completedAt: null,
          scheduledAt: from ? { gte: from, lte: to } : { lte: to },
        },
      ],
    },
    select: {
      status: true,
      programId: true,
      completedAt: true,
      scheduledAt: true,
    },
  });

  const activeProgram = await prisma.program.findFirst({
    where: {
      athleteProfileId: profile.id,
      kind: "athlete",
      status: "active",
    },
    select: { id: true },
    orderBy: { updatedAt: "desc" },
  });

  const byWeek = new Map<string, { completed: number; skipped: number }>();
  const byWeekProgram = new Map<string, { completed: number; skipped: number }>();

  let completedSessions = 0;
  let skippedSessions = 0;
  let programLinkedCompleted = 0;
  let programLinkedSkipped = 0;

  for (const session of sessions) {
    const when = session.completedAt ?? session.scheduledAt;
    if (!when || !inRange(when, from, to)) continue;
    const weekStart = new Date(when);
    const dayIdx = (weekStart.getDay() + 6) % 7;
    weekStart.setDate(weekStart.getDate() - dayIdx);
    weekStart.setHours(0, 0, 0, 0);
    const key = weekStart.toISOString();

    const bucket = byWeek.get(key) ?? { completed: 0, skipped: 0 };
    if (session.status === "completed") {
      bucket.completed += 1;
      completedSessions += 1;
    } else {
      bucket.skipped += 1;
      skippedSessions += 1;
    }
    byWeek.set(key, bucket);

    if (activeProgram && session.programId === activeProgram.id) {
      const pb = byWeekProgram.get(key) ?? { completed: 0, skipped: 0 };
      if (session.status === "completed") {
        pb.completed += 1;
        programLinkedCompleted += 1;
      } else {
        pb.skipped += 1;
        programLinkedSkipped += 1;
      }
      byWeekProgram.set(key, pb);
    }
  }

  const consistencyPoints: ChartPoint[] = [...byWeek.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([at, b]) => {
      const total = b.completed + b.skipped;
      return {
        at,
        value: total > 0 ? Math.round((100 * b.completed) / total) : 0,
        meta: `${b.completed}/${total} sessions`,
      };
    });

  const adherencePoints: ChartPoint[] = [...byWeekProgram.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([at, b]) => {
      const total = b.completed + b.skipped;
      return {
        at,
        value: total > 0 ? Math.round((100 * b.completed) / total) : 0,
        meta: `${b.completed}/${total} program sessions`,
      };
    });

  const consistencyDenom = completedSessions + skippedSessions;
  const consistencyPct =
    consistencyDenom > 0
      ? Math.round((100 * completedSessions) / consistencyDenom)
      : null;
  const adherenceDenom = programLinkedCompleted + programLinkedSkipped;
  const programAdherencePct =
    adherenceDenom > 0
      ? Math.round((100 * programLinkedCompleted) / adherenceDenom)
      : null;

  const exerciseLabel = selected?.label ?? "selected exercise";

  return {
    units,
    rangeId,
    rangeLabel: rangeDef.label,
    exerciseId: selectedId,
    exercises: uniqueExercises,
    summaries: {
      consistencyPct,
      programAdherencePct,
      completedSessions,
      skippedSessions,
      programLinkedCompleted,
      programLinkedSkipped,
    },
    series: {
      strengthTrend: {
        id: "strength",
        title: "Strength trend",
        description: `Best logged load per day for ${exerciseLabel} (${unitLabel}).`,
        unitLabel,
        points: strengthTrendPoints,
        emptyTitle: "No strength loads in this range",
        emptyDescription:
          "Log sets with weight, or add ProgressMetric lift history, to see a strength trend.",
      },
      prTimeline: {
        id: "pr",
        title: "PR timeline",
        description:
          "New verified load highs only — Estimated 1RM values are never counted as PRs.",
        unitLabel,
        points: prTimelinePoints,
        emptyTitle: "No PRs in this range",
        emptyDescription:
          "A PR appears when a verified (or single-rep) load exceeds your previous best.",
      },
      estimated1rm: {
        id: "e1rm",
        title: "Estimated 1RM",
        description:
          "Epley estimate from multi-rep sets (2–12). Labeled Estimated — not a verified PR.",
        unitLabel,
        points: estimated1rmPoints,
        emptyTitle: "No Estimated 1RM points",
        emptyDescription:
          "Log multi-rep sets (2–12 reps) with load to calculate Estimated 1RM.",
      },
      volume: {
        id: "volume",
        title: "Volume",
        description: selected && !selected.metricKey
          ? `Weekly estimated volume for ${exerciseLabel} (${units}·reps).`
          : `Weekly estimated training volume (${units}·reps).`,
        unitLabel: `${units}·reps`,
        points: volumePoints,
        emptyTitle: "No volume in this range",
        emptyDescription:
          "Complete sets with both load and reps to build volume trends.",
      },
      bodyweight: {
        id: "bodyweight",
        title: "Bodyweight",
        description: `Logged bodyweight (${unitLabel}).`,
        unitLabel,
        points: bodyweightPoints,
        emptyTitle: "No bodyweight logs",
        emptyDescription: "Add bodyweight on your profile to track this series.",
      },
      techniqueTrend: {
        id: "technique",
        title: "Technique trend",
        description: selected && !selected.metricKey
          ? `Completed technique scores for ${exerciseLabel} (0–100).`
          : "Completed technique analysis scores (0–100).",
        unitLabel: "score",
        points: techniquePoints,
        emptyTitle: "No technique scores",
        emptyDescription:
          "Complete technique analyses with an overall score to see this trend.",
      },
      consistency: {
        id: "consistency",
        title: "Consistency",
        description:
          "Weekly % of resolved sessions completed (completed ÷ completed+skipped).",
        unitLabel: "%",
        points: consistencyPoints,
        emptyTitle: "No session consistency data",
        emptyDescription:
          "Complete or skip planned sessions to measure consistency.",
      },
      programAdherence: {
        id: "adherence",
        title: "Program adherence",
        description: activeProgram
          ? "Weekly % of active-program sessions completed vs skipped."
          : "Assign an active athlete program to measure adherence.",
        unitLabel: "%",
        points: adherencePoints,
        emptyTitle: activeProgram
          ? "No program-linked sessions"
          : "No active program",
        emptyDescription: activeProgram
          ? "Complete sessions linked to your active program to see adherence."
          : "Activate an athlete program, then train from Today.",
      },
    },
  };
}
