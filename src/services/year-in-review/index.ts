import { randomBytes } from "crypto";
import { featureFlags } from "@/config/feature-flags";
import {
  assembleYearInReview,
  buildYearInReviewSharePayload,
  buildYearInReviewSnapshot,
  type YearInReviewReport,
  type YearInReviewSharePayload,
  type YearInReviewSnapshot,
  type YearInReviewSignals,
} from "@/domain/year-in-review";
import { prisma } from "@/lib/db";
import { getPrIntelligence } from "@/services/pr-intelligence";

function yearBounds(year: number): { start: Date; end: Date } {
  return {
    start: new Date(Date.UTC(year, 0, 1)),
    end: new Date(Date.UTC(year + 1, 0, 1)),
  };
}

async function gatherSignals(input: {
  athleteProfileId: string;
  year: number;
  athleteDisplayName: string;
  userId: string;
}): Promise<YearInReviewSignals> {
  const { start, end } = yearBounds(input.year);

  const [sessions, sets, technique, competitions] = await Promise.all([
    prisma.trainingSession.findMany({
      where: {
        athleteProfileId: input.athleteProfileId,
        status: "completed",
        completedAt: { gte: start, lt: end },
      },
      select: { completedAt: true },
    }),
    prisma.sessionSet.findMany({
      where: {
        completedAt: { gte: start, lt: end },
        setType: { in: ["work", "amrap"] },
        sessionExercise: {
          trainingSession: {
            athleteProfileId: input.athleteProfileId,
            status: "completed",
          },
        },
      },
      select: {
        sessionExercise: {
          select: {
            exerciseId: true,
            exerciseNameSnapshot: true,
            exercise: { select: { name: true, slug: true } },
          },
        },
      },
    }),
    prisma.techniqueAnalysis.findMany({
      where: {
        athleteProfileId: input.athleteProfileId,
        status: "completed",
        overallScore: { not: null },
        createdAt: { gte: start, lt: end },
      },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true, overallScore: true },
    }),
    prisma.competitionPrep.findMany({
      where: {
        athleteProfileId: input.athleteProfileId,
        competitionDate: { gte: start, lt: end },
      },
      orderBy: { competitionDate: "asc" },
      select: {
        id: true,
        name: true,
        sport: true,
        competitionDate: true,
        status: true,
        weightClassLabel: true,
      },
    }),
  ]);

  const sessionsByMonth = Array.from({ length: 12 }, () => 0);
  for (const s of sessions) {
    if (!s.completedAt) continue;
    sessionsByMonth[s.completedAt.getUTCMonth()]! += 1;
  }

  const exerciseCounts = new Map<
    string,
    { label: string; setCount: number }
  >();
  for (const set of sets) {
    const key =
      set.sessionExercise.exercise.slug || set.sessionExercise.exerciseId;
    const label =
      set.sessionExercise.exerciseNameSnapshot?.trim() ||
      set.sessionExercise.exercise.name;
    const prev = exerciseCounts.get(key) ?? { label, setCount: 0 };
    prev.setCount += 1;
    exerciseCounts.set(key, prev);
  }
  const topExercises = [...exerciseCounts.entries()]
    .map(([exerciseKey, v]) => ({
      exerciseKey,
      exerciseLabel: v.label,
      setCount: v.setCount,
    }))
    .sort((a, b) => b.setCount - a.setCount)
    .slice(0, 5);

  const scores = technique
    .map((t) => t.overallScore)
    .filter((n): n is number => n != null);
  const techniqueFirstAvg = scores.length >= 1 ? scores[0]! : null;
  const techniqueLastAvg =
    scores.length >= 2 ? scores[scores.length - 1]! : scores[0] ?? null;

  let prCount = 0;
  let prHighlights: YearInReviewSignals["prHighlights"] = [];
  if (featureFlags.prIntelligence) {
    const intel = await getPrIntelligence(input.userId);
    const yearEvents =
      intel?.timeline.events.filter((e) => {
        const y = new Date(e.at).getUTCFullYear();
        return y === input.year;
      }) ?? [];
    prCount = yearEvents.length;
    prHighlights = yearEvents.slice(0, 5).map((e) => ({
      id: e.id,
      title: e.exerciseLabel || e.headline,
      detail: e.headline,
    }));
  }

  return {
    year: input.year,
    athleteDisplayName: input.athleteDisplayName,
    completedSessions: sessions.length,
    sessionsByMonth,
    prCount,
    prHighlights,
    techniqueFirstAvg,
    techniqueLastAvg:
      scores.length >= 2 ? techniqueLastAvg : techniqueFirstAvg,
    techniqueSampleCount: technique.length,
    topExercises,
    competitions: competitions.map((c) => ({
      id: c.id,
      name: c.name?.trim() || `${c.sport} meet`,
      sport: c.sport,
      dateLabel: c.competitionDate.toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }),
      status: c.status,
      weightClassLabel: c.weightClassLabel,
    })),
  };
}

export type YearInReviewView = {
  athleteProfileId: string;
  report: YearInReviewReport;
  sharePath: string | null;
};

export async function getYearInReview(input: {
  userId: string;
  year?: number;
}): Promise<YearInReviewView | null> {
  if (!featureFlags.yearInReview) return null;

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: {
      id: true,
      displayName: true,
      user: { select: { name: true } },
    },
  });
  if (!profile) return null;

  const year = input.year ?? new Date().getUTCFullYear();
  const athleteDisplayName =
    profile.displayName?.trim() ||
    profile.user.name?.trim() ||
    "Athlete";

  const signals = await gatherSignals({
    athleteProfileId: profile.id,
    year,
    athleteDisplayName,
    userId: input.userId,
  });

  const report = assembleYearInReview(signals);

  const latestShare = await prisma.yearInReviewShare.findFirst({
    where: { athleteProfileId: profile.id, yearKey: String(year) },
    orderBy: { createdAt: "desc" },
    select: { token: true },
  });

  return {
    athleteProfileId: profile.id,
    report,
    sharePath: latestShare ? `/share/year/${latestShare.token}` : null,
  };
}

export async function createYearInReviewShare(input: {
  userId: string;
  year?: number;
}): Promise<
  { ok: true; token: string; path: string } | { ok: false; error: string }
> {
  if (!featureFlags.yearInReview) {
    return { ok: false, error: "Year in Review is not enabled." };
  }
  const view = await getYearInReview(input);
  if (!view) return { ok: false, error: "Could not build Year in Review." };

  const payload = buildYearInReviewSharePayload(view.report);
  const token = randomBytes(16).toString("hex");
  await prisma.yearInReviewShare.create({
    data: {
      athleteProfileId: view.athleteProfileId,
      yearKey: view.report.yearKey,
      token,
      payloadJson: JSON.stringify(payload),
    },
  });
  return { ok: true, token, path: `/share/year/${token}` };
}

export async function getYearInReviewShareByToken(
  token: string,
): Promise<YearInReviewSharePayload | null> {
  const row = await prisma.yearInReviewShare.findUnique({ where: { token } });
  if (!row) return null;
  if (row.expiresAt && row.expiresAt.getTime() < Date.now()) return null;
  try {
    return JSON.parse(row.payloadJson) as YearInReviewSharePayload;
  } catch {
    return null;
  }
}

export function getYearInReviewAdminSnapshot(): YearInReviewSnapshot {
  return buildYearInReviewSnapshot();
}
