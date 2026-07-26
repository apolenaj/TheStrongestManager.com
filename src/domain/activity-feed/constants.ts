/**
 * Activity Feed MVP (Prompt 195).
 * Optional milestone feed: PRs, competition results, achievements,
 * shared technique — with user visibility controls.
 * No endless engagement dark patterns.
 */

export const ACTIVITY_FEED_ENGINE_VERSION = "activity_feed_mvp.v1" as const;

export const ACTIVITY_FEED_HONESTY = [
  "The activity feed only lists milestones you opted to show — empty means nothing matches your visibility settings, not missing social proof.",
  "PRs, competition results, achievements, and shared technique come from real records — never invented posts or fake engagement.",
  "Competition entries are completed Competition Prep records — not fabricated placings or official federation results.",
  "This is an optional, finite feed — not an infinite scroll engagement loop.",
] as const;

/** MVP item kinds — intentional and small. */
export const ACTIVITY_FEED_KINDS = [
  "pr",
  "competition_result",
  "achievement",
  "shared_technique",
] as const;
export type ActivityFeedKind = (typeof ACTIVITY_FEED_KINDS)[number];

export const ACTIVITY_FEED_KIND_LABELS: Record<ActivityFeedKind, string> = {
  pr: "PRs",
  competition_result: "Competition results",
  achievement: "Achievements",
  shared_technique: "Shared technique",
};

export const ACTIVITY_FEED_KIND_DESCRIPTIONS: Record<ActivityFeedKind, string> = {
  pr: "Logged personal records from PR Intelligence (lookback window).",
  competition_result:
    "Completed Competition Prep meets you recorded — not invented placings.",
  achievement: "Earned catalog achievements with real evidence.",
  shared_technique:
    "Technique score cards you explicitly created to share.",
};

/**
 * Patterns we refuse — aligned with achievements / retention honesty.
 */
export const ACTIVITY_FEED_FORBIDDEN_PATTERNS = [
  "infinite_scroll",
  "endless_engagement",
  "fake_like_counts",
  "comment_bait",
  "streak_guilt_in_feed",
  "algorithmic_ranking",
  "fake_urgency",
  "autoplay_next",
  "pull_to_refresh_dopamine",
  "you_are_missing_out",
] as const;

/** Soft page size — finite, not endless. */
export const ACTIVITY_FEED_PAGE_SIZE = 20;
/** Hard ceiling per request — never “keep loading forever.” */
export const ACTIVITY_FEED_MAX_ITEMS = 40;

/** Default visibility: feed on; all kinds on until the athlete hides them. */
export const ACTIVITY_FEED_DEFAULT_VISIBILITY = {
  feedEnabled: true,
  showPrs: true,
  showCompetitionResults: true,
  showAchievements: true,
  showSharedTechnique: true,
} as const;
