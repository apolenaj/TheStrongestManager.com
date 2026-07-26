"use client";

import { usePathname } from "next/navigation";
import {
  AccountMenu,
  type AccountMenuUser,
} from "@/components/layout/AccountMenu";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { GlobalSearch } from "@/components/layout/GlobalSearch";
import { CommandPalette } from "@/components/command-palette/CommandPalette";
import { NotificationArea } from "@/components/layout/NotificationArea";
import { buildAppBreadcrumbs } from "@/lib/navigation";
import type { InAppNotificationView } from "@/services/notifications";

export function AppTopBar({
  user,
  notifications = [],
  notificationUnreadCount = 0,
  notificationsEnabled = true,
}: {
  user: AccountMenuUser;
  notifications?: InAppNotificationView[];
  notificationUnreadCount?: number;
  notificationsEnabled?: boolean;
}) {
  const pathname = usePathname();
  const crumbs = buildAppBreadcrumbs(pathname);

  return (
    <div className="sticky top-0 z-[var(--z-sticky)] border-b border-[var(--color-border)] bg-[var(--color-background)]/90 backdrop-blur-md">
      <div className="flex min-w-0 items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-5">
        <div className="min-w-0 flex-1">
          <Breadcrumbs items={crumbs} />
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <CommandPalette />
          <GlobalSearch />
          <NotificationArea
            initialItems={notifications}
            initialUnreadCount={notificationUnreadCount}
            enabled={notificationsEnabled}
          />
          <AccountMenu compact user={user} />
        </div>
      </div>
    </div>
  );
}
