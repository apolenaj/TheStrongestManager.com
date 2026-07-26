import { featureFlags } from "@/config/feature-flags";
import { CONTENT_MODERATION_TARGETS } from "@/domain/content-moderation";
import type { SocialFeedLaunchInput } from "@/domain/social-graph/types";

/** Architecture console + contracts when prep flag is on. */
export function isSocialGraphPrepEnabled(): boolean {
  return featureFlags.socialGraphPrep;
}

/**
 * Live follows / full feed product surface.
 * Defaults off — do not treat prep as a launched social network.
 */
export function isSocialActivityFeedFlagOn(): boolean {
  return featureFlags.socialActivityFeed;
}

export function buildSocialFeedLaunchInputFromFlags(): SocialFeedLaunchInput {
  return {
    socialGraphPrepEnabled: featureFlags.socialGraphPrep,
    socialActivityFeedEnabled: featureFlags.socialActivityFeed,
    contentModerationEnabled: featureFlags.contentModeration,
    moderationCoversUserGeneratedContent: (
      CONTENT_MODERATION_TARGETS as readonly string[]
    ).includes("user_generated_content"),
    /** Queue service ships with content moderation — not invented reports. */
    reportQueueAvailable: featureFlags.contentModeration,
  };
}
