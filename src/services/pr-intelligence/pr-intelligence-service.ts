import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import {
  detectPrEvents,
  PR_INTEL_LOOKBACK_DAYS,
  toSharePayload,
  type PrEvent,
  type PrSharePayload,
  type PrTimeline,
  type StrengthSample,
  type TechniqueSample,
} from "@/domain/pr-intelligence";

export type PrIntelligenceView = {
  profileId: string;
  timeline: PrTimeline;
};

const SLUGS = ["back-squat", "bench-press", "deadlift", "overhead-press"] as const;

function newToken(): string {
  return randomBytes(16).toString("hex");
}

/**
 * Build PR intelligence timeline from sets, progress metrics, and technique.
 */
export async function getPrIntelligence(
  userId: string,
): Promise<PrIntelligenceView | null> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return null;

  const now = new Date();
  const since = new Date(
    now.getTime() - PR_INTEL_LOOKBACK_DAYS * 24 * 60 * 60 * 1000,
  );

  const [sets, techniqueRows, progressRows] = await Promise.all([
    prisma.sessionSet.findMany({
      where: {
        completedAt: { gte: since },
        performedLoadKg: { not: null },
        performedReps: { not: null },
        setType: { in: ["work", "amrap"] },
        sessionExercise: {
          exercise: { slug: { in: [...SLUGS] } },
          trainingSession: {
            athleteProfileId: profile.id,
            status: "completed",
          },
        },
      },
      orderBy: { completedAt: "asc" },
      select: {
        id: true,
        performedLoadKg: true,
        performedReps: true,
        completedAt: true,
        sessionExercise: {
          select: {
            exercise: { select: { slug: true, name: true } },
          },
        },
      },
    }),
    prisma.techniqueAnalysis.findMany({
      where: {
        athleteProfileId: profile.id,
        deletedAt: null,
        status: "completed",
        overallScore: { not: null },
        createdAt: { gte: since },
        exerciseId: { not: null },
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        overallScore: true,
        createdAt: true,
        exercise: { select: { slug: true, name: true } },
      },
    }),
    prisma.progressMetric.findMany({
      where: {
        athleteProfileId: profile.id,
        metricKey: {
          in: [
            "lift_squat",
            "lift_bench",
            "lift_deadlift",
            "lift_press",
          ],
        },
        recordedAt: { gte: since },
      },
      orderBy: { recordedAt: "asc" },
      select: {
        id: true,
        metricKey: true,
        value: true,
        unit: true,
        reps: true,
        recordedAt: true,
      },
    }),
  ]);

  const strength: StrengthSample[] = [];

  for (const row of sets) {
    const ex = row.sessionExercise.exercise;
    if (
      !ex ||
      row.completedAt == null ||
      row.performedLoadKg == null ||
      row.performedReps == null
    ) {
      continue;
    }
    strength.push({
      id: row.id,
      at: row.completedAt,
      exerciseKey: ex.slug,
      exerciseLabel: ex.name || ex.slug,
      loadKg: row.performedLoadKg,
      reps: row.performedReps,
    });
  }

  const metricKeyToSlug: Record<string, { key: string; label: string }> = {
    lift_squat: { key: "back-squat", label: "Back squat" },
    lift_bench: { key: "bench-press", label: "Bench press" },
    lift_deadlift: { key: "deadlift", label: "Deadlift" },
    lift_press: { key: "overhead-press", label: "Overhead press" },
  };

  for (const row of progressRows) {
    const map = metricKeyToSlug[row.metricKey];
    if (!map) continue;
    let kg = row.value;
    if (row.unit === "lb" || row.unit === "lbs") kg = row.value * 0.45359237;
    strength.push({
      id: `pm_${row.id}`,
      at: row.recordedAt,
      exerciseKey: map.key,
      exerciseLabel: map.label,
      loadKg: kg,
      reps: row.reps ?? 1,
    });
  }

  const technique: TechniqueSample[] = [];
  for (const row of techniqueRows) {
    if (row.overallScore == null || !row.exercise) continue;
    technique.push({
      id: row.id,
      at: row.createdAt,
      exerciseKey: row.exercise.slug,
      exerciseLabel: row.exercise.name || row.exercise.slug,
      overallScore: row.overallScore,
    });
  }

  return {
    profileId: profile.id,
    timeline: detectPrEvents(strength, technique, now),
  };
}

export async function createPrShare(
  userId: string,
  event: PrEvent,
  options?: {
    shareCard?: NonNullable<PrSharePayload["shareCard"]>;
  },
): Promise<{ ok: true; token: string; path: string } | { ok: false; error: string }> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return { ok: false, error: "No athlete profile." };

  const payload = toSharePayload(event, options?.shareCard);
  const token = newToken();
  await prisma.prShare.create({
    data: {
      athleteProfileId: profile.id,
      token,
      payloadJson: JSON.stringify(payload),
    },
  });

  return { ok: true, token, path: `/share/pr/${token}` };
}

export async function getPrShareByToken(
  token: string,
): Promise<{ payload: PrSharePayload; createdAt: string } | null> {
  if (!token || token.length < 16) return null;
  const row = await prisma.prShare.findUnique({
    where: { token },
    select: { payloadJson: true, createdAt: true, expiresAt: true },
  });
  if (!row) return null;
  if (row.expiresAt && row.expiresAt.getTime() < Date.now()) return null;

  try {
    const payload = JSON.parse(row.payloadJson) as PrSharePayload;
    if (!payload?.headline || !payload?.title) return null;
    return { payload, createdAt: row.createdAt.toISOString() };
  } catch {
    return null;
  }
}
