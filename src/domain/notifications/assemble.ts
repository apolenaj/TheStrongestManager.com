/**
 * Build useful notification candidates and apply preference + anti-spam filters.
 */

import {
  COMPETITION_COUNTDOWN_DAYS,
  NOTIFICATION_DEFAULT_MAX_PER_DAY,
  NOTIFICATION_KIND_COOLDOWN_HOURS,
  NOTIFICATION_KIND_LABELS,
  SMART_NOTIFICATION_ENGINE_VERSION,
  SMART_NOTIFICATION_HONESTY,
  TECHNIQUE_REANALYSIS_AFTER_DAYS,
  type NotificationChannel,
  type NotificationKind,
} from "@/domain/notifications/constants";
import type {
  AssembledSmartNotifications,
  NotificationDeliveryRecord,
  NotificationPreferenceState,
  SmartNotificationCandidate,
  SmartNotificationSignals,
} from "@/domain/notifications/types";
import { startOfZonedDay } from "@/domain/timezone-system";

function daysBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}

function hoursBetween(from: Date, to: Date): number {
  return (to.getTime() - from.getTime()) / (3600 * 1000);
}

export function defaultNotificationPreferences(): NotificationPreferenceState {
  return {
    inAppEnabled: true,
    emailEnabled: false,
    pushEnabled: false,
    frequency: "realtime",
    kinds: {
      workout_today: true,
      technique_reanalysis_due: true,
      competition_countdown: true,
      weekly_review_ready: true,
      recovery_trend_declining: true,
      pr_achieved: true,
      coach_message: true,
    },
    maxPerDay: NOTIFICATION_DEFAULT_MAX_PER_DAY,
  };
}

/** Channels the athlete currently allows (push recorded but not delivered yet). */
export function enabledChannels(
  prefs: NotificationPreferenceState,
): NotificationChannel[] {
  const channels: NotificationChannel[] = [];
  if (prefs.inAppEnabled) channels.push("in_app");
  if (prefs.emailEnabled) channels.push("email");
  if (prefs.pushEnabled) channels.push("push");
  return channels;
}

export function buildNotificationCandidates(
  signals: SmartNotificationSignals,
): SmartNotificationCandidate[] {
  const out: SmartNotificationCandidate[] = [];

  if (signals.workoutToday.hasPlannedOrInProgress) {
    out.push({
      kind: "workout_today",
      title: "Workout today",
      body: signals.workoutToday.title
        ? `“${signals.workoutToday.title}” is on your plan for today.`
        : "You have a workout planned or in progress today.",
      href: "/app/today",
      dedupeKey: `workout_today:${signals.todayKey}`,
      priority: 80,
      relatedType: signals.workoutToday.sessionId ? "training_session" : null,
      relatedId: signals.workoutToday.sessionId,
    });
  }

  if (signals.technique.lastCompletedAt) {
    const age = daysBetween(signals.technique.lastCompletedAt, signals.now);
    if (age >= TECHNIQUE_REANALYSIS_AFTER_DAYS) {
      out.push({
        kind: "technique_reanalysis_due",
        title: "Technique re-analysis due",
        body: `Last completed analysis was about ${age} days ago — upload a fresh video when ready.`,
        href: "/app/technique",
        dedupeKey: `technique_reanalysis:${signals.todayKey.slice(0, 7)}`,
        priority: 55,
        relatedType: signals.technique.analysisId
          ? "technique_analysis"
          : null,
        relatedId: signals.technique.analysisId,
      });
    }
  }

  if (
    signals.competition.daysUntil != null &&
    signals.competition.prepId &&
    (COMPETITION_COUNTDOWN_DAYS as readonly number[]).includes(
      signals.competition.daysUntil,
    )
  ) {
    const days = signals.competition.daysUntil;
    const name = signals.competition.name ?? "Competition";
    out.push({
      kind: "competition_countdown",
      title:
        days === 14
          ? "Competition in 14 days"
          : `Competition in ${days} day${days === 1 ? "" : "s"}`,
      body: `${name} is ${days} day${days === 1 ? "" : "s"} away — review prep cues when ready.`,
      href: "/app/competition",
      dedupeKey: `competition:${signals.competition.prepId}:${days}`,
      priority: 90,
      relatedType: "competition_prep",
      relatedId: signals.competition.prepId,
    });
  }

  if (signals.weeklyReview.reviewId && signals.weeklyReview.weekKey) {
    out.push({
      kind: "weekly_review_ready",
      title: "Weekly review ready",
      body: signals.weeklyReview.summary
        ? signals.weeklyReview.summary
        : `Your review for ${signals.weeklyReview.weekKey} is ready.`,
      href: "/app/weekly-review",
      dedupeKey: `weekly_review:${signals.weeklyReview.weekKey}`,
      priority: 70,
      relatedType: "weekly_review",
      relatedId: signals.weeklyReview.reviewId,
    });
  }

  if (
    signals.recovery.trendDeclining &&
    signals.recovery.recentMean != null &&
    signals.recovery.priorMean != null
  ) {
    out.push({
      kind: "recovery_trend_declining",
      title: "Recovery trend declining",
      body: `Recent readiness (~${signals.recovery.recentMean.toFixed(0)}) is below your prior window (~${signals.recovery.priorMean.toFixed(0)}). Check recovery logs — not a diagnosis.`,
      href: "/app/recovery",
      dedupeKey: `recovery_declining:${signals.todayKey}`,
      priority: 65,
      relatedType: null,
      relatedId: null,
    });
  }

  if (
    signals.recentPr.metricId &&
    signals.recentPr.label &&
    signals.recentPr.valueLabel
  ) {
    out.push({
      kind: "pr_achieved",
      title: "PR achieved",
      body: `${signals.recentPr.label}: ${signals.recentPr.valueLabel}.`,
      href: "/app/prs",
      dedupeKey: `pr:${signals.recentPr.metricId}`,
      priority: 95,
      relatedType: "progress_metric",
      relatedId: signals.recentPr.metricId,
    });
  }

  return out.sort((a, b) => b.priority - a.priority);
}

