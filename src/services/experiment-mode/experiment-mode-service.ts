/**
 * Experiment Mode service — personal training experiments (Prompt 119).
 */

import { prisma } from "@/lib/db";
import { featureFlags } from "@/config/feature-flags";
import { normalizeMassUnit } from "@/services/units/convert";
import {
  EXPERIMENT_MODE_ENGINE_VERSION,
  EXPERIMENT_STATUSES,
  baselineWindow,
  buildExperimentSnapshot,
  compareExperimentSnapshots,
  experimentWindow,
  parseMeasuresJson,
  parseSnapshotJson,
  validateCreateExperimentInput,
  type CreateExperimentInput,
  type ExperimentSignalBag,
  type ExperimentSnapshot,
  type ExperimentStatus,
  type PersonalTrainingExperimentView,
} from "@/domain/experiment-mode";

function isStatus(raw: string): raw is ExperimentStatus {
  return (EXPERIMENT_STATUSES as readonly string[]).includes(raw);
}

async function gatherSignals(input: {
  athleteProfileId: string;
  windowStart: Date;
  windowEnd: Date;
}): Promise<ExperimentSignalBag> {
  const sessions = await prisma.trainingSession.findMany({
    where: {
      athleteProfileId: input.athleteProfileId,
      status: "completed",
      completedAt: { gte: input.windowStart, lte: input.windowEnd },
    },
    include: {
      sessionExercises: {
        include: {
          sessionSets: true,
          exercise: { select: { slug: true, name: true } },
        },
      },
    },
  });

  let volumeKg = 0;
  let volumeSetCount = 0;
  let deadliftBestKg: number | null = null;
  let squatBestKg: number | null = null;
  let benchBestKg: number | null = null;

  for (const session of sessions) {
    for (const line of session.sessionExercises) {
      const name =
        `${line.exercise?.slug ?? ""} ${line.exerciseNameSnapshot} ${line.exercise?.name ?? ""}`.toLowerCase();
      for (const set of line.sessionSets) {
        const load = set.performedLoadKg ?? set.prescribedLoadKg;
        const reps = set.performedReps ?? set.prescribedReps;
        if (load != null && reps != null) {
          volumeKg += load * reps;
          volumeSetCount += 1;
        }
        if (load == null) continue;
        if (/deadlift/.test(name)) {
          deadliftBestKg =
            deadliftBestKg == null ? load : Math.max(deadliftBestKg, load);
        }
        if (/squat/.test(name) && !/leg.?press/.test(name)) {
          squatBestKg = squatBestKg == null ? load : Math.max(squatBestKg, load);
        }
        if (/bench/.test(name)) {
          benchBestKg = benchBestKg == null ? load : Math.max(benchBestKg, load);
        }
      }
    }
  }

  const metrics = await prisma.progressMetric.findMany({
    where: {
      athleteProfileId: input.athleteProfileId,
      recordedAt: { gte: input.windowStart, lte: input.windowEnd },
      metricKey: {
        in: ["e1rm_deadlift", "e1rm_squat", "e1rm_bench", "deadlift", "squat", "bench"],
      },
    },
    orderBy: { recordedAt: "desc" },
  });

  for (const m of metrics) {
    const key = m.metricKey.toLowerCase();
    if (key.includes("deadlift") && (deadliftBestKg == null || m.value > deadliftBestKg)) {
      deadliftBestKg = m.value;
    }
    if (key.includes("squat") && (squatBestKg == null || m.value > squatBestKg)) {
      squatBestKg = m.value;
    }
    if (key.includes("bench") && (benchBestKg == null || m.value > benchBestKg)) {
      benchBestKg = m.value;
    }
  }

  const techniques = await prisma.techniqueAnalysis.findMany({
    where: {
      athleteProfileId: input.athleteProfileId,
      status: "completed",
      overallScore: { not: null },
      createdAt: { gte: input.windowStart, lte: input.windowEnd },
    },
    select: { overallScore: true },
  });

  const techniqueScores = techniques
    .map((t) => t.overallScore)
    .filter((n): n is number => n != null);
  const techniqueAvg =
    techniqueScores.length > 0
      ? techniqueScores.reduce((a, b) => a + b, 0) / techniqueScores.length
      : null;

  return {
    completedSessions: sessions.length,
    volumeKg: volumeSetCount > 0 ? volumeKg : null,
    volumeSetCount,
    deadliftBestKg,
    squatBestKg,
    benchBestKg,
    techniqueAvg,
    techniqueCount: techniqueScores.length,
  };
}

