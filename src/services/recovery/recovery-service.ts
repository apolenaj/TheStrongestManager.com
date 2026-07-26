import { prisma } from "@/lib/db";
import { RECOVERY_DISCLAIMERS } from "@/domain/recovery/constants";
import {
  describeTrainingRelationship,
  detectPotentialIssues,
  estimateRecoveryReadiness,
  type PotentialIssue,
  type RecoveryCheckInInput,
  type TrainingRelationshipNote,
} from "@/domain/recovery/estimate";
import {
  getActiveWearableAdapter,
} from "@/domain/recovery/wearable";
import { setVolumeKg } from "@/domain/training-load/compute";
import { isHardSet } from "@/domain/training-load/compute";
import type { ChartPoint, ProgressSeries } from "@/domain/progress/ranges";

export type RecoveryEntryView = {
  id: string;
  recordedAt: string;
  sleepHours: number | null;
  sleepQuality: number | null;
  stress: number | null;
  soreness: number | null;
  motivation: number | null;
  fatigue: number | null;
  readiness: number | null;
  readinessConfidence: string | null;
  readinessInputs: string[];
  source: string;
};

export type RecoveryDashboardView = {
  disclaimers: readonly string[];
  todayEntry: RecoveryEntryView | null;
  latestEstimate: {
    score: number | null;
    confidence: string;
    explanation: string;
    sleepIncluded: boolean;
  } | null;
  potentialIssues: PotentialIssue[];
  trainingRelationship: TrainingRelationshipNote;
  readinessTrend: ProgressSeries;
  wearable: {
    status: string;
    label: string;
    note: string;
  };
  recentEntries: RecoveryEntryView[];
};

function startOfLocalDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfLocalDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function parseInputKeys(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((k): k is string => typeof k === "string")
      : [];
  } catch {
    return [];
  }
}

function mapEntry(row: {
  id: string;
  recordedAt: Date;
  sleepHours: number | null;
  sleepQuality: number | null;
  stress: number | null;
  soreness: number | null;
  motivation: number | null;
  fatigue: number | null;
  readiness: number | null;
  readinessConfidence: string | null;
  readinessInputsJson: string | null;
  source: string;
}): RecoveryEntryView {
  return {
    id: row.id,
    recordedAt: row.recordedAt.toISOString(),
    sleepHours: row.sleepHours,
    sleepQuality: row.sleepQuality,
    stress: row.stress,
    soreness: row.soreness,
    motivation: row.motivation,
    fatigue: row.fatigue,
    readiness: row.readiness,
    readinessConfidence: row.readinessConfidence,
    readinessInputs: parseInputKeys(row.readinessInputsJson),
    source: row.source,
  };
}

function parseOptionalScale(
  raw: unknown,
): number | null {
  if (raw === null || raw === undefined || raw === "") return null;
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n)) return null;
  return n;
}

export async function saveRecoveryCheckIn(input: {
  userId: string;
  sleepHours?: number | null;
  sleepQuality?: number | null;
  stress?: number | null;
  soreness?: number | null;
  motivation?: number | null;
  fatigue?: number | null;
  notes?: string | null;
}): Promise<
  | { ok: true; entryId: string; readiness: number | null }
  | { ok: false; error: string }
> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: { id: true },
  });
  if (!profile) return { ok: false, error: "Athlete profile not found." };

  const checkIn: RecoveryCheckInInput = {
    sleepHours: parseOptionalScale(input.sleepHours),
    sleepQuality: parseOptionalScale(input.sleepQuality),
    stress: parseOptionalScale(input.stress),
    soreness: parseOptionalScale(input.soreness),
    motivation: parseOptionalScale(input.motivation),
    fatigue: parseOptionalScale(input.fatigue),
  };

  // Validate scales when present
  for (const [key, value] of Object.entries(checkIn) as Array<
    [keyof RecoveryCheckInInput, number | null]
  >) {
    if (value == null) continue;
    if (key === "sleepHours") {
      if (value < 0 || value > 24) {
        return { ok: false, error: "Sleep duration must be between 0 and 24 hours." };
      }
      continue;
    }
    if (value < 1 || value > 10) {
      return { ok: false, error: `${key} must be between 1 and 10 when provided.` };
    }
  }

  const hasAny = Object.values(checkIn).some((v) => v != null);
  if (!hasAny) {
    return {
      ok: false,
      error: "Log at least one signal — empty check-ins are not saved.",
    };
  }

  const estimate = estimateRecoveryReadiness(checkIn);
  const now = new Date();
  const dayStart = startOfLocalDay(now);
  const dayEnd = endOfLocalDay(now);

  const existing = await prisma.recoveryEntry.findFirst({
    where: {
      athleteProfileId: profile.id,
      recordedAt: { gte: dayStart, lte: dayEnd },
      source: "reported",
    },
    orderBy: { recordedAt: "desc" },
  });

  const data = {
    sleepHours: checkIn.sleepHours,
    sleepQuality: checkIn.sleepQuality,
    stress: checkIn.stress,
    soreness: checkIn.soreness,
    motivation: checkIn.motivation,
    fatigue: checkIn.fatigue,
    readiness: estimate.score,
    readinessConfidence:
      estimate.confidence === "none" ? null : estimate.confidence,
    readinessInputsJson: JSON.stringify(estimate.inputKeys),
    source: "reported",
    notes: input.notes?.trim() || null,
    recordedAt: now,
  };

  const row = existing
    ? await prisma.recoveryEntry.update({
        where: { id: existing.id },
        data,
      })
    : await prisma.recoveryEntry.create({
        data: {
          athleteProfileId: profile.id,
          ...data,
        },
      });

  return { ok: true, entryId: row.id, readiness: estimate.score };
}

