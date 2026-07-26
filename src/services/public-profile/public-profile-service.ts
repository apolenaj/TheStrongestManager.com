import { prisma } from "@/lib/db";
import { parseTargetLiftsJson } from "@/services/competition-mode/competition-mode-service";
import {
  assemblePublicProfile,
  computeTrainingStreakDays,
  defaultVisibility,
  normalizePublicSlug,
  parseVisibilityJson,
  serializeVisibility,
  type AssembledPublicProfile,
  type PublicProfileSignals,
  type PublicProfileVisibility,
} from "@/domain/public-profile";
import { MAJOR_LIFTS } from "@/services/onboarding/options";
import { toCanonicalKg } from "@/services/units/convert";

export type PublicProfileSettingsView = {
  profileId: string;
  isPublic: boolean;
  slug: string | null;
  bio: string | null;
  visibility: PublicProfileVisibility;
  publicPath: string | null;
};

function disciplineLabel(raw: string | null): string | null {
  if (!raw?.trim()) return null;
  return raw.replace(/_/g, " ");
}

async function gatherSignals(
  athleteProfileId: string,
  displayName: string | null,
  primaryDiscipline: string | null,
  bio: string | null,
): Promise<PublicProfileSignals> {
  const since = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000);

  const [
    progressRows,
    competitions,
    prShares,
    techniqueShares,
    techniqueRows,
    sessions,
    bodyRows,
  ] = await Promise.all([
    prisma.progressMetric.findMany({
      where: {
        athleteProfileId,
        metricKey: {
          in: MAJOR_LIFTS.map((l) => l.metricKey),
        },
      },
      orderBy: { recordedAt: "desc" },
      take: 80,
      select: {
        metricKey: true,
        value: true,
        unit: true,
        reps: true,
      },
    }),
    prisma.competitionPrep.findMany({
      where: {
        athleteProfileId,
        status: "completed",
      },
      orderBy: { competitionDate: "desc" },
      take: 12,
      select: {
        name: true,
        sport: true,
        competitionDate: true,
        weightClassLabel: true,
        targetLiftsJson: true,
      },
    }),
    prisma.prShare.findMany({
      where: { athleteProfileId },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { payloadJson: true, createdAt: true },
    }),
    prisma.techniqueShare.findMany({
      where: { athleteProfileId },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { payloadJson: true, createdAt: true },
    }),
    prisma.techniqueAnalysis.findMany({
      where: {
        athleteProfileId,
        deletedAt: null,
        status: "completed",
        overallScore: { not: null },
        createdAt: { gte: since },
      },
      orderBy: { overallScore: "desc" },
      take: 20,
      select: {
        overallScore: true,
        createdAt: true,
        exercise: { select: { name: true, slug: true } },
      },
    }),
    prisma.trainingSession.findMany({
      where: {
        athleteProfileId,
        status: "completed",
        completedAt: { not: null },
      },
      orderBy: { completedAt: "desc" },
      take: 120,
      select: { completedAt: true },
    }),
    prisma.bodyMetric.findMany({
      where: {
        athleteProfileId,
        metricKey: "bodyweight",
      },
      orderBy: { recordedAt: "desc" },
      take: 1,
      select: { value: true, unit: true, recordedAt: true, metricKey: true },
    }),
  ]);

  // Best PR per lift
  const bestByKey = new Map<string, { kg: number; reps: number | null }>();
  for (const row of progressRows) {
    const kg = toCanonicalKg(row.value, row.unit ?? "kg");
    const prev = bestByKey.get(row.metricKey);
    if (!prev || kg > prev.kg) {
      bestByKey.set(row.metricKey, { kg, reps: row.reps });
    }
  }
  const prs = MAJOR_LIFTS.flatMap((lift) => {
    const best = bestByKey.get(lift.metricKey);
    if (!best) return [];
    return [
      {
        liftLabel: lift.label,
        loadKg: Math.round(best.kg * 10) / 10,
        reps: best.reps,
      },
    ];
  });

  const competitionsOut = competitions.map((c) => {
    void parseTargetLiftsJson(c.targetLiftsJson);
    return {
      name: c.name,
      sport: c.sport,
      date: c.competitionDate.toISOString(),
      weightClassLabel: c.weightClassLabel,
    };
  });

  const achievements: PublicProfileSignals["achievements"] = [];
  for (const row of prShares) {
    try {
      const p = JSON.parse(row.payloadJson) as {
        title?: string;
        headline?: string;
        shareCard?: { eyebrow?: string; cardHeadline?: string };
      };
      achievements.push({
        title: p.shareCard?.eyebrow ?? p.title ?? "PR",
        headline: p.shareCard?.cardHeadline ?? p.headline ?? "",
        at: row.createdAt.toISOString(),
      });
    } catch {
      /* skip */
    }
  }
  for (const row of techniqueShares) {
    try {
      const p = JSON.parse(row.payloadJson) as {
        card?: { eyebrow?: string; scoreLine?: string };
      };
      if (p.card?.eyebrow) {
        achievements.push({
          title: p.card.eyebrow,
          headline: p.card.scoreLine ?? "Technique",
          at: row.createdAt.toISOString(),
        });
      }
    } catch {
      /* skip */
    }
  }

  const techniqueHighlights: PublicProfileSignals["techniqueHighlights"] = [];
  const seenLift = new Set<string>();
  for (const row of techniqueRows) {
    if (row.overallScore == null || !row.exercise) continue;
    if (seenLift.has(row.exercise.slug)) continue;
    seenLift.add(row.exercise.slug);
    techniqueHighlights.push({
      exerciseLabel: row.exercise.name || row.exercise.slug,
      score: Math.round(row.overallScore),
      at: row.createdAt.toISOString(),
    });
    if (techniqueHighlights.length >= 4) break;
  }

  const streak = computeTrainingStreakDays(
    sessions
      .map((s) => s.completedAt)
      .filter((d): d is Date => d != null),
  );

  const bodyMetrics = bodyRows.map((b) => ({
    label: "Bodyweight",
    value: b.value,
    unit: b.unit || "kg",
    recordedAt: b.recordedAt.toISOString(),
  }));

  return {
    displayName: displayName,
    sport: disciplineLabel(primaryDiscipline),
    bio,
    prs,
    competitions: competitionsOut,
    achievements: achievements.slice(0, 10),
    techniqueHighlights,
    trainingStreakDays: streak > 0 ? streak : null,
    bodyMetrics,
    // Intentionally not loaded — assembly still forbids them
    recoverySummary: null,
    privateNotes: null,
  };
}

