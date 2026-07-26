"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { IconButton } from "@/design-system/components/IconButton";
import { Drawer } from "@/design-system/components/Drawer";
import { Button } from "@/design-system";
import type { InAppNotificationView } from "@/services/notifications";
import {
  dismissNotificationAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/services/notifications/actions";

export function NotificationArea({
  initialItems = [],
  initialUnreadCount = 0,
  enabled = true,
}: {
  initialItems?: InAppNotificationView[];
  initialUnreadCount?: number;
  enabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(initialItems);
  const [unread, setUnread] = useState(initialUnreadCount);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    setItems(initialItems);
    setUnread(initialUnreadCount);
  }, [initialItems, initialUnreadCount]);

  function refreshFromServer() {
    router.refresh();
  }

  return (
    <>
      <IconButton
        aria-label={
          unread > 0
            ? `Notifications, ${unread} unread`
            : "Notifications"
        }
        onClick={() => setOpen(true)}
      >
        <span className="relative inline-flex">
          <BellIcon />
          {enabled && unread > 0 ? (
            <span
              className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[var(--color-accent)]"
              aria-hidden
            />
          ) : null}
        </span>
      </IconButton>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Notifications"
        side="right"
      >
        {!enabled ? (
          <p className="text-sm leading-relaxed text-[var(--color-muted)]">
            Smart notifications are behind a feature flag.
          </p>
        ) : items.length === 0 ? (
          <div className="grid gap-3 text-sm leading-relaxed text-[var(--color-muted)]">
            <p>
              No notifications yet. Alerts appear only from real signals — workout
              today, technique due, competition countdown, weekly review, recovery
              trend, or a new PR. Nothing is fabricated.
            </p>
            <Link
              href="/app/notifications"
              className="text-[var(--color-accent)] underline-offset-2 hover:underline"
              onClick={() => setOpen(false)}
            >
              Notification preferences
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-[var(--color-muted)]">
                {unread} unread
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={pending || unread === 0}
                  onClick={() => {
                    startTransition(async () => {
                      await markAllNotificationsReadAction();
                      setItems((prev) =>
                        prev.map((i) => ({ ...i, status: "read" })),
                      );
                      setUnread(0);
                      refreshFromServer();
                    });
                  }}
                >
                  Mark all read
                </Button>
                <Link
                  href="/app/notifications"
                  className="text-xs text-[var(--color-accent)] underline-offset-2 hover:underline"
                  onClick={() => setOpen(false)}
                >
                  Preferences
                </Link>
              </div>
            </div>
            <ul className="grid gap-3">
              {items.map((item) => (
                <li
                  key={item.id}
                  className={
                    item.status === "unread"
                      ? "rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3"
                      : "rounded-[var(--radius-md)] border border-transparent p-3"
                  }
                >
                  <div className="grid gap-1">
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="font-medium text-[var(--color-accent)] underline-offset-2 hover:underline"
                        onClick={() => {
                          setOpen(false);
                          if (item.status === "unread") {
                            startTransition(async () => {
                              await markNotificationReadAction(item.id);
                              setItems((prev) =>
                                prev.map((i) =>
                                  i.id === item.id
                                    ? { ...i, status: "read" }
                                    : i,
                                ),
                              );
                              setUnread((u) => Math.max(0, u - 1));
                              refreshFromServer();
                            });
                          }
                        }}
                      >
                        {item.title}
                      </Link>
                    ) : (
                      <span className="font-medium">{item.title}</span>
                    )}
                    <p className="text-sm text-[var(--color-muted)]">
                      {item.body}
                    </p>
                    <div className="mt-1 flex gap-2">
                      {item.status === "unread" ? (
                        <button
                          type="button"
                          className="text-xs text-[var(--color-muted)] underline-offset-2 hover:underline"
                          disabled={pending}
                          onClick={() => {
                            startTransition(async () => {
                              await markNotificationReadAction(item.id);
                              setItems((prev) =>
                                prev.map((i) =>
                                  i.id === item.id
                                    ? { ...i, status: "read" }
                                    : i,
                                ),
                              );
                              setUnread((u) => Math.max(0, u - 1));
                              refreshFromServer();
                            });
                          }}
                        >
                          Mark read
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="text-xs text-[var(--color-muted)] underline-offset-2 hover:underline"
                        disabled={pending}
                        onClick={() => {
                          startTransition(async () => {
                            await dismissNotificationAction(item.id);
                            setItems((prev) =>
                              prev.filter((i) => i.id !== item.id),
                            );
                            if (item.status === "unread") {
                              setUnread((u) => Math.max(0, u - 1));
                            }
                            refreshFromServer();
                          });
                        }}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Drawer>
    </>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M9 2.25a3.75 3.75 0 0 0-3.75 3.75v1.2c0 .66-.2 1.3-.57 1.85L3.6 10.8A1.2 1.2 0 0 0 4.6 12.75h8.8a1.2 1.2 0 0 0 1-1.95l-1.08-1.75a3.3 3.3 0 0 1-.57-1.85V6A3.75 3.75 0 0 0 9 2.25Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M7.2 12.75a1.8 1.8 0 0 0 3.6 0"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
