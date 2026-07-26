/**
 * Challenge Engine (Prompt 78).
 * Rewards consistency, learning, and improvement — never max-daily-lift races.
 */

export const CHALLENGE_REWARD_PILLARS = [
  "consistency",
  "learning",
  "improvement",
] as const;
export type ChallengeRewardPillar =
  (typeof CHALLENGE_REWARD_PILLARS)[number];

export const CHALLENGE_METRIC_KINDS = [
  /** Distinct days with a technique analysis in the window. */
  "technique_day_streak",
  /** Completed training sessions (lifetime or window). */
  "completed_sessions",
  /** Positive technique score delta for a lift focus. */
  "technique_score_delta",
  /** Academy lessons completed during enrollment. */
  "academy_lessons_completed",
] as const;
export type ChallengeMetricKind = (typeof CHALLENGE_METRIC_KINDS)[number];

export const CHALLENGE_ENROLLMENT_STATUSES = [
  "active",
  "completed",
  "abandoned",
] as const;
export type ChallengeEnrollmentStatus =
  (typeof CHALLENGE_ENROLLMENT_STATUSES)[number];

/** Challenge kinds we refuse to ship — safety. */
export const CHALLENGE_FORBIDDEN_KINDS = [
  "max_daily_lift",
  "daily_1rm",
  "max_load_race",
  "every_day_pr",
  "bodyweight_cut_race",
  "recovery_score_race",
] as const;

export const CHALLENGE_HONESTY = [
  "Challenges reward consistency, learning, and improvement — not max-load or daily 1RM races.",
  "Leaderboards are optional per challenge and off by default.",
  "Completion badges are earned only when real progress meets the target — never invented.",
  "Do not chase unsafe loads to finish a challenge.",
] as const;

export const PILLAR_LABELS: Record<ChallengeRewardPillar, string> = {
  consistency: "Consistency",
  learning: "Learning",
  improvement: "Improvement",
};

export function isChallengeRewardPillar(
  value: string,
): value is ChallengeRewardPillar {
  return (CHALLENGE_REWARD_PILLARS as readonly string[]).includes(value);
}

export function isChallengeMetricKind(
  value: string,
): value is ChallengeMetricKind {
  return (CHALLENGE_METRIC_KINDS as readonly string[]).includes(value);
}

export function isForbiddenChallengeKind(kind: string): boolean {
  const k = kind.toLowerCase().replace(/\s+/g, "_");
  return (CHALLENGE_FORBIDDEN_KINDS as readonly string[]).some(
    (f) => k === f || k.includes(f),
  );
}
