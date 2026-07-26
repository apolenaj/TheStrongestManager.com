import type {
  NotificationChannel,
  NotificationFrequency,
  NotificationKind,
} from "@/domain/notifications/constants";

export type NotificationPreferenceState = {
  inAppEnabled: boolean;
  emailEnabled: boolean;
  /** Stored for future device push — delivery is not active without a registry. */
  pushEnabled: boolean;
  frequency: NotificationFrequency;
  kinds: Record<NotificationKind, boolean>;
  maxPerDay: number;
};

export type SmartNotificationCandidate = {
  kind: NotificationKind;
  title: string;
  body: string;
  href: string | null;
  dedupeKey: string;
  priority: number;
  relatedType: string | null;
  relatedId: string | null;
};

export type NotificationDeliveryRecord = {
  kind: NotificationKind;
  dedupeKey: string;
  createdAt: Date;
};

export type SmartNotificationSignals = {
  now: Date;
  /** ISO date yyyy-mm-dd in the athlete’s IANA timezone. */
  todayKey: string;
  /** IANA timezone used for todayKey and day-bounded delivery caps. */
  timeZone: string;
  workoutToday: {
    hasPlannedOrInProgress: boolean;
    sessionId: string | null;
    title: string | null;
  };
  technique: {
    lastCompletedAt: Date | null;
    analysisId: string | null;
  };
  competition: {
    prepId: string | null;
    name: string | null;
    daysUntil: number | null;
  };
  weeklyReview: {
    weekKey: string | null;
    reviewId: string | null;
    summary: string | null;
    createdAt: Date | null;
  };
  recovery: {
    /** True when recent readiness mean is clearly below prior window. */
    trendDeclining: boolean;
    recentMean: number | null;
    priorMean: number | null;
  };
  recentPr: {
    metricKey: string | null;
    label: string | null;
    valueLabel: string | null;
    recordedAt: Date | null;
    metricId: string | null;
  };
};

export type AssembledSmartNotifications = {
  engineVersion: string;
  generatedAtIso: string;
  candidates: SmartNotificationCandidate[];
  /** After preference + anti-spam filters. */
  accepted: SmartNotificationCandidate[];
  suppressed: Array<{
    kind: NotificationKind;
    dedupeKey: string;
    reason: string;
  }>;
  channelsForDelivery: NotificationChannel[];
  honesty: readonly string[];
};
