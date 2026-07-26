import {
  assemblePerformanceStory,
  buildPerformanceStorySharePayload,
  buildPerformanceStorySnapshot,
  type PerformanceStory,
  type PerformanceStorySharePayload,
  type PerformanceStorySnapshot,
  type StoryMonthSignals,
} from "@/domain/performance-story";
import { prisma } from "@/lib/db";
import { MAJOR_LIFTS } from "@/services/onboarding/options";
import {
  normalizeMassUnit,
  toCanonicalKg,
} from "@/services/units/convert";
import { featureFlags } from "@/config/feature-flags";
import { randomBytes } from "crypto";

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

function yearBounds(year: number): { start: Date; end: Date } {
  return {
    start: new Date(Date.UTC(year, 0, 1)),
    end: new Date(Date.UTC(year + 1, 0, 1)),
  };
}

function monthBounds(year: number, month: number): { start: Date; end: Date } {
  return {
    start: new Date(Date.UTC(year, month - 1, 1)),
    end: new Date(Date.UTC(year, month, 1)),
  };
}

async function gatherYearMonthSignals(
  athleteProfileId: string,
  year: number,
): Promise<StoryMonthSignals[]> {
  const { start: yearStart, end: yearEnd } = yearBounds(year);

  const [sessions, sets, techniqueRows, bodyRows, progressRows] =
    await Promise.all([
      prisma.trainingSession.findMany({
        where: {
          athleteProfileId,
          status: "completed",
          completedAt: { gte: yearStart, lt: yearEnd },
        },
        select: { completedAt: true },
      }),
      prisma.sessionSet.findMany({
        where: {
          completedAt: { gte: yearStart, lt: yearEnd },
          performedLoadKg: { not: null },
          setType: { in: ["work", "amrap"] },
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
          sessionExercise: {
            select: {
              exerciseNameSnapshot: true,
              exercise: { select: { name: true, slug: true } },
            },
          },
        },
      }),
      prisma.techniqueAnalysis.findMany({
        where: {
          athleteProfileId,
          status: "completed",
          overallScore: { not: null },
          createdAt: { gte: yearStart, lt: yearEnd },
        },
        select: { createdAt: true, overallScore: true },
      }),
      prisma.bodyMetric.findMany({
        where: {
          athleteProfileId,
          metricKey: "bodyweight",
          recordedAt: { gte: yearStart, lt: yearEnd },
        },
        orderBy: { recordedAt: "asc" },
        select: { recordedAt: true, value: true, unit: true },
      }),
      prisma.progressMetric.findMany({
        where: {
          athleteProfileId,
          metricKey: { in: LIFT_KEYS },
          recordedAt: { gte: yearStart, lt: yearEnd },
        },
        select: {
          recordedAt: true,
          metricKey: true,
          value: true,
          unit: true,
        },
      }),
    ]);

  const months: StoryMonthSignals[] = [];

  for (let month = 1; month <= 12; month++) {
    const { start, end } = monthBounds(year, month);
    const inMonth = (d: Date | null) =>
      d != null && d >= start && d < end;

    const completedSessions = sessions.filter((s) =>
      inMonth(s.completedAt),
    ).length;

    const peaks = new Map<string, { label: string; kg: number }>();

    for (const row of progressRows) {
      if (!inMonth(row.recordedAt)) continue;
      const kg = toCanonicalKg(row.value, row.unit ?? "kg");
      if (!(kg > 0)) continue;
      const label = LIFT_LABEL[row.metricKey] ?? row.metricKey;
      const prev = peaks.get(row.metricKey);
      if (!prev || kg > prev.kg) {
        peaks.set(row.metricKey, { label, kg });
      }
    }

    for (const set of sets) {
      if (!inMonth(set.completedAt)) continue;
      const kg = set.performedLoadKg;
      if (kg == null || !(kg > 0)) continue;
      const name =
        set.sessionExercise.exerciseNameSnapshot ||
        set.sessionExercise.exercise.name;
      const label = guessLiftLabel(name);
      if (!label) continue;
      const key = label.toLowerCase();
      const prev = peaks.get(key);
      if (!prev || kg > prev.kg) peaks.set(key, { label, kg });
    }

    const techScores = techniqueRows
      .filter((t) => inMonth(t.createdAt) && t.overallScore != null)
      .map((t) => t.overallScore as number);
    const techniqueAvg =
      techScores.length > 0
        ? techScores.reduce((a, b) => a + b, 0) / techScores.length
        : null;

    const priorMonth = month === 1 ? 12 : month - 1;
    const priorYear = month === 1 ? year - 1 : year;
    const priorBounds = monthBounds(priorYear, priorMonth);
    // Prior technique only from rows we already loaded if same year; else skip
    let techniqueAvgPrior: number | null = null;
    if (priorYear === year) {
      const priorScores = techniqueRows
        .filter(
          (t) =>
            t.createdAt >= priorBounds.start &&
            t.createdAt < priorBounds.end &&
            t.overallScore != null,
        )
        .map((t) => t.overallScore as number);
      techniqueAvgPrior =
        priorScores.length > 0
          ? priorScores.reduce((a, b) => a + b, 0) / priorScores.length
          : null;
    }

    const bwMonth = bodyRows.filter((b) => inMonth(b.recordedAt));
    const bodyweightStartKg =
      bwMonth.length > 0
        ? toCanonicalKg(bwMonth[0]!.value, bwMonth[0]!.unit)
        : null;
    const bodyweightEndKg =
      bwMonth.length > 0
        ? toCanonicalKg(
            bwMonth[bwMonth.length - 1]!.value,
            bwMonth[bwMonth.length - 1]!.unit,
          )
        : null;

    months.push({
      month,
      year,
      liftPeaks: [...peaks.entries()].map(([liftKey, v]) => ({
        liftKey,
        liftLabel: v.label,
        bestLoadKg: v.kg,
      })),
      techniqueAvg,
      techniqueAvgPrior,
      bodyweightStartKg,
      bodyweightEndKg,
      completedSessions,
    });
  }

  return months;
}

