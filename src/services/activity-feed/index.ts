import { prisma } from "@/lib/db";
import { featureFlags } from "@/config/feature-flags";
import {
  ACTIVITY_FEED_ENGINE_VERSION,
  ACTIVITY_FEED_FORBIDDEN_PATTERNS,
  ACTIVITY_FEED_HONESTY,
  ACTIVITY_FEED_MAX_ITEMS,
  ACTIVITY_FEED_PAGE_SIZE,
  assembleActivityFeedItems,
  buildActivityFeedSnapshot,
  defaultActivityFeedVisibility,
  type ActivityFeedSnapshot,
  type ActivityFeedSourceBundle,
  type ActivityFeedView,
  type ActivityFeedVisibility,
} from "@/domain/activity-feed";
import { getAchievementById } from "@/domain/achievement";
import { getPrIntelligence } from "@/services/pr-intelligence";

function rowToVisibility(row: {
  feedEnabled: boolean;
  showPrs: boolean;
  showCompetitionResults: boolean;
  showAchievements: boolean;
  showSharedTechnique: boolean;
}): ActivityFeedVisibility {
  return {
    feedEnabled: row.feedEnabled,
    showPrs: row.showPrs,
    showCompetitionResults: row.showCompetitionResults,
    showAchievements: row.showAchievements,
    showSharedTechnique: row.showSharedTechnique,
  };
}

export async function getActivityFeedPreferences(input: {
  userId: string;
}): Promise<
  | { ok: true; prefs: ActivityFeedVisibility; athleteProfileId: string }
  | { ok: false; error: string }
> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: {
      id: true,
      activityFeedPreference: true,
    },
  });
  if (!profile) return { ok: false, error: "No athlete profile." };

  const prefs = profile.activityFeedPreference
    ? rowToVisibility(profile.activityFeedPreference)
    : defaultActivityFeedVisibility();

  return { ok: true, prefs, athleteProfileId: profile.id };
}

export async function updateActivityFeedPreferences(input: {
  userId: string;
  prefs: ActivityFeedVisibility;
}): Promise<
  | { ok: true; prefs: ActivityFeedVisibility }
  | { ok: false; error: string }
> {
  if (!featureFlags.activityFeedMvp) {
    return { ok: false, error: "Activity feed is not enabled." };
  }

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: { id: true },
  });
  if (!profile) return { ok: false, error: "No athlete profile." };

  const row = await prisma.activityFeedPreference.upsert({
    where: { athleteProfileId: profile.id },
    create: {
      athleteProfileId: profile.id,
      feedEnabled: input.prefs.feedEnabled,
      showPrs: input.prefs.showPrs,
      showCompetitionResults: input.prefs.showCompetitionResults,
      showAchievements: input.prefs.showAchievements,
      showSharedTechnique: input.prefs.showSharedTechnique,
    },
    update: {
      feedEnabled: input.prefs.feedEnabled,
      showPrs: input.prefs.showPrs,
      showCompetitionResults: input.prefs.showCompetitionResults,
      showAchievements: input.prefs.showAchievements,
      showSharedTechnique: input.prefs.showSharedTechnique,
    },
  });

  return { ok: true, prefs: rowToVisibility(row) };
}

function techniqueHeadline(payloadJson: string): string {
  try {
    const payload = JSON.parse(payloadJson) as {
      card?: { scoreLine?: string | null; eyebrow?: string };
    };
    const score = payload.card?.scoreLine?.trim();
    const eyebrow = payload.card?.eyebrow?.trim();
    if (score) return score;
    if (eyebrow) return eyebrow;
  } catch {
    /* ignore malformed frozen payload */
  }
  return "Technique share";
}

