/**
 * Multi-athlete coach dashboard attention (Prompt 86).
 * Prioritize by urgency — never invent athletes or overwhelm the coach.
 */

export const COACH_DASHBOARD_ENGINE_VERSION = "coach_multi_athlete.v1" as const;

/** Cap so the queue stays scannable. */
export const COACH_ATTENTION_MAX_ITEMS = 10;
/** At most this many items per athlete in the queue. */
export const COACH_ATTENTION_MAX_PER_ATHLETE = 2;

export const COACH_ATTENTION_CATEGORIES = [
  "missed_training",
  "performance_decline",
  "technique_regression",
  "competition_approaching",
  "new_pr",
  "incomplete_checkin",
] as const;
export type CoachAttentionCategory =
  (typeof COACH_ATTENTION_CATEGORIES)[number];

export const COACH_ATTENTION_CATEGORY_LABELS: Record<
  CoachAttentionCategory,
  string
> = {
  missed_training: "Missed training",
  performance_decline: "Performance decline",
  technique_regression: "Technique regression",
  competition_approaching: "Competition approaching",
  new_pr: "New PR",
  incomplete_checkin: "Incomplete check-in",
};

export const COACH_ATTENTION_URGENCY = [
  "critical",
  "high",
  "medium",
  "low",
] as const;
export type CoachAttentionUrgency = (typeof COACH_ATTENTION_URGENCY)[number];

/** Higher = more urgent (for sort). */
export const COACH_ATTENTION_URGENCY_SCORE: Record<
  CoachAttentionUrgency,
  number
> = {
  critical: 100,
  high: 75,
  medium: 50,
  low: 25,
};

export const COACH_MULTI_ATHLETE_HONESTY = [
  "Only athletes with an active access grant appear here — never a browseable directory.",
  "Attention items are ranked by urgency so the queue stays short; quieter athletes stay in the roster without noise.",
  "Recovery and check-in signals appear only when the athlete granted recovery scope.",
  "Positive signals (new PRs) are labelled clearly and never crowd out higher-urgency issues.",
] as const;

export function isCoachAttentionCategory(
  value: string,
): value is CoachAttentionCategory {
  return (COACH_ATTENTION_CATEGORIES as readonly string[]).includes(value);
}
