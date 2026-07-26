import Link from "next/link";
import { Badge, ButtonLink } from "@/design-system";
import {
  DEMO_MODE_EXPLORE_LABEL,
  DEMO_MODE_LABEL,
} from "@/domain/demo";

/**
 * Persistent Demo Mode chrome — must stay visible so demo data is never
 * mistaken for a logged-in production athlete.
 */
export function DemoBanner({
  source,
}: {
  source?: "fixture" | "seeded";
}) {
  return (
    <div
      role="status"
      className="border-b border-[var(--color-warning)]/40 bg-[rgba(245,158,11,0.12)]"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="warning">{DEMO_MODE_LABEL}</Badge>
            <p className="text-sm font-medium text-[var(--color-foreground)]">
              {DEMO_MODE_EXPLORE_LABEL}
            </p>
          </div>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Example athlete data for demos, screenshots, and walkthroughs — not
            your account
            {source === "seeded" ? " (seeded demo athlete)." : "."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href="/signup" size="sm">
            Start free with your data
          </ButtonLink>
          <ButtonLink href="/" variant="secondary" size="sm">
            Back to home
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

export function DemoModeNav({ active }: { active: string }) {
  const items = [
    { id: "dashboard", href: "/demo", label: "Dashboard" },
    { id: "today", href: "/demo/today", label: "Today" },
    { id: "technique", href: "/demo/technique", label: "Technique" },
    { id: "progress", href: "/demo/progress", label: "Progress" },
    { id: "training", href: "/demo/training", label: "Training" },
  ] as const;

  return (
    <nav
      aria-label="Demo Mode"
      className="mb-6 flex flex-wrap gap-1 border-b border-[var(--color-border)] pb-3"
    >
      {items.map((item) => {
        const isActive = active === item.id;
        return (
          <Link
            key={item.id}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={
              isActive
                ? "rounded-sm px-3 py-2 text-sm font-medium text-[var(--color-foreground)]"
                : "rounded-sm px-3 py-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Compact banner for authenticated demo-account sessions inside /app. */
export function DemoAccountAppBanner() {
  return (
    <div
      role="status"
      className="mb-6 rounded-[var(--radius-lg)] border border-[var(--color-warning)]/40 bg-[rgba(245,158,11,0.12)] px-4 py-3"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="warning">{DEMO_MODE_LABEL}</Badge>
        <p className="text-sm font-medium text-[var(--color-foreground)]">
          You are signed in as the isolated demo athlete — not a production
          account.
        </p>
      </div>
      <p className="mt-1 text-xs text-[var(--color-muted)]">
        Stats here belong only to this demo identity. Production users never
        inherit them.
      </p>
    </div>
  );
}
