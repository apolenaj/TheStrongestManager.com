import type {
  SocialActivityKind,
  SocialFeedChecklistId,
  SocialFollowStatus,
  SocialFollowTargetKind,
} from "@/domain/social-graph/constants";

export type SocialAccountPrivacy = {
  userId: string;
  /** Default true — private until explicitly opened. */
  isPrivate: boolean;
  allowAthleteFollows: boolean;
  allowCoachFollows: boolean;
  /** Opt-in to appear in others’ feeds when feed launches. */
  publishActivityToFollowers: boolean;
};

export type SocialFollowEdge = {
  id: string;
  followerUserId: string;
  targetKind: SocialFollowTargetKind;
  /** Athlete profile when following an athlete. */
  targetAthleteProfileId: string | null;
  /** Coach user id when following a coach. */
  targetCoachUserId: string | null;
  status: SocialFollowStatus;
  createdAt: string;
  updatedAt: string;
};

export type SocialActivityItem = {
  id: string;
  kind: SocialActivityKind;
  actorUserId: string;
  occurredAt: string;
  /** Public-safe summary only. */
  summary: string;
  href: string | null;
};

export type SocialFeedLaunchInput = {
  /** Architecture / prep flag. */
  socialGraphPrepEnabled: boolean;
  /** Live feed flag — must default OFF in product config. */
  socialActivityFeedEnabled: boolean;
  /** Existing content moderation product flag. */
  contentModerationEnabled: boolean;
  /** True when moderation targets include UGC / social-capable surface. */
  moderationCoversUserGeneratedContent: boolean;
  /** True when report queue service is wired (not invented). */
  reportQueueAvailable: boolean;
};

export type SocialFeedChecklistResult = {
  id: SocialFeedChecklistId;
  label: string;
  ok: boolean;
  detail: string;
};

export type SocialFeedLaunchGate = {
  /** True only when every checklist item passes. */
  mayLaunchFullFeed: boolean;
  checklist: SocialFeedChecklistResult[];
  blockers: string[];
  honesty: string;
};

export type SocialGraphSnapshot = {
  engineVersion: string;
  honesty: readonly string[];
  followTargets: Array<{ id: SocialFollowTargetKind; label: string }>;
  followStatuses: Array<{ id: SocialFollowStatus; label: string }>;
  activityKinds: Array<{ id: SocialActivityKind; label: string }>;
  defaultPrivate: boolean;
  launchGate: SocialFeedLaunchGate;
  docPath: "docs/SOCIAL_GRAPH.md";
  generatedAt: string;
};
