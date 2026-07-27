"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { ButtonLink } from "@/design-system";
import { Drawer } from "@/design-system/components/Drawer";
import { IconButton } from "@/design-system/components/IconButton";
import { getPublicNavRoutes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { cn } from "@/design-system/utils/cn";

/** Minimal desktop strip — authority over catalog density. */
const DESKTOP_PRIMARY_IDS = new Set(["methods", "pricing", "academy"]);

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
            ? "sticky top-0 border-b border-[var(--color-border)] bg-[var(--color-background)]/92 backdrop-blur-md"
            : "absolute inset-x-0 top-0 border-b border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto flex max-w-6xl min-w-0 items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5">
          <Link
            href="/"
            className="min-w-0 truncate font-[family-name:var(--font-display)] text-sm font-semibold tracking-[-0.02em] text-[var(--color-foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)] sm:text-base"
          >
            {siteConfig.name === "TheStrongestManager"
              ? "The Strongest Manager"
              : siteConfig.name}
          </Link>

          <nav
            aria-label="Primary"
            className="hidden min-w-0 items-center gap-1 lg:flex"
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
                    "px-3.5 py-2 text-sm tracking-tight transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]",
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
            <ButtonLink
              href="/login"
              variant="ghost"
              size="sm"
              className="hidden min-h-10 sm:inline-flex"
            >
              Přihlásit
            </ButtonLink>
            <ButtonLink
              href="/signup"
              size="sm"
              className="hidden min-h-10 rounded-sm bg-[#e8c547] px-4 font-semibold text-[#0a0a0b] shadow-none hover:bg-[#f0d15c] sm:inline-flex"
            >
              Zahájit trénink
            </ButtonLink>
            <IconButton
              aria-label="Otevřít menu"
              size="md"
              className="lg:hidden"
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="h-[18px] w-[18px]" strokeWidth={1.5} />
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
            Přihlásit
          </ButtonLink>
          <ButtonLink
            href="/signup"
            className="w-full min-h-11 rounded-sm bg-[#e8c547] font-semibold text-[#0a0a0b] shadow-none hover:bg-[#f0d15c]"
            onClick={() => setMenuOpen(false)}
          >
            Zahájit trénink
          </ButtonLink>
        </nav>
      </Drawer>
    </>
  );
}
