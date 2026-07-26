"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AppMobileNav } from "@/components/layout/AppMobileNav";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppTopBar } from "@/components/layout/AppTopBar";
import { DemoAccountAppBanner } from "@/components/demo/DemoChrome";
import type { AccountMenuUser } from "@/components/layout/AccountMenu";
import type { InAppNotificationView } from "@/services/notifications";

const STORAGE_KEY = "tsm-sidebar-collapsed";

export function AppShell({
  children,
  user,
  isDemoAccount = false,
  notifications = [],
  notificationUnreadCount = 0,
  notificationsEnabled = true,
}: {
  children: ReactNode;
  user: AccountMenuUser;
  /** Isolated demo identity only — never true for production signups. */
  isDemoAccount?: boolean;
  notifications?: InAppNotificationView[];
  notificationUnreadCount?: number;
  notificationsEnabled?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "true") setCollapsed(true);
    } catch {
      // ignore storage errors
    }
    setReady(true);
  }, []);

  function toggleCollapsed() {
    setCollapsed((value) => {
      const next = !value;
      try {
        window.localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

  return (
    <div className="flex min-h-screen min-w-0 overflow-x-hidden bg-[var(--color-background)]">
      <AppSidebar
        collapsed={ready ? collapsed : false}
        onToggle={toggleCollapsed}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopBar
          user={user}
          notifications={notifications}
          notificationUnreadCount={notificationUnreadCount}
          notificationsEnabled={notificationsEnabled}
        />
        <main
          id="main-content"
          className="min-w-0 flex-1 px-3 pb-24 pt-5 sm:px-6 sm:pt-7 md:pb-10"
        >
          <div className="mx-auto w-full max-w-5xl min-w-0 space-y-1">
            {isDemoAccount ? <DemoAccountAppBanner /> : null}
            {children}
          </div>
        </main>
        <AppMobileNav />
      </div>
    </div>
  );
}
