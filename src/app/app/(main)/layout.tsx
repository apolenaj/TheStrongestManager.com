import { I18nProvider } from "@/components/i18n/I18nProvider";
import { AppShell } from "@/components/layout/AppShell";
import { featureFlags } from "@/config/feature-flags";
import { prisma } from "@/lib/db";
import { requireSession } from "@/services/auth/session";
import { getUiLocale } from "@/services/i18n";
import { requireCompletedOnboarding } from "@/services/onboarding/guards";
import { syncSmartNotifications } from "@/services/notifications";

export default async function MainAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireSession();
  await requireCompletedOnboarding(session.user.id);
  const locale = featureFlags.i18n ? await getUiLocale() : "en";

  const account = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isDemoAccount: true },
  });

  let notifications: Awaited<
    ReturnType<typeof syncSmartNotifications>
  > | null = null;
  if (featureFlags.smartNotifications) {
    notifications = await syncSmartNotifications({ userId: session.user.id });
  }

  return (
    <I18nProvider locale={locale}>
      <AppShell
        user={{ email: session.user.email }}
        isDemoAccount={Boolean(account?.isDemoAccount)}
        notificationsEnabled={featureFlags.smartNotifications}
        notifications={
          notifications?.ok ? notifications.items : []
        }
        notificationUnreadCount={
          notifications?.ok ? notifications.unreadCount : 0
        }
      >
        {children}
      </AppShell>
    </I18nProvider>
  );
}
