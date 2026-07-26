/**
 * Smart notifications — gather signals, sync inbox, preferences, email opt-in.
 */

import { featureFlags } from "@/config/feature-flags";
import {
  NOTIFICATION_KINDS,
  SMART_NOTIFICATION_ENGINE_VERSION,
  assembleSmartNotifications,
  defaultNotificationPreferences,
  isNotificationFrequency,
  isRecoveryTrendDeclining,
  type NotificationFrequency,
  type NotificationKind,
  type NotificationPreferenceState,
  type SmartNotificationSignals,
} from "@/domain/notifications";
import {
  daysUntilInTimezone,
  endOfZonedDay,
  normalizeTimezone,
  startOfZonedDay,
  zonedDateKey,
} from "@/domain/timezone-system";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/services/email/send-email";
import { MAJOR_LIFTS } from "@/services/onboarding/options";
import { formatMass, toCanonicalKg } from "@/services/units/convert";

export type InAppNotificationView = {
  id: string;
  kind: string;
  title: string;
  body: string;
  href: string | null;
  status: string;
  createdAt: string;
  priority: number;
};

function todayKey(now: Date, timeZone: string): string {
  return zonedDateKey(now, timeZone);
}

function prefsFromRow(
  row: {
    inAppEnabled: boolean;
    emailEnabled: boolean;
    pushEnabled: boolean;
    frequency: string;
    kindWorkoutToday: boolean;
    kindTechniqueReanalysis: boolean;
    kindCompetitionCountdown: boolean;
    kindWeeklyReview: boolean;
    kindRecoveryTrend: boolean;
    kindPrAchieved: boolean;
    kindCoachMessage: boolean;
    maxPerDay: number;
  } | null,
): NotificationPreferenceState {
  const base = defaultNotificationPreferences();
  if (!row) return base;
  const frequency = isNotificationFrequency(row.frequency)
    ? row.frequency
    : base.frequency;
  return {
    inAppEnabled: row.inAppEnabled,
    emailEnabled: row.emailEnabled,
    pushEnabled: row.pushEnabled,
    frequency,
    kinds: {
      workout_today: row.kindWorkoutToday,
      technique_reanalysis_due: row.kindTechniqueReanalysis,
      competition_countdown: row.kindCompetitionCountdown,
      weekly_review_ready: row.kindWeeklyReview,
      recovery_trend_declining: row.kindRecoveryTrend,
      pr_achieved: row.kindPrAchieved,
      coach_message: row.kindCoachMessage,
    },
    maxPerDay: row.maxPerDay,
  };
}

async function ensurePrefs(athleteProfileId: string) {
  const existing = await prisma.notificationPreference.findUnique({
    where: { athleteProfileId },
  });
  if (existing) return existing;
  return prisma.notificationPreference.create({
    data: { athleteProfileId },
  });
}

