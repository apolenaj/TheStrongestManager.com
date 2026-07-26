/**
 * Smart Notification System (Prompt 101).
 * Useful, preference-gated alerts — avoid spam; never fabricate events.
 */

export const SMART_NOTIFICATION_ENGINE_VERSION = "smart_notifications.v1" as const;

export const NOTIFICATION_KINDS = [
  "workout_today",
  "technique_reanalysis_due",
  "competition_countdown",
  "weekly_review_ready",
  "recovery_trend_declining",
  "pr_achieved",
  "coach_message",
] as const;
export type NotificationKind = (typeof NOTIFICATION_KINDS)[number];

export const NOTIFICATION_KIND_LABELS: Record<NotificationKind, string> = {
  workout_today: "Workout today",
  technique_reanalysis_due: "Technique re-analysis due",
  competition_countdown: "Competition countdown",
  weekly_review_ready: "Weekly review ready",
  recovery_trend_declining: "Recovery trend declining",
  pr_achieved: "PR achieved",
  coach_message: "Coach message",
};

export const NOTIFICATION_CHANNELS = ["in_app", "email", "push"] as const;
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export const NOTIFICATION_FREQUENCIES = [
  "realtime",
  "daily_digest",
  "weekly_digest",
  "muted",
] as const;
export type NotificationFrequency = (typeof NOTIFICATION_FREQUENCIES)[number];

export const NOTIFICATION_FREQUENCY_LABELS: Record<
  NotificationFrequency,
  string
> = {
  realtime: "Realtime (as events happen)",
  daily_digest: "Daily digest",
  weekly_digest: "Weekly digest",
  muted: "Muted (no new alerts)",
};

/** Default anti-spam caps. */
export const NOTIFICATION_DEFAULT_MAX_PER_DAY = 5;

/**
 * Minimum hours between another notification of the same kind
 * (competition uses milestone days instead).
 */
export const NOTIFICATION_KIND_COOLDOWN_HOURS: Record<NotificationKind, number> =
  {
    workout_today: 20,
    technique_reanalysis_due: 168, // 7 days
    competition_countdown: 20,
    weekly_review_ready: 120, // ~5 days
    recovery_trend_declining: 72, // 3 days
    pr_achieved: 1,
    coach_message: 0,
  };

/** Competition milestones (days remaining) that may notify. */
export const COMPETITION_COUNTDOWN_DAYS = [14, 7, 3, 1] as const;

export const TECHNIQUE_REANALYSIS_AFTER_DAYS = 28;

export const SMART_NOTIFICATION_HONESTY = [
  "Notifications are generated only from real training signals — never invented events.",
  "Channel and frequency preferences are athlete-controlled; push stays off until a device registry exists.",
  "Anti-spam caps and per-kind cooldowns limit volume; muted frequency blocks new alerts.",
] as const;

export function isNotificationKind(value: string): value is NotificationKind {
  return (NOTIFICATION_KINDS as readonly string[]).includes(value);
}

export function isNotificationFrequency(
  value: string,
): value is NotificationFrequency {
  return (NOTIFICATION_FREQUENCIES as readonly string[]).includes(value);
}