function toView(row: {
  id: string;
  title: string;
  intervention: string;
  hypothesis: string;
  measuresJson: string;
  durationWeeks: number;
  status: string;
  plannedStartAt: Date | null;
  startedAt: Date | null;
  endedAt: Date | null;
  abandonedAt: Date | null;
  athleteNotes: string | null;
  baselineSnapshotJson: string;
  outcomeSnapshotJson: string;
  createdAt: Date;
  updatedAt: Date;
}): PersonalTrainingExperimentView {
  const measures = parseMeasuresJson(row.measuresJson);
  const baseline = parseSnapshotJson(row.baselineSnapshotJson);
  const outcome = parseSnapshotJson(row.outcomeSnapshotJson);
  const status = isStatus(row.status) ? row.status : "planned";
  const compare =
    baseline && outcome
      ? compareExperimentSnapshots({ measures, baseline, outcome })
      : null;

  return {
    id: row.id,
    title: row.title,
    intervention: row.intervention,
    hypothesis: row.hypothesis,
    measures,
    durationWeeks: row.durationWeeks,
    status,
    plannedStartAt: row.plannedStartAt?.toISOString() ?? null,
    startedAt: row.startedAt?.toISOString() ?? null,
    endedAt: row.endedAt?.toISOString() ?? null,
    abandonedAt: row.abandonedAt?.toISOString() ?? null,
    athleteNotes: row.athleteNotes,
    baseline,
    outcome,
    compare,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listPersonalTrainingExperiments(
  athleteProfileId: string,
): Promise<
  | { ok: true; experiments: PersonalTrainingExperimentView[] }
  | { ok: false; error: string }
> {
  if (!featureFlags.experimentMode) {
    return { ok: false, error: "Experiment Mode is not enabled." };
  }

  const rows = await prisma.personalTrainingExperiment.findMany({
    where: { athleteProfileId },
    orderBy: { updatedAt: "desc" },
  });

  return { ok: true, experiments: rows.map(toView) };
}

export async function getPersonalTrainingExperiment(input: {
  id: string;
  athleteProfileId: string;
}): Promise<
  | { ok: true; experiment: PersonalTrainingExperimentView }
  | { ok: false; error: string }
> {
  if (!featureFlags.experimentMode) {
    return { ok: false, error: "Experiment Mode is not enabled." };
  }

  const row = await prisma.personalTrainingExperiment.findFirst({
    where: { id: input.id, athleteProfileId: input.athleteProfileId },
  });
  if (!row) return { ok: false, error: "Experiment not found." };
  return { ok: true, experiment: toView(row) };
}

export async function createPersonalTrainingExperiment(input: {
  athleteProfileId: string;
  draft: Partial<CreateExperimentInput> & { measures?: string[] };
}): Promise<
  | { ok: true; experiment: PersonalTrainingExperimentView }
  | { ok: false; error: string }
> {
  if (!featureFlags.experimentMode) {
    return { ok: false, error: "Experiment Mode is not enabled." };
  }

  const validated = validateCreateExperimentInput(input.draft);
  if (!validated.ok) return validated;

  const plannedStartAt = validated.value.plannedStartAt
    ? new Date(validated.value.plannedStartAt)
    : null;

  const row = await prisma.personalTrainingExperiment.create({
    data: {
      athleteProfileId: input.athleteProfileId,
      title: validated.value.title,
      intervention: validated.value.intervention,
      hypothesis: validated.value.hypothesis,
      measuresJson: JSON.stringify(validated.value.measures),
      durationWeeks: validated.value.durationWeeks,
      status: "planned",
      plannedStartAt:
        plannedStartAt && !Number.isNaN(plannedStartAt.getTime())
          ? plannedStartAt
          : null,
      athleteNotes: validated.value.athleteNotes,
      engineVersion: EXPERIMENT_MODE_ENGINE_VERSION,
    },
  });

  return { ok: true, experiment: toView(row) };
}

async function captureSnapshot(input: {
  athleteProfileId: string;
  measures: ReturnType<typeof parseMeasuresJson>;
  windowStart: Date;
  windowEnd: Date;
  unitsLabel: string;
}): Promise<ExperimentSnapshot> {
  const signals = await gatherSignals({
    athleteProfileId: input.athleteProfileId,
    windowStart: input.windowStart,
    windowEnd: input.windowEnd,
  });
  return buildExperimentSnapshot({
    measures: input.measures,
    windowStart: input.windowStart,
    windowEnd: input.windowEnd,
    signals,
    unitsLabel: input.unitsLabel,
  });
}

export async function startPersonalTrainingExperiment(input: {
  id: string;
  athleteProfileId: string;
}): Promise<
  | { ok: true; experiment: PersonalTrainingExperimentView }
  | { ok: false; error: string }
> {
  if (!featureFlags.experimentMode) {
    return { ok: false, error: "Experiment Mode is not enabled." };
  }

  const row = await prisma.personalTrainingExperiment.findFirst({
    where: { id: input.id, athleteProfileId: input.athleteProfileId },
  });
  if (!row) return { ok: false, error: "Experiment not found." };
  if (row.status !== "planned") {
    return { ok: false, error: "Only planned experiments can be started." };
  }

  const active = await prisma.personalTrainingExperiment.findFirst({
    where: { athleteProfileId: input.athleteProfileId, status: "active" },
  });
  if (active) {
    return {
      ok: false,
      error: "Finish or abandon your active experiment before starting another.",
    };
  }

  const profile = await prisma.athleteProfile.findUnique({
    where: { id: input.athleteProfileId },
    select: { units: true },
  });
  const unitsLabel = normalizeMassUnit(profile?.units ?? "kg");
  const measures = parseMeasuresJson(row.measuresJson);
  const startedAt = new Date();
  const baselineWin = baselineWindow({
    startedAt,
    durationWeeks: row.durationWeeks,
  });
  const baseline = await captureSnapshot({
    athleteProfileId: input.athleteProfileId,
    measures,
    windowStart: baselineWin.windowStart,
    windowEnd: baselineWin.windowEnd,
    unitsLabel,
  });

  const updated = await prisma.personalTrainingExperiment.update({
    where: { id: row.id },
    data: {
      status: "active",
      startedAt,
      baselineSnapshotJson: JSON.stringify(baseline),
    },
  });

  return { ok: true, experiment: toView(updated) };
}

export async function completePersonalTrainingExperiment(input: {
  id: string;
  athleteProfileId: string;
}): Promise<
  | { ok: true; experiment: PersonalTrainingExperimentView }
  | { ok: false; error: string }
> {
  if (!featureFlags.experimentMode) {
    return { ok: false, error: "Experiment Mode is not enabled." };
  }

  const row = await prisma.personalTrainingExperiment.findFirst({
    where: { id: input.id, athleteProfileId: input.athleteProfileId },
  });
  if (!row) return { ok: false, error: "Experiment not found." };
  if (row.status !== "active" || !row.startedAt) {
    return { ok: false, error: "Only active experiments can be completed." };
  }

  const profile = await prisma.athleteProfile.findUnique({
    where: { id: input.athleteProfileId },
    select: { units: true },
  });
  const unitsLabel = normalizeMassUnit(profile?.units ?? "kg");
  const measures = parseMeasuresJson(row.measuresJson);
  const endedAt = new Date();
  const win = experimentWindow({
    startedAt: row.startedAt,
    durationWeeks: row.durationWeeks,
  });
  // Cap outcome window at now if finishing early
  const windowEnd = endedAt < win.windowEnd ? endedAt : win.windowEnd;
  const outcome = await captureSnapshot({
    athleteProfileId: input.athleteProfileId,
    measures,
    windowStart: win.windowStart,
    windowEnd,
    unitsLabel,
  });

  const updated = await prisma.personalTrainingExperiment.update({
    where: { id: row.id },
    data: {
      status: "completed",
      endedAt,
      outcomeSnapshotJson: JSON.stringify(outcome),
    },
  });

  return { ok: true, experiment: toView(updated) };
}

export async function abandonPersonalTrainingExperiment(input: {
  id: string;
  athleteProfileId: string;
}): Promise<
  | { ok: true; experiment: PersonalTrainingExperimentView }
  | { ok: false; error: string }
> {
  if (!featureFlags.experimentMode) {
    return { ok: false, error: "Experiment Mode is not enabled." };
  }

  const row = await prisma.personalTrainingExperiment.findFirst({
    where: { id: input.id, athleteProfileId: input.athleteProfileId },
  });
  if (!row) return { ok: false, error: "Experiment not found." };
  if (row.status !== "planned" && row.status !== "active") {
    return { ok: false, error: "This experiment cannot be abandoned." };
  }

  const abandonedAt = new Date();
  let outcomeJson = row.outcomeSnapshotJson;

  if (row.status === "active" && row.startedAt) {
    const profile = await prisma.athleteProfile.findUnique({
      where: { id: input.athleteProfileId },
      select: { units: true },
    });
    const unitsLabel = normalizeMassUnit(profile?.units ?? "kg");
    const measures = parseMeasuresJson(row.measuresJson);
    const win = experimentWindow({
      startedAt: row.startedAt,
      durationWeeks: row.durationWeeks,
    });
    const outcome = await captureSnapshot({
      athleteProfileId: input.athleteProfileId,
      measures,
      windowStart: win.windowStart,
      windowEnd: abandonedAt < win.windowEnd ? abandonedAt : win.windowEnd,
      unitsLabel,
    });
    outcomeJson = JSON.stringify(outcome);
  }

  const updated = await prisma.personalTrainingExperiment.update({
    where: { id: row.id },
    data: {
      status: "abandoned",
      abandonedAt,
      endedAt: abandonedAt,
      outcomeSnapshotJson: outcomeJson,
    },
  });

  return { ok: true, experiment: toView(updated) };
}
