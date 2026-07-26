import type { ActivityFeedKind } from "@/domain/activity-feed/constants";

export type ActivityFeedVisibility = {
  feedEnabled: boolean;
  showPrs: boolean;
  showCompetitionResults: boolean;
  showAchievements: boolean;
  showSharedTechnique: boolean;
};

export type ActivityFeedItem = {
  id: string;
  kind: ActivityFeedKind;
  occurredAt: string;
  title: string;
  summary: string;
  href: string | null;
};

export type ActivityFeedSourceBundle = {
  prs: Array<{
    id: string;
    at: string;
    title: string;
    headline: string;
    href: string | null;
  }>;
  competitions: Array<{
    id: string;
    at: string;
    name: string;
    sport: string;
    weightClassLabel: string | null;
  }>;
  achievements: Array<{
    id: string;
    achievementId: string;
    title: string;
    earnedAt: string;
  }>;
  techniqueShares: Array<{
    id: string;
    token: string;
    at: string;
    headline: string;
  }>;
};

export type ActivityFeedView = {
  engineVersion: string;
  honesty: readonly string[];
  visibility: ActivityFeedVisibility;
  items: ActivityFeedItem[];
  totalBeforeCap: number;
  capped: boolean;
  endOfFeed: boolean;
  forbiddenPatterns: readonly string[];
};

export type ActivityFeedSnapshot = {
  engineVersion: string;
  honesty: readonly string[];
  kinds: Array<{
    id: ActivityFeedKind;
    label: string;
    description: string;
  }>;
  pageSize: number;
  maxItems: number;
  forbiddenPatterns: readonly string[];
  defaultVisibility: ActivityFeedVisibility;
  docPath: "docs/ACTIVITY_FEED.md";
  generatedAt: string;
};
