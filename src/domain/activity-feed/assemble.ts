import {
  ACTIVITY_FEED_DEFAULT_VISIBILITY,
  ACTIVITY_FEED_KINDS,
  ACTIVITY_FEED_MAX_ITEMS,
  ACTIVITY_FEED_PAGE_SIZE,
  type ActivityFeedKind,
} from "@/domain/activity-feed/constants";
import type {
  ActivityFeedItem,
  ActivityFeedSourceBundle,
  ActivityFeedVisibility,
} from "@/domain/activity-feed/types";

export function defaultActivityFeedVisibility(): ActivityFeedVisibility {
  return { ...ACTIVITY_FEED_DEFAULT_VISIBILITY };
}

export function kindsEnabledByVisibility(
  visibility: ActivityFeedVisibility,
): ActivityFeedKind[] {
  if (!visibility.feedEnabled) return [];
  const out: ActivityFeedKind[] = [];
  if (visibility.showPrs) out.push("pr");
  if (visibility.showCompetitionResults) out.push("competition_result");
  if (visibility.showAchievements) out.push("achievement");
  if (visibility.showSharedTechnique) out.push("shared_technique");
  return out;
}

export function isActivityFeedKind(value: string): value is ActivityFeedKind {
  return (ACTIVITY_FEED_KINDS as readonly string[]).includes(value);
}

export function assembleActivityFeedItems(
  sources: ActivityFeedSourceBundle,
  visibility: ActivityFeedVisibility,
  options?: { pageSize?: number; maxItems?: number },
): {
  items: ActivityFeedItem[];
  totalBeforeCap: number;
  capped: boolean;
  endOfFeed: boolean;
} {
  const enabled = new Set(kindsEnabledByVisibility(visibility));
  const pageSize = options?.pageSize ?? ACTIVITY_FEED_PAGE_SIZE;
  const maxItems = options?.maxItems ?? ACTIVITY_FEED_MAX_ITEMS;
  const hardCap = Math.min(pageSize, maxItems);

  const items: ActivityFeedItem[] = [];

  if (enabled.has("pr")) {
    for (const p of sources.prs) {
      items.push({
        id: `pr:${p.id}`,
        kind: "pr",
        occurredAt: p.at,
        title: p.title,
        summary: p.headline,
        href: p.href ?? "/app/prs",
      });
    }
  }

  if (enabled.has("competition_result")) {
    for (const c of sources.competitions) {
      const parts = [c.name, c.sport];
      if (c.weightClassLabel) parts.push(c.weightClassLabel);
      items.push({
        id: `competition:${c.id}`,
        kind: "competition_result",
        occurredAt: c.at,
        title: "Competition completed",
        summary: parts.filter(Boolean).join(" · "),
        href: "/app/competition",
      });
    }
  }

  if (enabled.has("achievement")) {
    for (const a of sources.achievements) {
      items.push({
        id: `achievement:${a.id}`,
        kind: "achievement",
        occurredAt: a.earnedAt,
        title: a.title,
        summary: `Achievement earned · ${a.achievementId}`,
        href: "/app/achievements",
      });
    }
  }

  if (enabled.has("shared_technique")) {
    for (const t of sources.techniqueShares) {
      items.push({
        id: `technique_share:${t.id}`,
        kind: "shared_technique",
        occurredAt: t.at,
        title: "Shared technique",
        summary: t.headline,
        href: `/share/technique/${t.token}`,
      });
    }
  }

  items.sort(
    (a, b) =>
      new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );

  const totalBeforeCap = items.length;
  const sliced = items.slice(0, hardCap);
  const capped = totalBeforeCap > hardCap;

  return {
    items: sliced,
    totalBeforeCap,
    capped,
    /** Finite feed: always an honest end — no “keep scrolling.” */
    endOfFeed: true,
  };
}
