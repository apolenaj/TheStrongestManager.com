import { prisma } from "@/lib/db";
import {
  buildConsistencyBoard,
  buildRepPrsBoard,
  buildTechniqueImprovementBoard,
  buildVerifiedLiftsBoard,
  defaultCategoryParticipation,
  LEADERBOARD_SAFETY_NOTES,
  parseCategoriesJson,
  resolveVerificationTier,
  serializeCategories,
  type LeaderboardBoard,
  type LeaderboardCategoryId,
  type LeaderboardCategoryParticipation,
  type LeaderboardFilters,
  type LiftVerificationTier,
} from "@/domain/leaderboard";
import { MAJOR_LIFTS } from "@/services/onboarding/options";
import { toCanonicalKg } from "@/services/units/convert";

const WINDOW_DAYS = 28;

export type LeaderboardOptInView = {
  optedIn: boolean;
  countryCode: string | null;
  bodyweightClassLabel: string | null;
  bodyweightClassMaxKg: number | null;
  sport: string | null;
  categories: LeaderboardCategoryParticipation;
  showDisplayName: boolean;
};

export type LeaderboardPageView = {
  optIn: LeaderboardOptInView;
  board: LeaderboardBoard;
  category: LeaderboardCategoryId;
  filters: LeaderboardFilters;
};

function anonymousLabel(profileId: string): string {
  return `Athlete ${profileId.slice(-4).toUpperCase()}`;
}

export async function getLeaderboardOptIn(
  userId: string,
): Promise<LeaderboardOptInView | null> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      leaderboardOptIn: true,
    },
  });
  if (!profile) return null;
  const row = profile.leaderboardOptIn;
  if (!row) {
    return {
      optedIn: false,
      countryCode: null,
      bodyweightClassLabel: null,
      bodyweightClassMaxKg: null,
      sport: null,
      categories: defaultCategoryParticipation(),
      showDisplayName: true,
    };
  }
  return {
    optedIn: row.optedIn,
    countryCode: row.countryCode,
    bodyweightClassLabel: row.bodyweightClassLabel,
    bodyweightClassMaxKg: row.bodyweightClassMaxKg,
    sport: row.sport,
    categories: parseCategoriesJson(row.categoriesJson),
    showDisplayName: row.showDisplayName,
  };
}

export async function upsertLeaderboardOptIn(
  userId: string,
  input: LeaderboardOptInView,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return { ok: false, error: "No athlete profile." };

  const country = input.countryCode?.trim().toUpperCase() || null;
  if (country && !/^[A-Z]{2}$/.test(country)) {
    return { ok: false, error: "Country must be a 2-letter code (e.g. US)." };
  }

  await prisma.leaderboardOptIn.upsert({
    where: { athleteProfileId: profile.id },
    create: {
      athleteProfileId: profile.id,
      optedIn: input.optedIn,
      countryCode: country,
      bodyweightClassLabel: input.bodyweightClassLabel?.trim() || null,
      bodyweightClassMaxKg:
        input.bodyweightClassMaxKg != null && input.bodyweightClassMaxKg > 0
          ? input.bodyweightClassMaxKg
          : null,
      sport: input.sport?.trim() || null,
      categoriesJson: serializeCategories(input.categories),
      showDisplayName: input.showDisplayName,
    },
    update: {
      optedIn: input.optedIn,
      countryCode: country,
      bodyweightClassLabel: input.bodyweightClassLabel?.trim() || null,
      bodyweightClassMaxKg:
        input.bodyweightClassMaxKg != null && input.bodyweightClassMaxKg > 0
          ? input.bodyweightClassMaxKg
          : null,
      sport: input.sport?.trim() || null,
      categoriesJson: serializeCategories(input.categories),
      showDisplayName: input.showDisplayName,
    },
  });

  return { ok: true };
}

function parseCategory(raw: string | undefined): LeaderboardCategoryId {
  if (
    raw === "verified_lifts" ||
    raw === "rep_prs" ||
    raw === "technique_improvement" ||
    raw === "consistency"
  ) {
    return raw;
  }
  return "verified_lifts";
}

