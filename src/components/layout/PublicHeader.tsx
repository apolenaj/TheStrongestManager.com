"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ButtonLink } from "@/design-system";
import { Drawer } from "@/design-system/components/Drawer";
import { IconButton } from "@/design-system/components/IconButton";
import { PublicSearchTrigger } from "@/components/layout/GlobalSearch";
import { getPublicNavRoutes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { cn } from "@/design-system/utils/cn";

/** Desktop primary strip — conversion + catalog. Rest stay in the mobile drawer / footer. */
const DESKTOP_PRIMARY_IDS = new Set([
  "features",
  "demo",
  "exercises",
  "methods",
  "learn",
  "pricing",
]);

/**
 * Public navigation.
 * Sticky only when beneficial: always on inner pages; on home after scroll.
 * Mobile uses a drawer — no horizontal scroll strip at 320px.
 */
export function PublicHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [stuck, setStuck] = useState(!isHome);
  const [menuOpen, setMenuOpen] = useState(false);
  const items = getPublicNavRoutes().filter((item) => item.id !== "home");
  const desktopItems = items.filter((item) => DESKTOP_PRIMARY_IDS.has(item.id));

  useEffect(() => {
    if (!isHome) {
      setStuck(true);
      return;
    }

    function onScroll() {
      setStuck(window.scrollY > 48);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  return (
    <>
      <header
        className={cn(
          "z-[var(--z-sticky)] w-full transition-[background-color,border-color,backdrop-filter] duration-[var(--duration-normal)]",
          stuck
            ? "sticky top-0 border-b border-[var(--color-border)] bg-[var(--color-background)]/90 backdrop-blur-md"
            : "absolute inset-x-0 top-0 border-b border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto flex max-w-6xl min-w-0 items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <Link
            href="/"
            className="min-w-0 truncate font-[family-name:var(--font-display)] text-base font-semibold tracking-tight text-[var(--color-foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] sm:text-lg"
          >
            {siteConfig.name}
          </Link>

          <nav
            aria-label="Primary"
            className="hidden min-w-0 items-center gap-0.5 lg:flex"
          >
            {desktopItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(`${item.href}/`));
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-sm px-3 py-2.5 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]",
                    active
                      ? "text-[var(--color-foreground)]"
                      : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <PublicSearchTrigger />
            <ButtonLink
              href="/login"
              variant="ghost"
              size="sm"
              className="hidden min-h-10 sm:inline-flex"
            >
              Log in
            </ButtonLink>
            <ButtonLink
              href="/signup"
              size="sm"
              className="hidden min-h-10 sm:inline-flex"
            >
              Start Free
            </ButtonLink>
            <IconButton
              aria-label="Open menu"
              size="md"
              className="lg:hidden"
              onClick={() => setMenuOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          </div>
        </div>
      </header>

      <Drawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        title="Menu"
        side="right"
      >
        <nav aria-label="Primary mobile" className="flex flex-col gap-1">
          <Link
            href="/search"
            className="rounded-[var(--radius-sm)] px-3 py-3 text-base text-[var(--color-muted)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-foreground)]"
            onClick={() => setMenuOpen(false)}
          >
            Search
          </Link>
          {items.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-[var(--radius-sm)] px-3 py-3 text-base",
                  active
                    ? "bg-[var(--color-surface-elevated)] text-[var(--color-foreground)]"
                    : "text-[var(--color-muted)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-foreground)]",
                )}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
          <ButtonLink
            href="/login"
            variant="secondary"
            className="mt-4 w-full min-h-11"
            onClick={() => setMenuOpen(false)}
          >
            Log in
          </ButtonLink>
          <ButtonLink
            href="/signup"
            className="w-full min-h-11"
            onClick={() => setMenuOpen(false)}
          >
            Start Free
          </ButtonLink>
        </nav>
      </Drawer>
    </>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M3 5h12M3 9h12M3 13h12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
