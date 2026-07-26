/**
 * Built-in community challenges — code catalog (Prompt 78).
 */

import type {
  ChallengeMetricKind,
  ChallengeRewardPillar,
} from "@/domain/challenge/constants";
import { isForbiddenChallengeKind } from "@/domain/challenge/constants";

export type ChallengeDefinition = {
  id: string;
  slug: string;
  title: string;
  description: string;
  rewardPillar: ChallengeRewardPillar;
  metricKind: ChallengeMetricKind;
  /** Target count or delta points depending on metric. */
  targetValue: number;
  /** Challenge window length; null = open-ended until target. */
  durationDays: number | null;
  /** Optional lift/exercise focus key (e.g. deadlift). */
  focusExerciseKey: string | null;
  /** Opt-in board — default false. */
  leaderboardEnabled: boolean;
  completionBadgeId: string;
  /** Forbidden-kind guard tag — must never match forbidden list. */
  safetyKind: string;
};

export const CHALLENGE_CATALOG: readonly ChallengeDefinition[] = [
  {
    id: "chal_30_day_technique",
    slug: "30-day-technique",
    title: "30-Day Technique Challenge",
    description:
      "Log technique work on 20 distinct days within 30 days. Builds a filming habit — not heavier singles.",
    rewardPillar: "consistency",
    metricKind: "technique_day_streak",
    targetValue: 20,
    durationDays: 30,
    focusExerciseKey: null,
    leaderboardEnabled: false,
    completionBadgeId: "badge_30_day_technique",
    safetyKind: "technique_habit",
  },
  {
    id: "chal_100_workout_consistency",
    slug: "100-workout-consistency",
    title: "100 Workout Consistency Challenge",
    description:
      "Complete 100 training sessions. Pace yourself — consistency over intensity spikes.",
    rewardPillar: "consistency",
    metricKind: "completed_sessions",
    targetValue: 100,
    durationDays: null,
    focusExerciseKey: null,
    leaderboardEnabled: true,
    completionBadgeId: "badge_100_workouts",
    safetyKind: "session_consistency",
  },
  {
    id: "chal_deadlift_technique_improvement",
    slug: "deadlift-technique-improvement",
    title: "Deadlift Technique Improvement Challenge",
    description:
      "Improve your deadlift technique score by at least 5 points across analyses in a 28-day window.",
    rewardPillar: "improvement",
    metricKind: "technique_score_delta",
    targetValue: 5,
    durationDays: 28,
    focusExerciseKey: "deadlift",
    leaderboardEnabled: false,
    completionBadgeId: "badge_deadlift_technique",
    safetyKind: "technique_improvement",
  },
  {
    id: "chal_academy_learning_sprint",
    slug: "academy-learning-sprint",
    title: "Academy Learning Sprint",
    description:
      "Complete 5 academy lessons while enrolled. Rewards learning, not load.",
    rewardPillar: "learning",
    metricKind: "academy_lessons_completed",
    targetValue: 5,
    durationDays: 21,
    focusExerciseKey: null,
    leaderboardEnabled: false,
    completionBadgeId: "badge_academy_sprint",
    safetyKind: "learning_lessons",
  },
] as const;

export function getChallengeById(
  id: string,
): ChallengeDefinition | undefined {
  return CHALLENGE_CATALOG.find((c) => c.id === id);
}

export function getChallengeBySlug(
  slug: string,
): ChallengeDefinition | undefined {
  return CHALLENGE_CATALOG.find((c) => c.slug === slug);
}

export function assertCatalogSafety(): void {
  for (const c of CHALLENGE_CATALOG) {
    if (isForbiddenChallengeKind(c.safetyKind)) {
      throw new Error(`Forbidden challenge in catalog: ${c.id}`);
    }
    if (isForbiddenChallengeKind(c.slug)) {
      throw new Error(`Forbidden challenge slug: ${c.slug}`);
    }
  }
}
