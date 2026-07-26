import {
  SOCIAL_ACCOUNT_DEFAULT_PRIVATE,
  SOCIAL_FEED_MODERATION_CHECKLIST,
  SOCIAL_FOLLOW_STATUSES,
  SOCIAL_FOLLOW_TARGET_KINDS,
  type SocialFollowStatus,
  type SocialFollowTargetKind,
} from "@/domain/social-graph/constants";
import type {
  SocialAccountPrivacy,
  SocialFeedLaunchGate,
  SocialFeedLaunchInput,
  SocialFollowEdge,
} from "@/domain/social-graph/types";

export function defaultSocialAccountPrivacy(
  userId: string,
): SocialAccountPrivacy {
  return {
    userId,
    isPrivate: SOCIAL_ACCOUNT_DEFAULT_PRIVATE,
    allowAthleteFollows: true,
    allowCoachFollows: true,
    publishActivityToFollowers: false,
  };
}

/**
 * Feed visibility: only accepted follows receive activity.
 * AthletePublicProfile (Prompt 75) stays a separate surface.
 */
export function canViewerReceiveFollowedActivity(input: {
  privacy: SocialAccountPrivacy;
  followStatus: SocialFollowStatus | null;
  viewerUserId: string;
}): boolean {
  if (input.viewerUserId === input.privacy.userId) return true;
  if (!input.privacy.publishActivityToFollowers) return false;
  return input.followStatus === "accepted";
}

export function isValidFollowTarget(input: {
  targetKind: SocialFollowTargetKind;
  targetAthleteProfileId: string | null;
  targetCoachUserId: string | null;
}): boolean {
  if (input.targetKind === "athlete") {
    return Boolean(input.targetAthleteProfileId) && !input.targetCoachUserId;
  }
  return Boolean(input.targetCoachUserId) && !input.targetAthleteProfileId;
}

export function normalizeFollowStatus(raw: unknown): SocialFollowStatus | null {
  if (
    typeof raw === "string" &&
    (SOCIAL_FOLLOW_STATUSES as readonly string[]).includes(raw)
  ) {
    return raw as SocialFollowStatus;
  }
  return null;
}

/**
 * Private account: new follows start pending.
 * Public (isPrivate=false): may auto-accept athlete/coach follows when allowed.
 */
export function initialFollowStatusForPrivacy(
  privacy: SocialAccountPrivacy,
  targetKind: SocialFollowTargetKind,
): SocialFollowStatus | null {
  if (targetKind === "athlete" && !privacy.allowAthleteFollows) return null;
  if (targetKind === "coach" && !privacy.allowCoachFollows) return null;
  if (privacy.isPrivate) return "pending";
  return "accepted";
}

export function assertFollowEdgeShape(
  edge: Pick<
    SocialFollowEdge,
    "targetKind" | "targetAthleteProfileId" | "targetCoachUserId" | "status"
  >,
): { ok: true } | { ok: false; error: string } {
  if (
    !(SOCIAL_FOLLOW_TARGET_KINDS as readonly string[]).includes(edge.targetKind)
  ) {
    return { ok: false, error: "Unknown follow target kind." };
  }
  if (!isValidFollowTarget(edge)) {
    return {
      ok: false,
      error: "Follow target ids must match athlete vs coach kind.",
    };
  }
  if (normalizeFollowStatus(edge.status) == null) {
    return { ok: false, error: "Invalid follow status." };
  }
  return { ok: true };
}

/**
 * Hard gate: do not launch full social feed unless moderation is ready
 * and the live feed flag is explicitly on.
 */
export function evaluateSocialFeedLaunchGate(
  input: SocialFeedLaunchInput,
): SocialFeedLaunchGate {
  const checklist = SOCIAL_FEED_MODERATION_CHECKLIST.map((item) => {
    switch (item.id) {
      case "content_moderation_flag":
        return {
          id: item.id,
          label: item.label,
          ok: input.contentModerationEnabled,
          detail: input.contentModerationEnabled
            ? "contentModeration flag is on."
            : "Enable content moderation before a social feed.",
        };
      case "report_queue":
        return {
          id: item.id,
          label: item.label,
          ok: input.reportQueueAvailable,
          detail: input.reportQueueAvailable
            ? "Report queue service is available."
            : "Report queue must be wired and staffed.",
        };
      case "social_target_in_moderation":
        return {
          id: item.id,
          label: item.label,
          ok: input.moderationCoversUserGeneratedContent,
          detail: input.moderationCoversUserGeneratedContent
            ? "UGC / social-capable surface is in moderation targets."
            : "Add social/UGC to moderation coverage.",
        };
      case "block_mute_contract":
        return {
          id: item.id,
          label: item.label,
          ok: true,
          detail: "blocked follow status is part of the graph contract.",
        };
      case "feed_flag_explicit":
        return {
          id: item.id,
          label: item.label,
          ok: input.socialActivityFeedEnabled,
          detail: input.socialActivityFeedEnabled
            ? "socialActivityFeed is ON."
            : "socialActivityFeed stays OFF until intentionally enabled.",
        };
      default:
        return {
          id: item.id,
          label: item.label,
          ok: false,
          detail: "Unknown checklist item.",
        };
    }
  });

  const blockers = checklist.filter((c) => !c.ok).map((c) => c.detail);
  const prepOk = input.socialGraphPrepEnabled;
  const mayLaunchFullFeed =
    prepOk && checklist.every((c) => c.ok) && blockers.length === 0;

  return {
    mayLaunchFullFeed,
    checklist,
    blockers: prepOk
      ? blockers
      : ["Social graph prep flag is off.", ...blockers],
    honesty:
      "Full activity feed launch is blocked until moderation readiness and the feed flag are satisfied.",
  };
}
