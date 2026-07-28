"use client";

import { useEffect, useId, useState } from "react";
import {
  LEGENDARY_PROFILE_TOC,
} from "@/domain/legendary-methods";
import { cn } from "@/design-system/utils/cn";

export function LegendaryMethodProfileToc({
  sectionIds,
}: {
  sectionIds: readonly string[];
}) {
  const items = LEGENDARY_PROFILE_TOC.filter((item) =>
    sectionIds.includes(item.id),
  );
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);
  const panelId = useId();
  const sectionKey = sectionIds.join("|");

  useEffect(() => {
    const ids = sectionKey.split("|").filter(Boolean);
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node));
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-18% 0px -62% 0px",
        threshold: [0.1, 0.25, 0.5],
      },
    );

    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, [sectionKey]);

  if (items.length === 0) return null;

  function TocLinks({ onNavigate }: { onNavigate?: () => void }) {
    return (
      <ul className="space-y-1">
        {items.map((item) => {
          const active = activeId === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={onNavigate}
                aria-current={active ? "location" : undefined}
                className={cn(
                  "block border-l-2 px-3 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]",
                  active
                    ? "border-[var(--color-accent)] text-[var(--color-foreground)]"
                    : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-foreground)]",
                )}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start">
      <nav aria-label="On this page" className="lg:hidden">
        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-controls={panelId}
          onClick={() => setMobileOpen((value) => !value)}
          className="flex min-h-11 w-full items-center justify-between border border-white/10 bg-[var(--color-surface-elevated)] px-4 text-left text-sm font-semibold text-[var(--color-foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
        >
          On this page
          <span className="text-xs font-normal uppercase tracking-[0.12em] text-[var(--color-muted)]">
            {mobileOpen ? "Hide" : "Show"}
          </span>
        </button>
        <div
          id={panelId}
          hidden={!mobileOpen}
          className="mt-2 border border-white/10 bg-[var(--color-surface)] p-3"
        >
          <TocLinks onNavigate={() => setMobileOpen(false)} />
        </div>
      </nav>

      <nav
        aria-label="On this page"
        className="legendary-surface hidden max-h-[calc(100vh-7rem)] overflow-y-auto p-4 lg:block"
      >
        <p className="px-3 pb-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]">
          Contents
        </p>
        <TocLinks />
      </nav>
    </div>
  );
}
