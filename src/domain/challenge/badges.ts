/**
 * Challenge completion badges — awarded only when progress meets target.
 */

import type { BadgeVariant } from "@/design-system/components/Badge";
import type { ChallengeRewardPillar } from "@/domain/challenge/constants";

export type ChallengeBadgeId =
  | "badge_30_day_technique"
  | "badge_100_workouts"
  | "badge_deadlift_technique"
  | "badge_academy_sprint";

export type ChallengeCompletionBadge = {
  id: ChallengeBadgeId;
  label: string;
  variant: BadgeVariant;
  pillar: ChallengeRewardPillar;
  description: string;
};

export const CHALLENGE_BADGE_CATALOG: Record<
  ChallengeBadgeId,
  Omit<ChallengeCompletionBadge, "id">
> = {
  badge_30_day_technique: {
    label: "30-Day Technique",
    variant: "info",
    pillar: "consistency",
    description: "Completed the 30-Day Technique Challenge.",
  },
  badge_100_workouts: {
    label: "100 Workouts",
    variant: "accent",
    pillar: "consistency",
    description: "Completed 100 training sessions.",
  },
  badge_deadlift_technique: {
    label: "Deadlift Technique",
    variant: "success",
    pillar: "improvement",
    description: "Improved deadlift technique score by the challenge target.",
  },
  badge_academy_sprint: {
    label: "Learning Sprint",
    variant: "info",
    pillar: "learning",
    description: "Completed the Academy Learning Sprint.",
  },
};

export function getChallengeBadge(
  id: string,
): ChallengeCompletionBadge | null {
  if (id in CHALLENGE_BADGE_CATALOG) {
    const key = id as ChallengeBadgeId;
    return { id: key, ...CHALLENGE_BADGE_CATALOG[key] };
  }
  return null;
}

export function resolveCompletionBadge(
  badgeId: string,
  completed: boolean,
): ChallengeCompletionBadge | null {
  if (!completed) return null;
  return getChallengeBadge(badgeId);
}