async function loadSources(
  athleteProfileId: string,
  userId: string,
  visibility: ActivityFeedVisibility,
): Promise<ActivityFeedSourceBundle> {
  const sources: ActivityFeedSourceBundle = {
    prs: [],
    competitions: [],
    achievements: [],
    techniqueShares: [],
  };

  if (!visibility.feedEnabled) return sources;

  const tasks: Promise<void>[] = [];

  if (visibility.showPrs && featureFlags.prIntelligence) {
    tasks.push(
      (async () => {
        const intel = await getPrIntelligence(userId);
        if (!intel) return;
        sources.prs = intel.timeline.events.map((e) => ({
          id: e.id,
          at: e.at,
          title: e.title,
          headline: `${e.exerciseLabel}: ${e.headline}`,
          href: "/app/prs",
        }));
      })(),
    );
  }

  if (visibility.showCompetitionResults) {
    tasks.push(
      (async () => {
        const rows = await prisma.competitionPrep.findMany({
          where: { athleteProfileId, status: "completed" },
          orderBy: { competitionDate: "desc" },
          take: ACTIVITY_FEED_MAX_ITEMS,
          select: {
            id: true,
            competitionDate: true,
            name: true,
            sport: true,
            weightClassLabel: true,
          },
        });
        sources.competitions = rows.map((r) => ({
          id: r.id,
          at: r.competitionDate.toISOString(),
          name: r.name?.trim() || "Competition",
          sport: r.sport,
          weightClassLabel: r.weightClassLabel,
        }));
      })(),
    );
  }

  if (visibility.showAchievements && featureFlags.achievementSystem) {
    tasks.push(
      (async () => {
        const rows = await prisma.athleteAchievement.findMany({
          where: { athleteProfileId },
          orderBy: { earnedAt: "desc" },
          take: ACTIVITY_FEED_MAX_ITEMS,
          select: {
            id: true,
            achievementId: true,
            earnedAt: true,
          },
        });
        sources.achievements = rows.map((r) => {
          const def = getAchievementById(r.achievementId);
          return {
            id: r.id,
            achievementId: r.achievementId,
            title: def?.title ?? r.achievementId,
            earnedAt: r.earnedAt.toISOString(),
          };
        });
      })(),
    );
  }

  if (visibility.showSharedTechnique) {
    tasks.push(
      (async () => {
        const rows = await prisma.techniqueShare.findMany({
          where: { athleteProfileId },
          orderBy: { createdAt: "desc" },
          take: ACTIVITY_FEED_MAX_ITEMS,
          select: {
            id: true,
            token: true,
            createdAt: true,
            payloadJson: true,
          },
        });
        sources.techniqueShares = rows.map((r) => ({
          id: r.id,
          token: r.token,
          at: r.createdAt.toISOString(),
          headline: techniqueHeadline(r.payloadJson),
        }));
      })(),
    );
  }

  await Promise.all(tasks);
  return sources;
}

/**
 * Optional personal activity feed — finite, visibility-controlled.
 * Never invents milestones or engagement metrics.
 */
export async function getActivityFeed(input: {
  userId: string;
}): Promise<ActivityFeedView | null> {
  if (!featureFlags.activityFeedMvp) {
    return {
      engineVersion: ACTIVITY_FEED_ENGINE_VERSION,
      honesty: [
        ...ACTIVITY_FEED_HONESTY,
        "Activity feed MVP feature flag is off.",
      ],
      visibility: defaultActivityFeedVisibility(),
      items: [],
      totalBeforeCap: 0,
      capped: false,
      endOfFeed: true,
      forbiddenPatterns: ACTIVITY_FEED_FORBIDDEN_PATTERNS,
    };
  }

  const prefResult = await getActivityFeedPreferences({ userId: input.userId });
  if (!prefResult.ok) return null;

  const visibility = prefResult.prefs;
  const sources = await loadSources(
    prefResult.athleteProfileId,
    input.userId,
    visibility,
  );
  const assembled = assembleActivityFeedItems(sources, visibility, {
    pageSize: ACTIVITY_FEED_PAGE_SIZE,
    maxItems: ACTIVITY_FEED_MAX_ITEMS,
  });

  return {
    engineVersion: ACTIVITY_FEED_ENGINE_VERSION,
    honesty: ACTIVITY_FEED_HONESTY,
    visibility,
    items: assembled.items,
    totalBeforeCap: assembled.totalBeforeCap,
    capped: assembled.capped,
    endOfFeed: assembled.endOfFeed,
    forbiddenPatterns: ACTIVITY_FEED_FORBIDDEN_PATTERNS,
  };
}

export function getActivityFeedAdminSnapshot(): ActivityFeedSnapshot {
  return buildActivityFeedSnapshot();
}
