export {
  SMART_NOTIFICATION_ENGINE_VERSION,
  NOTIFICATION_KINDS,
  NOTIFICATION_KIND_LABELS,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_FREQUENCIES,
  NOTIFICATION_FREQUENCY_LABELS,
  NOTIFICATION_DEFAULT_MAX_PER_DAY,
  NOTIFICATION_KIND_COOLDOWN_HOURS,
  COMPETITION_COUNTDOWN_DAYS,
  TECHNIQUE_REANALYSIS_AFTER_DAYS,
  SMART_NOTIFICATION_HONESTY,
  isNotificationKind,
  isNotificationFrequency,
} from "@/domain/notifications/constants";
export type {
  NotificationKind,
  NotificationChannel,
  NotificationFrequency,
} from "@/domain/notifications/constants";

export type {
  NotificationPreferenceState,
  SmartNotificationCandidate,
  NotificationDeliveryRecord,
  SmartNotificationSignals,
  AssembledSmartNotifications,
} from "@/domain/notifications/types";

export {
  defaultNotificationPreferences,
  enabledChannels,
  buildNotificationCandidates,
  filterNotificationsForDelivery,
  assembleSmartNotifications,
  isRecoveryTrendDeclining,
} from "@/domain/notifications/assemble";
