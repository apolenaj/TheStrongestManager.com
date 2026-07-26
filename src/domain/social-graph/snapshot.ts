import {
  SOCIAL_ACCOUNT_DEFAULT_PRIVATE,
  SOCIAL_ACTIVITY_KINDS,
  SOCIAL_ACTIVITY_KIND_LABELS,
  SOCIAL_FOLLOW_STATUSES,
  SOCIAL_FOLLOW_STATUS_LABELS,
  SOCIAL_FOLLOW_TARGET_KINDS,
  SOCIAL_FOLLOW_TARGET_LABELS,
  SOCIAL_GRAPH_ENGINE_VERSION,
  SOCIAL_GRAPH_HONESTY,
} from "@/domain/social-graph/constants";
import { evaluateSocialFeedLaunchGate } from "@/domain/social-graph/gates";
import type {
  SocialFeedLaunchInput,
  SocialGraphSnapshot,
} from "@/domain/social-graph/types";

export function buildSocialGraphSnapshot(
  launchInput: SocialFeedLaunchInput,
  generatedAt: string = new Date().toISOString(),
): SocialGraphSnapshot {
  return {
    engineVersion: SOCIAL_GRAPH_ENGINE_VERSION,
    honesty: SOCIAL_GRAPH_HONESTY,
    followTargets: SOCIAL_FOLLOW_TARGET_KINDS.map((id) => ({
      id,
      label: SOCIAL_FOLLOW_TARGET_LABELS[id],
    })),
    followStatuses: SOCIAL_FOLLOW_STATUSES.map((id) => ({
      id,
      label: SOCIAL_FOLLOW_STATUS_LABELS[id],
    })),
    activityKinds: SOCIAL_ACTIVITY_KINDS.map((id) => ({
      id,
      label: SOCIAL_ACTIVITY_KIND_LABELS[id],
    })),
    defaultPrivate: SOCIAL_ACCOUNT_DEFAULT_PRIVATE,
    launchGate: evaluateSocialFeedLaunchGate(launchInput),
    docPath: "docs/SOCIAL_GRAPH.md",
    generatedAt,
  };
}
