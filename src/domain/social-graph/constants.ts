/**
 * Social Graph Prep (Prompt 194).
 * Architecture for follows, private accounts, and activity feeds.
 * Do not launch a full social feed unless moderation is ready.
 */

export const SOCIAL_GRAPH_ENGINE_VERSION = "social_graph_prep.v1" as const;

export const SOCIAL_GRAPH_HONESTY = [
  "Social graph prep documents follow / privacy / feed contracts — it does not invent followers, posts, or engagement.",
  "Private accounts default to private; follow requests stay pending until accepted — never auto-accept.",
  "The full activity feed must not launch until moderation readiness checks pass and the dedicated feed flag is on.",
  "Empty feeds and zero follows mean no data yet, not fabricated social proof.",
] as const;

export const SOCIAL_FOLLOW_TARGET_KINDS = ["athlete", "coach"] as const;
export type SocialFollowTargetKind =
  (typeof SOCIAL_FOLLOW_TARGET_KINDS)[number];

export const SOCIAL_FOLLOW_TARGET_LABELS: Record<
  SocialFollowTargetKind,
  string
> = {
  athlete: "Athlete",
  coach: "Coach",
};

export const SOCIAL_FOLLOW_STATUSES = [
  "pending",
  "accepted",
  "declined",
  "blocked",
] as const;
export type SocialFollowStatus = (typeof SOCIAL_FOLLOW_STATUSES)[number];

export const SOCIAL_FOLLOW_STATUS_LABELS: Record<SocialFollowStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  declined: "Declined",
  blocked: "Blocked",
};

/** Planned activity item kinds for a future feed — not live content. */
export const SOCIAL_ACTIVITY_KINDS = [
  "workout_completed",
  "pr_logged",
  "technique_shared",
  "program_started",
  "competition_prep",
  "coach_note_public",
  "follow_accepted",
] as const;
export type SocialActivityKind = (typeof SOCIAL_ACTIVITY_KINDS)[number];

export const SOCIAL_ACTIVITY_KIND_LABELS: Record<SocialActivityKind, string> = {
  workout_completed: "Workout completed",
  pr_logged: "PR logged",
  technique_shared: "Technique shared",
  program_started: "Program started",
  competition_prep: "Competition prep",
  coach_note_public: "Public coach note",
  follow_accepted: "Follow accepted",
};

/**
 * Checklist items required before launching a full activity feed.
 * All must be true (plus the live feed flag) for launch.
 */
export const SOCIAL_FEED_MODERATION_CHECKLIST = [
  {
    id: "content_moderation_flag",
    label: "Content moderation feature flag enabled",
  },
  {
    id: "report_queue",
    label: "Unified report → review queue available for social targets",
  },
  {
    id: "social_target_in_moderation",
    label: "Social / UGC listed in moderation target surface",
  },
  {
    id: "block_mute_contract",
    label: "Block / mute edge documented (status=blocked)",
  },
  {
    id: "feed_flag_explicit",
    label: "socialActivityFeed flag explicitly ON (default stays OFF)",
  },
] as const;

export type SocialFeedChecklistId =
  (typeof SOCIAL_FEED_MODERATION_CHECKLIST)[number]["id"];

/** Default until the athlete opts into a public social presence. */
export const SOCIAL_ACCOUNT_DEFAULT_PRIVATE = true;