async function gatherSignals(
  athleteProfileId: string,
  now: Date,
): Promise<SmartNotificationSignals> {
  const profileTz = await prisma.athleteProfile.findUnique({
    where: { id: athleteProfileId },
    select: { timezone: true },
  });
  const timeZone = normalizeTimezone(profileTz?.timezone);
  const dayStart = startOfZonedDay(now, timeZone);
  const dayEnd = endOfZonedDay(now, timeZone);
  const prWindowStart = new Date(now.getTime() - 48 * 3600 * 1000);

  const [
    todaySession,
    technique,
    competition,
    weeklyReview,
    recoveryEntries,
    recentMetrics,
  ] = await Promise.all([
    prisma.trainingSession.findFirst({
      where: {
        athleteProfileId,
        status: { in: ["planned", "in_progress"] },
        OR: [
          { scheduledAt: { gte: dayStart, lt: dayEnd } },
          { status: "in_progress" },
        ],
      },
      orderBy: [{ status: "desc" }, { scheduledAt: "asc" }],
      select: {
        id: true,
        workoutNameSnapshot: true,
        workout: { select: { name: true } },
      },
    }),
    prisma.techniqueAnalysis.findFirst({
      where: {
        athleteProfileId,
        status: "completed",
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, createdAt: true },
    }),
    prisma.competitionPrep.findFirst({
      where: {
        athleteProfileId,
        status: { in: ["planned", "active"] },
        competitionDate: { gte: dayStart },
      },
      orderBy: { competitionDate: "asc" },
      select: { id: true, name: true, competitionDate: true },
    }),
    prisma.weeklyAthleteReview.findFirst({
      where: { athleteProfileId },
      orderBy: { weekStart: "desc" },
      select: { id: true, weekKey: true, summary: true, createdAt: true },
    }),
    prisma.recoveryEntry.findMany({
      where: {
        athleteProfileId,
        readiness: { not: null },
      },
      orderBy: { recordedAt: "desc" },
      take: 10,
      select: { readiness: true },
    }),
    prisma.progressMetric.findMany({
      where: {
        athleteProfileId,
        recordedAt: { gte: prWindowStart, lt: now },
      },
      orderBy: { recordedAt: "desc" },
      take: 40,
      select: {
        id: true,
        metricKey: true,
        value: true,
        unit: true,
        recordedAt: true,
      },
    }),
  ]);

  const readiness = recoveryEntries
    .map((e) => e.readiness)
    .filter((v): v is number => v != null);
  const recent = readiness.slice(0, 3);
  const prior = readiness.slice(3, 6);
  const trend = isRecoveryTrendDeclining(recent, prior);

  let recentPr: SmartNotificationSignals["recentPr"] = {
    metricKey: null,
    label: null,
    valueLabel: null,
    recordedAt: null,
    metricId: null,
  };

  if (recentMetrics.length > 0) {
    const keys = [...new Set(recentMetrics.map((m) => m.metricKey))];
    const priorBests = await prisma.progressMetric.groupBy({
      by: ["metricKey"],
      where: {
        athleteProfileId,
        metricKey: { in: keys },
        recordedAt: { lt: prWindowStart },
      },
      _max: { value: true },
    });
    const priorMap = new Map(
      priorBests.map((p) => [p.metricKey, p._max.value ?? null]),
    );

    for (const metric of recentMetrics) {
      const prior = priorMap.get(metric.metricKey);
      if (prior != null && metric.value <= prior) continue;
      // Also beat other metrics in the same recent window
      const peers = recentMetrics.filter(
        (m) =>
          m.metricKey === metric.metricKey &&
          m.recordedAt < metric.recordedAt,
      );
      const peerMax = peers.reduce(
        (max, m) => Math.max(max, m.value),
        Number.NEGATIVE_INFINITY,
      );
      if (peers.length > 0 && metric.value <= peerMax) continue;

      const lift = MAJOR_LIFTS.find((l) => l.metricKey === metric.metricKey);
      const label = lift?.label ?? metric.metricKey;
      const valueLabel = lift
        ? formatMass(toCanonicalKg(metric.value, metric.unit ?? "kg"), "kg")
        : `${metric.value}${metric.unit ? ` ${metric.unit}` : ""}`;
      recentPr = {
        metricKey: metric.metricKey,
        label,
        valueLabel,
        recordedAt: metric.recordedAt,
        metricId: metric.id,
      };
      break;
    }
  }

  let daysUntil: number | null = null;
  if (competition) {
    daysUntil = daysUntilInTimezone(
      competition.competitionDate,
      now,
      timeZone,
    );
  }

  // Only surface weekly review if created in the last 3 days (fresh)
  const weeklyFresh =
    weeklyReview &&
    now.getTime() - weeklyReview.createdAt.getTime() < 3 * 24 * 3600 * 1000
      ? weeklyReview
      : null;

  return {
    now,
    todayKey: todayKey(now, timeZone),
    timeZone,
    workoutToday: {
      hasPlannedOrInProgress: Boolean(todaySession),
      sessionId: todaySession?.id ?? null,
      title:
        todaySession?.workoutNameSnapshot ??
        todaySession?.workout?.name ??
        null,
    },
    technique: {
      lastCompletedAt: technique?.createdAt ?? null,
      analysisId: technique?.id ?? null,
    },
    competition: {
      prepId: competition?.id ?? null,
      name: competition?.name ?? null,
      daysUntil,
    },
    weeklyReview: {
      weekKey: weeklyFresh?.weekKey ?? null,
      reviewId: weeklyFresh?.id ?? null,
      summary: weeklyFresh?.summary ?? null,
      createdAt: weeklyFresh?.createdAt ?? null,
    },
    recovery: {
      trendDeclining: trend.declining,
      recentMean: trend.recentMean,
      priorMean: trend.priorMean,
    },
    recentPr,
  };
}