async function recentTrainingContext(athleteProfileId: string): Promise<{
  recentVolumeKg: number | null;
  priorVolumeKg: number | null;
  hardSetsRecent: number | null;
}> {
  const now = new Date();
  const recentFrom = new Date(now);
  recentFrom.setDate(recentFrom.getDate() - 6);
  recentFrom.setHours(0, 0, 0, 0);
  const priorFrom = new Date(now);
  priorFrom.setDate(priorFrom.getDate() - 13);
  priorFrom.setHours(0, 0, 0, 0);

  const sets = await prisma.sessionSet.findMany({
    where: {
      completedAt: { gte: priorFrom },
      sessionExercise: {
        trainingSession: {
          athleteProfileId,
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
    },
  });

  let recentVolume = 0;
  let priorVolume = 0;
  let hardSetsRecent = 0;
  let recentHas = false;
  let priorHas = false;

  for (const set of sets) {
    if (!set.completedAt) continue;
    const vol = setVolumeKg(set);
    const inRecent = set.completedAt >= recentFrom;
    if (inRecent) {
      if (vol != null) {
        recentVolume += vol;
        recentHas = true;
      }
      if (isHardSet(set)) hardSetsRecent += 1;
    } else {
      if (vol != null) {
        priorVolume += vol;
        priorHas = true;
      }
    }
  }

  return {
    recentVolumeKg: recentHas ? recentVolume : null,
    priorVolumeKg: priorHas ? priorVolume : null,
    hardSetsRecent: recentHas ? hardSetsRecent : null,
  };
}

export async function getRecoveryDashboard(
  userId: string,
): Promise<RecoveryDashboardView | null> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return null;

  const since = new Date();
  since.setDate(since.getDate() - 28);

  const entries = await prisma.recoveryEntry.findMany({
    where: {
      athleteProfileId: profile.id,
      recordedAt: { gte: since },
    },
    orderBy: { recordedAt: "desc" },
    take: 40,
  });

  const mapped = entries.map(mapEntry);
  const todayStart = startOfLocalDay(new Date());
  const todayEntry =
    mapped.find((e) => new Date(e.recordedAt) >= todayStart) ?? null;

  const latest = mapped[0] ?? null;
  const latestEstimate = latest
    ? {
        score: latest.readiness,
        confidence: latest.readinessConfidence ?? "low",
        explanation: latest.readiness != null
          ? `Latest Recovery Readiness estimate ${latest.readiness}/100 (${latest.readinessConfidence ?? "low"} confidence). Not medical accuracy.`
          : "Latest check-in did not produce a readiness estimate.",
        sleepIncluded: latest.readinessInputs.some((k) =>
          k.toLowerCase().includes("sleep"),
        ),
      }
    : null;

  const checkInForIssues: RecoveryCheckInInput & {
    readinessScore: number | null;
  } = {
    sleepHours: latest?.sleepHours ?? null,
    sleepQuality: latest?.sleepQuality ?? null,
    stress: latest?.stress ?? null,
    soreness: latest?.soreness ?? null,
    motivation: latest?.motivation ?? null,
    fatigue: latest?.fatigue ?? null,
    readinessScore: latest?.readiness ?? null,
  };

  const potentialIssues = latest
    ? detectPotentialIssues(checkInForIssues)
    : [
        {
          id: "no_checkin",
          severity: "info" as const,
          title: "No recent check-in",
          detail:
            "Complete today’s optional check-in (under ~30 seconds) to estimate Recovery Readiness.",
        },
      ];

  const training = await recentTrainingContext(profile.id);
  const trainingRelationship = describeTrainingRelationship({
    readinessScore: latest?.readiness ?? null,
    ...training,
  });

  const trendPoints: ChartPoint[] = [...mapped]
    .reverse()
    .filter((e) => e.readiness != null)
    .map((e) => ({
      at: e.recordedAt,
      value: e.readiness as number,
      meta: e.readinessConfidence
        ? `Estimate · ${e.readinessConfidence} confidence`
        : "Estimate",
    }));

  // Ensure wearable layer is queried (returns empty — never fabricates sleep)
  const wearable = getActiveWearableAdapter();
  await wearable.fetchRecentSleep({
    athleteProfileId: profile.id,
    since,
  });

  return {
    disclaimers: RECOVERY_DISCLAIMERS,
    todayEntry,
    latestEstimate,
    potentialIssues,
    trainingRelationship,
    readinessTrend: {
      id: "recovery-readiness",
      title: "Recovery Readiness trend",
      description:
        "Estimated readiness from your check-ins (0–100). Gaps mean no estimate that day — sleep is never filled in.",
      unitLabel: "score",
      points: trendPoints,
      emptyTitle: "No readiness trend yet",
      emptyDescription:
        "Save a daily check-in with at least one signal to start this chart.",
    },
    wearable: {
      status: wearable.status,
      label: wearable.label,
      note:
        wearable.status === "unavailable"
          ? "Wearable adapters (Apple Health, Health Connect, Garmin, Whoop, Oura) are architected — no device is connected and sleep is never invented."
          : `Active adapter: ${wearable.label} (${wearable.status}).`,
    },
    recentEntries: mapped.slice(0, 14),
  };
}
