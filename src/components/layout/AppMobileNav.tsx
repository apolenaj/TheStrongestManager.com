"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Drawer } from "@/design-system/components/Drawer";
import { getAuthenticatedNavRoutes } from "@/config/routes";
import { NavIcon } from "@/components/layout/NavIcon";
import {
  getMobilePrimaryNavRoutes,
  MOBILE_PRIMARY_NAV_IDS,
} from "@/lib/navigation";
import { cn } from "@/design-system/utils/cn";

export function AppMobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const all = getAuthenticatedNavRoutes();
  const primary = getMobilePrimaryNavRoutes(all);
  const moreItems = all.filter(
    (route) =>
      !(MOBILE_PRIMARY_NAV_IDS as readonly string[]).includes(route.id),
  );

  return (
    <>
      <nav
        aria-label="Primary mobile"
        className="fixed inset-x-0 bottom-0 z-[var(--z-sticky)] border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5 gap-0 px-1 pt-0.5">
          {primary.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const iconId =
              item.id === "app-exercises"
                ? "exercises"
                : item.id === "app-methods"
                  ? "methods"
                  : item.id === "app-academy"
                    ? "academy"
                    : item.id;
            return (
              <li key={item.id} className="min-w-0">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-12 min-w-0 flex-col items-center justify-center gap-0.5 rounded-[var(--radius-sm)] px-1 py-2 text-[11px] leading-tight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]",
                    active
                      ? "text-[var(--color-accent)]"
                      : "text-[var(--color-muted)]",
                  )}
                >
                  <NavIcon id={iconId} />
                  <span className="w-full truncate text-center">{item.label}</span>
                </Link>
              </li>
            );
          })}
          <li className="min-w-0">
            <button
              type="button"
              className="flex min-h-12 w-full min-w-0 flex-col items-center justify-center gap-0.5 rounded-[var(--radius-sm)] px-1 py-2 text-[11px] leading-tight text-[var(--color-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
              aria-expanded={moreOpen}
              onClick={() => setMoreOpen(true)}
            >
              <MoreIcon />
              <span className="w-full truncate text-center">More</span>
            </button>
          </li>
        </ul>
      </nav>

      <Drawer
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        title="More"
        side="left"
      >
        <ul className="flex flex-col gap-1">
          {moreItems.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-[var(--radius-sm)] px-3 py-3 text-sm",
                    active
                      ? "bg-[var(--color-surface-elevated)] text-[var(--color-foreground)]"
                      : "text-[var(--color-muted)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-foreground)]",
                  )}
                  onClick={() => setMoreOpen(false)}
                >
                  <NavIcon
                    id={
                      item.id === "app-exercises"
                        ? "exercises"
                        : item.id === "app-methods"
                          ? "methods"
                          : item.id === "app-academy"
                            ? "academy"
                            : item.id
                    }
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </Drawer>
    </>
  );
}

function MoreIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 18 18" fill="none" aria-hidden>
      <circle cx="4" cy="9" r="1.25" fill="currentColor" />
      <circle cx="9" cy="9" r="1.25" fill="currentColor" />
      <circle cx="14" cy="9" r="1.25" fill="currentColor" />
    </svg>
  );
}