function kindAllowed(
  kind: NotificationKind,
  prefs: NotificationPreferenceState,
): boolean {
  return prefs.kinds[kind] !== false;
}

function cooldownBlocks(
  candidate: SmartNotificationCandidate,
  recent: NotificationDeliveryRecord[],
  now: Date,
): boolean {
  const cooldown = NOTIFICATION_KIND_COOLDOWN_HOURS[candidate.kind];
  const last = recent
    .filter((r) => r.kind === candidate.kind)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
  if (!last) return false;
  return hoursBetween(last.createdAt, now) < cooldown;
}

/**
 * Preference + anti-spam filter. Does not invent notifications.
 */
export function filterNotificationsForDelivery(
  candidates: SmartNotificationCandidate[],
  prefs: NotificationPreferenceState,
  recent: NotificationDeliveryRecord[],
  now: Date,
  timeZone: string = "UTC",
): {
  accepted: SmartNotificationCandidate[];
  suppressed: AssembledSmartNotifications["suppressed"];
} {
  const suppressed: AssembledSmartNotifications["suppressed"] = [];
  const accepted: SmartNotificationCandidate[] = [];

  if (prefs.frequency === "muted") {
    for (const c of candidates) {
      suppressed.push({
        kind: c.kind,
        dedupeKey: c.dedupeKey,
        reason: "Frequency is muted.",
      });
    }
    return { accepted, suppressed };
  }

  if (!prefs.inAppEnabled && !prefs.emailEnabled && !prefs.pushEnabled) {
    for (const c of candidates) {
      suppressed.push({
        kind: c.kind,
        dedupeKey: c.dedupeKey,
        reason: "All channels disabled.",
      });
    }
    return { accepted, suppressed };
  }

  const alreadyHave = new Set(recent.map((r) => r.dedupeKey));
  const startOfDay = startOfZonedDay(now, timeZone);
  const deliveredToday = recent.filter((r) => r.createdAt >= startOfDay).length;
  const maxPerDay = Math.max(
    1,
    prefs.maxPerDay || NOTIFICATION_DEFAULT_MAX_PER_DAY,
  );

  const digestOk = (kind: NotificationKind): boolean => {
    if (prefs.frequency === "realtime") return true;
    if (prefs.frequency === "daily_digest") {
      return (
        kind === "pr_achieved" ||
        kind === "competition_countdown" ||
        kind === "weekly_review_ready" ||
        kind === "workout_today" ||
        kind === "coach_message"
      );
    }
    return (
      kind === "pr_achieved" ||
      kind === "weekly_review_ready" ||
      kind === "competition_countdown" ||
      kind === "coach_message"
    );
  };

  let slot = Math.max(0, maxPerDay - deliveredToday);

  for (const c of candidates) {
    if (!kindAllowed(c.kind, prefs)) {
      suppressed.push({
        kind: c.kind,
        dedupeKey: c.dedupeKey,
        reason: `${NOTIFICATION_KIND_LABELS[c.kind]} disabled in preferences.`,
      });
      continue;
    }
    if (!digestOk(c.kind)) {
      suppressed.push({
        kind: c.kind,
        dedupeKey: c.dedupeKey,
        reason: `Held for ${prefs.frequency} frequency.`,
      });
      continue;
    }
    if (alreadyHave.has(c.dedupeKey)) {
      suppressed.push({
        kind: c.kind,
        dedupeKey: c.dedupeKey,
        reason: "Already delivered (dedupe).",
      });
      continue;
    }
    if (cooldownBlocks(c, recent, now)) {
      suppressed.push({
        kind: c.kind,
        dedupeKey: c.dedupeKey,
        reason: "Per-kind cooldown (anti-spam).",
      });
      continue;
    }
    if (slot <= 0) {
      suppressed.push({
        kind: c.kind,
        dedupeKey: c.dedupeKey,
        reason: `Daily cap (${maxPerDay}) reached.`,
      });
      continue;
    }
    accepted.push(c);
    slot -= 1;
  }

  return { accepted, suppressed };
}

export function assembleSmartNotifications(input: {
  signals: SmartNotificationSignals;
  prefs: NotificationPreferenceState;
  recent: NotificationDeliveryRecord[];
}): AssembledSmartNotifications {
  const candidates = buildNotificationCandidates(input.signals);
  const { accepted, suppressed } = filterNotificationsForDelivery(
    candidates,
    input.prefs,
    input.recent,
    input.signals.now,
    input.signals.timeZone ?? "UTC",
  );

  return {
    engineVersion: SMART_NOTIFICATION_ENGINE_VERSION,
    generatedAtIso: input.signals.now.toISOString(),
    candidates,
    accepted,
    suppressed,
    channelsForDelivery: enabledChannels(input.prefs),
    honesty: SMART_NOTIFICATION_HONESTY,
  };
}

/** Detect declining readiness: recent mean at least 8pts below prior window. */
export function isRecoveryTrendDeclining(
  recentValues: number[],
  priorValues: number[],
): { declining: boolean; recentMean: number | null; priorMean: number | null } {
  if (recentValues.length < 2 || priorValues.length < 2) {
    return { declining: false, recentMean: null, priorMean: null };
  }
  const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
  const recentMean = mean(recentValues);
  const priorMean = mean(priorValues);
  return {
    declining: recentMean <= priorMean - 8,
    recentMean: Math.round(recentMean * 10) / 10,
    priorMean: Math.round(priorMean * 10) / 10,
  };
}