export async function getNotificationPreferences(input: {
  userId: string;
}): Promise<
  | { ok: true; prefs: NotificationPreferenceState }
  | { ok: false; error: string }
> {
  if (!featureFlags.smartNotifications) {
    return { ok: false, error: "Smart notifications are not enabled." };
  }
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: { id: true },
  });
  if (!profile) return { ok: false, error: "Athlete profile required." };
  const row = await ensurePrefs(profile.id);
  return { ok: true, prefs: prefsFromRow(row) };
}

export async function updateNotificationPreferences(input: {
  userId: string;
  inAppEnabled: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  frequency: NotificationFrequency;
  kinds: Record<NotificationKind, boolean>;
  maxPerDay: number;
}): Promise<
  | { ok: true; prefs: NotificationPreferenceState }
  | { ok: false; error: string }
> {
  if (!featureFlags.smartNotifications) {
    return { ok: false, error: "Smart notifications are not enabled." };
  }
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: { id: true },
  });
  if (!profile) return { ok: false, error: "Athlete profile required." };

  const maxPerDay = Math.min(20, Math.max(1, Math.floor(input.maxPerDay)));
  const row = await prisma.notificationPreference.upsert({
    where: { athleteProfileId: profile.id },
    create: {
      athleteProfileId: profile.id,
      inAppEnabled: input.inAppEnabled,
      emailEnabled: input.emailEnabled,
      pushEnabled: input.pushEnabled,
      frequency: input.frequency,
      kindWorkoutToday: input.kinds.workout_today,
      kindTechniqueReanalysis: input.kinds.technique_reanalysis_due,
      kindCompetitionCountdown: input.kinds.competition_countdown,
      kindWeeklyReview: input.kinds.weekly_review_ready,
      kindRecoveryTrend: input.kinds.recovery_trend_declining,
      kindPrAchieved: input.kinds.pr_achieved,
      kindCoachMessage: input.kinds.coach_message,
      maxPerDay,
    },
    update: {
      inAppEnabled: input.inAppEnabled,
      emailEnabled: input.emailEnabled,
      pushEnabled: input.pushEnabled,
      frequency: input.frequency,
      kindWorkoutToday: input.kinds.workout_today,
      kindTechniqueReanalysis: input.kinds.technique_reanalysis_due,
      kindCompetitionCountdown: input.kinds.competition_countdown,
      kindWeeklyReview: input.kinds.weekly_review_ready,
      kindRecoveryTrend: input.kinds.recovery_trend_declining,
      kindPrAchieved: input.kinds.pr_achieved,
      kindCoachMessage: input.kinds.coach_message,
      maxPerDay,
    },
  });

  return { ok: true, prefs: prefsFromRow(row) };
}

/**
 * Sync candidates into the inbox (idempotent upsert by dedupeKey).
 * Optionally emails when email channel is enabled and not yet sent.
 */
export async function syncSmartNotifications(input: {
  userId: string;
}): Promise<
  | {
      ok: true;
      created: number;
      unreadCount: number;
      items: InAppNotificationView[];
    }
  | { ok: false; error: string }