export type PerformanceStoryView = {
  athleteProfileId: string;
  athleteDisplayName: string;
  story: PerformanceStory;
  sharePath: string | null;
};

export async function getPerformanceStory(input: {
  userId: string;
  year?: number;
}): Promise<PerformanceStoryView | null> {
  if (!featureFlags.performanceStory) return null;

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: {
      id: true,
      displayName: true,
      units: true,
      user: { select: { name: true } },
    },
  });
  if (!profile) return null;

  const year = input.year ?? new Date().getUTCFullYear();
  const units = normalizeMassUnit(profile.units);
  const months = await gatherYearMonthSignals(profile.id, year);
  const story = assemblePerformanceStory({ year, months, units });

  const latestShare = await prisma.performanceStoryShare.findFirst({
    where: { athleteProfileId: profile.id, yearKey: String(year) },
    orderBy: { createdAt: "desc" },
    select: { token: true },
  });

  return {
    athleteProfileId: profile.id,
    athleteDisplayName:
      profile.displayName?.trim() ||
      profile.user.name?.trim() ||
      "Athlete",
    story,
    sharePath: latestShare ? `/share/story/${latestShare.token}` : null,
  };
}

export async function createPerformanceStoryShare(input: {
  userId: string;
  year?: number;
}): Promise<
  { ok: true; token: string; path: string } | { ok: false; error: string }
> {
  if (!featureFlags.performanceStory) {
    return { ok: false, error: "Performance Story is not enabled." };
  }

  const view = await getPerformanceStory({
    userId: input.userId,
    year: input.year,
  });
  if (!view) {
    return { ok: false, error: "Could not build performance story." };
  }

  const payload = buildPerformanceStorySharePayload({
    story: view.story,
    athleteDisplayName: view.athleteDisplayName,
  });

  const token = randomBytes(16).toString("hex");
  await prisma.performanceStoryShare.create({
    data: {
      athleteProfileId: view.athleteProfileId,
      yearKey: view.story.yearKey,
      token,
      payloadJson: JSON.stringify(payload),
    },
  });

  return { ok: true, token, path: `/share/story/${token}` };
}

export async function getPerformanceStoryShareByToken(
  token: string,
): Promise<PerformanceStorySharePayload | null> {
  const row = await prisma.performanceStoryShare.findUnique({
    where: { token },
  });
  if (!row) return null;
  if (row.expiresAt && row.expiresAt.getTime() < Date.now()) return null;
  try {
    return JSON.parse(row.payloadJson) as PerformanceStorySharePayload;
  } catch {
    return null;
  }
}

export function getPerformanceStoryAdminSnapshot(): PerformanceStorySnapshot {
  return buildPerformanceStorySnapshot();
}
