"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconButton } from "@/design-system/components/IconButton";
import { getAuthenticatedNavRoutes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { NavIcon } from "@/components/layout/NavIcon";
import { cn } from "@/design-system/utils/cn";

export type AppSidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const pathname = usePathname();
  const items = getAuthenticatedNavRoutes();

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] md:flex",
        collapsed ? "w-[4.25rem]" : "w-56",
      )}
    >
      <div
        className={cn(
          "flex border-b border-[var(--color-border)] px-3 py-3",
          collapsed
            ? "flex-col items-center gap-2"
            : "items-center justify-between gap-2",
        )}
      >
        {!collapsed ? (
          <Link
            href="/app/dashboard"
            className="min-w-0 font-[family-name:var(--font-display)] text-sm font-semibold tracking-tight text-[var(--color-foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
          >
            <span className="block truncate">{siteConfig.name}</span>
            <span className="mt-0.5 block text-xs font-normal text-[var(--color-muted)]">
              Training app
            </span>
          </Link>
        ) : (
          <Link
            href="/app/dashboard"
            className="font-[family-name:var(--font-display)] text-sm font-semibold text-[var(--color-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
            aria-label={siteConfig.name}
          >
            TS
          </Link>
        )}
        <IconButton
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          size="sm"
          onClick={onToggle}
          className={collapsed ? undefined : "shrink-0"}
        >
          <CollapseIcon collapsed={collapsed} />
        </IconButton>
      </div>

      <nav
        aria-label="App"
        className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overflow-x-hidden px-2 py-3"
      >
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.id}
              href={item.href}
              title={collapsed ? item.label : undefined}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-[var(--radius-sm)] px-2.5 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]",
                collapsed && "justify-center px-0",
                active
                  ? "bg-[var(--color-surface-elevated)] text-[var(--color-foreground)]"
                  : "text-[var(--color-muted)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-foreground)]",
              )}
            >
              <span className="shrink-0">
                <NavIcon id={item.id === "app-exercises" ? "exercises" : item.id === "app-methods" ? "methods" : item.id === "app-academy" ? "academy" : item.id} />
              </span>
              {!collapsed ? (
                <span className="truncate">{item.label}</span>
              ) : (
                <span className="sr-only">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function CollapseIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d={collapsed ? "M6 4l4 4-4 4" : "M10 4L6 8l4 4"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
