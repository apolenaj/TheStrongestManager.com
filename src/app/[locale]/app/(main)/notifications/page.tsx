import type { Metadata } from "next";
import Link from "next/link";
import { AppPage } from "@/components/app/AppPage";
import { NotificationPreferencesForm } from "@/components/notifications/NotificationPreferencesForm";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { Alert, Badge, Card, CardDescription, CardHeader, CardTitle } from "@/design-system";
import { SMART_NOTIFICATION_HONESTY } from "@/domain/notifications";
import { requireSession } from "@/services/auth/session";
import {
  getNotificationPreferences,
  syncSmartNotifications,
} from "@/services/notifications";
import { getAthleteTimezone } from "@/services/timezone-system";
import { formatDateTimeInTimeZone } from "@/domain/timezone-system";

export const metadata: Metadata = {
  title: "Notifications",
  robots: { index: false, follow: false },
};

export default async function NotificationsPage() {
  const session = await requireSession();
  const [prefsResult, inbox, timeZone] = await Promise.all([
    getNotificationPreferences({ userId: session.user.id }),
    syncSmartNotifications({ userId: session.user.id }),
    getAthleteTimezone(session.user.id),
  ]);

  return (
    <FeatureGate
      flag="smartNotifications"
      title="Notifications"
      description="Smart notifications are behind a feature flag."
    >
      <AppPage
        eyebrow="Alerts"
        title="Smart notifications"
        description="Useful alerts from real training signals — with channel and frequency controls so you are not spammed."
      >
        <div className="grid gap-8">
          <Alert tone="info" title="Honesty">
            {SMART_NOTIFICATION_HONESTY.join(" ")}
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Inbox</CardTitle>
              <CardDescription>
                Synced from workouts, technique, competition, weekly review,
                recovery, and PRs.
              </CardDescription>
            </CardHeader>
            <div className="grid gap-3 px-6 pb-6">
              {!inbox.ok ? (
                <Alert tone="warning" title="Unavailable">
                  {inbox.error}
                </Alert>
              ) : inbox.items.length === 0 ? (
                <p className="text-sm text-[var(--color-muted)]">
                  No notifications yet. The bell in the top bar stays empty until
                  a real signal qualifies.
                </p>
              ) : (
                <ul className="grid gap-3">
                  {inbox.items.map((item) => (
                    <li key={item.id} className="grid gap-1 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        {item.href ? (
                          <Link
                            href={item.href}
                            className="font-medium text-[var(--color-accent)] underline-offset-2 hover:underline"
                          >
                            {item.title}
                          </Link>
                        ) : (
                          <span className="font-medium">{item.title}</span>
                        )}
                        <Badge variant="neutral">{item.status}</Badge>
                      </div>
                      <p className="text-[var(--color-muted)]">{item.body}</p>
                      <p className="text-xs text-[var(--color-subtle)]">
                        {formatDateTimeInTimeZone(item.createdAt, timeZone)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Push · Email · In-app channels and frequency preferences.
              </CardDescription>
            </CardHeader>
            <div className="px-6 pb-6">
              {!prefsResult.ok ? (
                <Alert tone="warning" title="Unavailable">
                  {prefsResult.error}
                </Alert>
              ) : (
                <NotificationPreferencesForm prefs={prefsResult.prefs} />
              )}
            </div>
          </Card>
        </div>
      </AppPage>
    </FeatureGate>
  );
}