> {
  if (!featureFlags.smartNotifications) {
    return { ok: false, error: "Smart notifications are not enabled." };
  }

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: {
      id: true,
      user: { select: { email: true } },
    },
  });
  if (!profile) return { ok: false, error: "Athlete profile required." };

  const now = new Date();
  const prefsRow = await ensurePrefs(profile.id);
  const prefs = prefsFromRow(prefsRow);
  const signals = await gatherSignals(profile.id, now);

  const recentRows = await prisma.athleteNotification.findMany({
    where: {
      athleteProfileId: profile.id,
      createdAt: { gte: new Date(now.getTime() - 14 * 24 * 3600 * 1000) },
    },
    select: { kind: true, dedupeKey: true, createdAt: true },
  });

  const assembled = assembleSmartNotifications({
    signals,
    prefs,
    recent: recentRows.map((r) => ({
      kind: r.kind as NotificationKind,
      dedupeKey: r.dedupeKey,
      createdAt: r.createdAt,
    })),
  });

  let created = 0;
  const channelsJson = JSON.stringify(assembled.channelsForDelivery);

  if (prefs.inAppEnabled || prefs.emailEnabled) {
    for (const item of assembled.accepted) {
      try {
        const row = await prisma.athleteNotification.create({
          data: {
            athleteProfileId: profile.id,
            kind: item.kind,
            title: item.title,
            body: item.body,
            href: item.href,
            channelsJson,
            dedupeKey: item.dedupeKey,
            status: prefs.inAppEnabled ? "unread" : "read",
            priority: item.priority,
            relatedType: item.relatedType,
            relatedId: item.relatedId,
            engineVersion: SMART_NOTIFICATION_ENGINE_VERSION,
            readAt: prefs.inAppEnabled ? null : now,
          },
        });
        created += 1;

        if (
          prefs.emailEnabled &&
          assembled.channelsForDelivery.includes("email") &&
          profile.user.email
        ) {
          await sendEmail({
            to: profile.user.email,
            subject: item.title,
            text: `${item.body}\n\nOpen: ${item.href ?? "/app/dashboard"}\n\nManage preferences: /app/notifications`,
          });
          await prisma.athleteNotification.update({
            where: { id: row.id },
            data: { emailSentAt: now },
          });
        }
      } catch {
        // Unique constraint = already delivered — ignore
      }
    }
  }

  return listInAppNotifications({ userId: input.userId, created });
}

export async function listInAppNotifications(input: {
  userId: string;
  created?: number;
}): Promise<
  | {
      ok: true;
      created: number;
      unreadCount: number;
      items: InAppNotificationView[];
    }
  | { ok: false; error: string }
> {
  if (!featureFlags.smartNotifications) {
    return { ok: false, error: "Smart notifications are not enabled." };
  }
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: { id: true },
  });
  if (!profile) return { ok: false, error: "Athlete profile required." };

  const prefs = prefsFromRow(
    await prisma.notificationPreference.findUnique({
      where: { athleteProfileId: profile.id },
    }),
  );

  if (!prefs.inAppEnabled) {
    return {
      ok: true,
      created: input.created ?? 0,
      unreadCount: 0,
      items: [],
    };
  }

  const rows = await prisma.athleteNotification.findMany({
    where: {
      athleteProfileId: profile.id,
      status: { in: ["unread", "read"] },
    },
    orderBy: [{ status: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
    take: 30,
  });

  const unreadCount = rows.filter((r) => r.status === "unread").length;

  return {
    ok: true,
    created: input.created ?? 0,
    unreadCount,
    items: rows.map((r) => ({
      id: r.id,
      kind: r.kind,
      title: r.title,
      body: r.body,
      href: r.href,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      priority: r.priority,
    })),
  };
}

export async function markNotificationRead(input: {
  userId: string;
  notificationId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: { id: true },
  });
  if (!profile) return { ok: false, error: "Athlete profile required." };

  const row = await prisma.athleteNotification.findFirst({
    where: { id: input.notificationId, athleteProfileId: profile.id },
  });
  if (!row) return { ok: false, error: "Notification not found." };

  await prisma.athleteNotification.update({
    where: { id: row.id },
    data: { status: "read", readAt: new Date() },
  });
  return { ok: true };
}

export async function dismissNotification(input: {
  userId: string;
  notificationId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: { id: true },
  });
  if (!profile) return { ok: false, error: "Athlete profile required." };

  const row = await prisma.athleteNotification.findFirst({
    where: { id: input.notificationId, athleteProfileId: profile.id },
  });
  if (!row) return { ok: false, error: "Notification not found." };

  await prisma.athleteNotification.update({
    where: { id: row.id },
    data: { status: "dismissed", readAt: row.readAt ?? new Date() },
  });
  return { ok: true };
}

export async function markAllNotificationsRead(input: {
  userId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: { id: true },
  });
  if (!profile) return { ok: false, error: "Athlete profile required." };

  await prisma.athleteNotification.updateMany({
    where: { athleteProfileId: profile.id, status: "unread" },
    data: { status: "read", readAt: new Date() },
  });
  return { ok: true };
}

/** Exported for tests / docs — known kinds. */
export const SMART_NOTIFICATION_KIND_LIST = NOTIFICATION_KINDS;