function parseVerification(
  raw: string | undefined,
): LiftVerificationTier | null {
  if (
    raw === "self_reported" ||
    raw === "video_verified" ||
    raw === "competition_verified"
  ) {
    return raw;
  }
  return null;
}

/**
 * Build a leaderboard from opted-in athletes only — never invents ranks.
 */
export async function getLeaderboardPage(
  userId: string,
  query: {
    category?: string;
    country?: string;
    sport?: string;
    classKg?: string;
    verification?: string;
  },
): Promise<LeaderboardPageView | null> {
  const optIn = await getLeaderboardOptIn(userId);
  if (!optIn) return null;

  const category = parseCategory(query.category);
  const filters: LeaderboardFilters = {
    countryCode: query.country?.trim().toUpperCase() || null,
    sport: query.sport?.trim() || null,
    bodyweightClassMaxKg: query.classKg ? Number(query.classKg) : null,
    verification: parseVerification(query.verification),
  };
  if (
    filters.bodyweightClassMaxKg != null &&
    !Number.isFinite(filters.bodyweightClassMaxKg)
  ) {
    filters.bodyweightClassMaxKg = null;
  }

  const opted = await prisma.leaderboardOptIn.findMany({
    where: { optedIn: true },
    select: {
      athleteProfileId: true,
      countryCode: true,
      bodyweightClassMaxKg: true,
      sport: true,
      categoriesJson: true,
      showDisplayName: true,
      athleteProfile: {
        select: {
          displayName: true,
          primaryDiscipline: true,
        },
      },
    },
  });

  const participants = opted.filter((row) => {
    const cats = parseCategoriesJson(row.categoriesJson);
    return cats[category] === true;
  });

  const athleteIds = participants.map((p) => p.athleteProfileId);
  const refs = new Map(
    participants.map((p) => [
      p.athleteProfileId,
      {
        athleteProfileId: p.athleteProfileId,
        displayName: p.athleteProfile.displayName,
        anonymousLabel: anonymousLabel(p.athleteProfileId),
        showDisplayName: p.showDisplayName,
        countryCode: p.countryCode,
        bodyweightClassMaxKg: p.bodyweightClassMaxKg,
        sport: p.sport ?? p.athleteProfile.primaryDiscipline,
      },
    ]),
  );

  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const safety = LEADERBOARD_SAFETY_NOTES;

  if (athleteIds.length === 0) {
    const emptyBoard =
      category === "rep_prs"
        ? buildRepPrsBoard([], filters, safety)
        : category === "technique_improvement"
          ? buildTechniqueImprovementBoard([], filters, safety)
          : category === "consistency"
            ? buildConsistencyBoard([], filters, safety)
            : buildVerifiedLiftsBoard([], filters, safety);

    return { optIn, board: emptyBoard, category, filters };
  }

  if (category === "consistency") {
    const sessions = await prisma.trainingSession.groupBy({
      by: ["athleteProfileId"],
      where: {
        athleteProfileId: { in: athleteIds },
        status: "completed",
        completedAt: { gte: since },
      },
      _count: { _all: true },
    });
    const entries = sessions.flatMap((s) => {
      const athlete = refs.get(s.athleteProfileId);
      if (!athlete) return [];
      return [
        {
          athlete,
          completedSessions: s._count._all,
          windowDays: WINDOW_DAYS,
        },
      ];
    });
    return {
      optIn,
      board: buildConsistencyBoard(entries, filters, safety),
      category,
      filters,
    };
  }

  if (category === "technique_improvement") {
    const analyses = await prisma.techniqueAnalysis.findMany({
      where: {
        athleteProfileId: { in: athleteIds },
        deletedAt: null,
        status: "completed",
        overallScore: { not: null },
        createdAt: { gte: since },
      },
      orderBy: { createdAt: "asc" },
      select: {
        athleteProfileId: true,
        overallScore: true,
        createdAt: true,
      },
    });
    const byAthlete = new Map<string, number[]>();
    for (const a of analyses) {
      if (a.overallScore == null) continue;
      const list = byAthlete.get(a.athleteProfileId) ?? [];
      list.push(a.overallScore);
      byAthlete.set(a.athleteProfileId, list);
    }
    const entries = [...byAthlete.entries()].flatMap(([id, scores]) => {
      const athlete = refs.get(id);
      if (!athlete || scores.length < 2) return [];
      const mid = Math.floor(scores.length / 2);
      const earlier =
        scores.slice(0, mid).reduce((s, x) => s + x, 0) / mid;
      const laterScores = scores.slice(mid);
      const later =
        laterScores.reduce((s, x) => s + x, 0) / laterScores.length;
      return [
        {
          athlete,
          deltaPoints: later - earlier,
          latestScore: scores[scores.length - 1]!,
          sampleCount: scores.length,
        },
      ];
    });
    return {
      optIn,
      board: buildTechniqueImprovementBoard(entries, filters, safety),
      category,
      filters,
    };
  }

  // Lift boards: progress metrics + competition targets
  const metricKeys = MAJOR_LIFTS.map((l) => l.metricKey);
  const [metrics, competitions] = await Promise.all([
    prisma.progressMetric.findMany({
      where: {
        athleteProfileId: { in: athleteIds },
        metricKey: { in: metricKeys },
      },
      select: {
        athleteProfileId: true,
        metricKey: true,
        value: true,
        unit: true,
        reps: true,
        source: true,
        recordedAt: true,
      },
    }),
    prisma.competitionPrep.findMany({
      where: {
        athleteProfileId: { in: athleteIds },
        status: "completed",
      },
      select: {
        athleteProfileId: true,
        competitionDate: true,
        targetLiftsJson: true,
      },
    }),
  ]);

  const liftLabel = (key: string) =>
    MAJOR_LIFTS.find((l) => l.metricKey === key)?.label ?? key;

  const liftEntries = metrics.flatMap((m) => {
    const athlete = refs.get(m.athleteProfileId);
    if (!athlete) return [];
    const kg = toCanonicalKg(m.value, m.unit ?? "kg");
    return [
      {
        athlete,
        liftLabel: liftLabel(m.metricKey),
        loadKg: Math.round(kg * 10) / 10,
        reps: m.reps,
        verification: resolveVerificationTier(m.source),
        recordedAt: m.recordedAt,
      },
    ];
  });

  // Competition targets as competition_verified singles
  for (const c of competitions) {
    const athlete = refs.get(c.athleteProfileId);
    if (!athlete) continue;
    try {
      const t = JSON.parse(c.targetLiftsJson) as Record<string, unknown>;
      const pairs: Array<[string, unknown]> = [
        ["Squat", t.squatKg],
        ["Bench press", t.benchKg],
        ["Deadlift", t.deadliftKg],
      ];
      for (const [label, raw] of pairs) {
        if (typeof raw !== "number" || !(raw > 0)) continue;
        liftEntries.push({
          athlete,
          liftLabel: label,
          loadKg: raw,
          reps: 1,
          verification: "competition_verified",
          recordedAt: c.competitionDate,
        });
      }
    } catch {
      /* skip */
    }
  }

  // Video verified: technique analyses with loadKg logged
  const techWithLoad = await prisma.techniqueAnalysis.findMany({
    where: {
      athleteProfileId: { in: athleteIds },
      deletedAt: null,
      status: "completed",
      loadKg: { not: null },
    },
    select: {
      athleteProfileId: true,
      loadKg: true,
      reps: true,
      createdAt: true,
      exercise: { select: { name: true } },
    },
  });
  for (const t of techWithLoad) {
    const athlete = refs.get(t.athleteProfileId);
    if (!athlete || t.loadKg == null) continue;
    liftEntries.push({
      athlete,
      liftLabel: t.exercise?.name ?? "Lift",
      loadKg: t.loadKg,
      reps: t.reps ?? 1,
      verification: "video_verified",
      recordedAt: t.createdAt,
    });
  }

  const board =
    category === "rep_prs"
      ? buildRepPrsBoard(liftEntries, filters, safety)
      : buildVerifiedLiftsBoard(liftEntries, filters, safety);

  return { optIn, board, category, filters };
}
