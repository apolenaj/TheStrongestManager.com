import {
  ACTIVITY_FEED_DEFAULT_VISIBILITY,
  ACTIVITY_FEED_ENGINE_VERSION,
  ACTIVITY_FEED_FORBIDDEN_PATTERNS,
  ACTIVITY_FEED_HONESTY,
  ACTIVITY_FEED_KIND_DESCRIPTIONS,
  ACTIVITY_FEED_KIND_LABELS,
  ACTIVITY_FEED_KINDS,
  ACTIVITY_FEED_MAX_ITEMS,
  ACTIVITY_FEED_PAGE_SIZE,
} from "@/domain/activity-feed/constants";
import type { ActivityFeedSnapshot } from "@/domain/activity-feed/types";

export function buildActivityFeedSnapshot(
  generatedAt: string = new Date().toISOString(),
): ActivityFeedSnapshot {
  return {
    engineVersion: ACTIVITY_FEED_ENGINE_VERSION,
    honesty: ACTIVITY_FEED_HONESTY,
    kinds: ACTIVITY_FEED_KINDS.map((id) => ({
      id,
      label: ACTIVITY_FEED_KIND_LABELS[id],
      description: ACTIVITY_FEED_KIND_DESCRIPTIONS[id],
    })),
    pageSize: ACTIVITY_FEED_PAGE_SIZE,
    maxItems: ACTIVITY_FEED_MAX_ITEMS,
    forbiddenPatterns: ACTIVITY_FEED_FORBIDDEN_PATTERNS,
    defaultVisibility: { ...ACTIVITY_FEED_DEFAULT_VISIBILITY },
    docPath: "docs/ACTIVITY_FEED.md",
    generatedAt,
  };
}
