/**
 * Behavioral Retention System (Prompt 102).
 * Ethical follow-through loops — never dark patterns; planned rest is success.
 */

export const BEHAVIORAL_RETENTION_ENGINE_VERSION =
  "behavioral_retention.v1" as const;

export const RETENTION_LOOP_IDS = [
  "workout_streak",
  "weekly_review",
  "goal_progress",
  "technique_improvement",
] as const;
export type RetentionLoopId = (typeof RETENTION_LOOP_IDS)[number];

export const RETENTION_LOOP_LABELS: Record<RetentionLoopId, string> = {
  workout_streak: "Workout follow-through",
  weekly_review: "Weekly review",
  goal_progress: "Goal progress",
  technique_improvement: "Technique improvement",
};

/** Day resolutions for ethical streak math. */
export const RETENTION_DAY_RESOLUTIONS = [
  "completed",
  "planned_rest",
  "missed",
  "in_progress",
  "empty",
] as const;
export type RetentionDayResolution =
  (typeof RETENTION_DAY_RESOLUTIONS)[number];

export const RETENTION_LOOP_STATUSES = [
  "on_track",
  "needs_attention",
  "celebrating",
  "insufficient_data",
] as const;
export type RetentionLoopStatus = (typeof RETENTION_LOOP_STATUSES)[number];

/**
 * Manipulative patterns we refuse — aligned with achievements / athlete-level.
 */
export const RETENTION_FORBIDDEN_PATTERNS = [
  "streak_guilt",
  "lose_your_streak",
  "punish_rest",
  "skip_recovery",
  "daily_login_points",
  "countdown_to_shame",
  "fake_urgency",
  "dark_pattern",
] as const;

export const BEHAVIORAL_RETENTION_HONESTY = [
  "Retention loops help you follow through on your plan — they never invent urgency or shame.",
  "Planned rest days count as follow-through. Rest is not a streak failure.",
  "Missed planned sessions can be rescheduled without punishment language.",
  "No dark patterns: no fake timers, no “lose your streak” guilt, no points for opening the app.",
] as const;

export const DEFAULT_RETENTION_LOOKBACK_DAYS = 28;

/** Soft encouragement copy — never guilt. */
export const RETENTION_SOFT_NUDGES = {
  missed:
    "A planned session was skipped — reschedule when it fits. No penalty for rest days.",
  rest_ok:
    "Planned rest counts. Recovery is part of following the plan.",
  weekly_review:
    "Your weekly review is ready when you want a calm check-in — not a grade.",
  goal:
    "Small logged progress toward your goal is enough to keep the loop honest.",
  technique:
    "Technique improvement shows when comparable analyses exist — never invented.",
} as const;
