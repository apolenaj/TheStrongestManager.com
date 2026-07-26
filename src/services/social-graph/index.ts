import {
  buildSocialGraphSnapshot,
  evaluateSocialFeedLaunchGate,
  type SocialActivityItem,
  type SocialGraphSnapshot,
} from "@/domain/social-graph";
import { buildSocialFeedLaunchInputFromFlags } from "@/domain/social-graph/flags";

export function getSocialGraphSnapshot(): SocialGraphSnapshot {
  return buildSocialGraphSnapshot(buildSocialFeedLaunchInputFromFlags());
}

export type SocialActivityFeedResult = {
  items: SocialActivityItem[];
  mayLaunchFullFeed: boolean;
  blockers: string[];
  honesty: string;
};

/**
 * Activity feed reader — returns empty items unless the moderation launch
 * gate allows a full feed. Never invents posts or follower activity.
 */
export function listSocialActivityFeed(_viewerUserId: string): SocialActivityFeedResult {
  const input = buildSocialFeedLaunchInputFromFlags();
  const gate = evaluateSocialFeedLaunchGate(input);

  if (!gate.mayLaunchFullFeed) {
    return {
      items: [],
      mayLaunchFullFeed: false,
      blockers: gate.blockers,
      honesty:
        "Activity feed is not live. Empty list means no launched feed — not missing posts.",
    };
  }

  // Persistence for activity events is not shipped yet — still return empty.
  return {
    items: [],
    mayLaunchFullFeed: true,
    blockers: [],
    honesty:
      "Feed gate open, but no activity events are stored yet — empty is honest.",
  };
}