export async function getPublicProfileSettings(
  userId: string,
): Promise<PublicProfileSettingsView | null> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      publicProfile: true,
    },
  });
  if (!profile) return null;

  const pub = profile.publicProfile;
  if (!pub) {
    return {
      profileId: profile.id,
      isPublic: false,
      slug: null,
      bio: null,
      visibility: defaultVisibility(),
      publicPath: null,
    };
  }

  return {
    profileId: profile.id,
    isPublic: pub.isPublic,
    slug: pub.slug,
    bio: pub.bio,
    visibility: parseVisibilityJson(pub.visibilityJson),
    publicPath:
      pub.isPublic && pub.slug ? `/u/${pub.slug}` : null,
  };
}

export async function upsertPublicProfileSettings(
  userId: string,
  input: {
    isPublic: boolean;
    slug: string | null;
    bio: string | null;
    visibility: PublicProfileVisibility;
  },
): Promise<{ ok: true; publicPath: string | null } | { ok: false; error: string }> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return { ok: false, error: "No athlete profile." };

  let slug: string | null = null;
  if (input.slug?.trim()) {
    slug = normalizePublicSlug(input.slug);
    if (!slug) {
      return {
        ok: false,
        error:
          "Slug must be 3–32 characters: letters, numbers, and hyphens only.",
      };
    }
    const taken = await prisma.athletePublicProfile.findFirst({
      where: {
        slug,
        NOT: { athleteProfileId: profile.id },
      },
      select: { id: true },
    });
    if (taken) return { ok: false, error: "That slug is already taken." };
  }

  if (input.isPublic && !slug) {
    return {
      ok: false,
      error: "Choose a public slug before enabling your public profile.",
    };
  }

  const data = {
    isPublic: input.isPublic,
    slug,
    bio: input.bio?.trim().slice(0, 280) || null,
    visibilityJson: serializeVisibility(input.visibility),
  };

  await prisma.athletePublicProfile.upsert({
    where: { athleteProfileId: profile.id },
    create: {
      athleteProfileId: profile.id,
      ...data,
    },
    update: data,
  });

  return {
    ok: true,
    publicPath: data.isPublic && data.slug ? `/u/${data.slug}` : null,
  };
}

/**
 * Public page loader — returns null when private / missing (caller 404s).
 */
export async function getAssembledPublicProfileBySlug(
  slugRaw: string,
): Promise<AssembledPublicProfile | null> {
  const slug = normalizePublicSlug(slugRaw);
  if (!slug) return null;

  const pub = await prisma.athletePublicProfile.findFirst({
    where: { slug, isPublic: true },
    select: {
      slug: true,
      bio: true,
      visibilityJson: true,
      athleteProfile: {
        select: {
          id: true,
          displayName: true,
          primaryDiscipline: true,
        },
      },
    },
  });
  if (!pub?.slug) return null;

  const visibility = parseVisibilityJson(pub.visibilityJson);
  const signals = await gatherSignals(
    pub.athleteProfile.id,
    pub.athleteProfile.displayName,
    pub.athleteProfile.primaryDiscipline,
    pub.bio,
  );

  return assemblePublicProfile(pub.slug, visibility, signals);
}
