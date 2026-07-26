"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/design-system/components/Button";
import { Modal } from "@/design-system/components/Modal";
import { SearchResultsPanel } from "@/components/search/SearchResultsPanel";

/**
 * Desktop command-palette search + mobile entry.
 * ⌘K / Ctrl+K optional shortcut. Deterministic search — no AI required.
 */
export function GlobalSearch({
  mobilePageHref = "/search",
}: {
  /** Mobile full-page search route */
  mobilePageHref?: string;
} = {}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const pathname = usePathname();

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k") {
        return;
      }
      // Skip when typing in inputs/textareas (unless palette already open to toggle)
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const editable =
        tag === "input" ||
        tag === "textarea" ||
        target?.isContentEditable;
      if (editable && !open) return;

      event.preventDefault();
      setOpen((prev) => {
        if (prev) {
          setQuery("");
          return false;
        }
        return true;
      });
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <Link
        href={mobilePageHref}
        aria-label="Open search"
        className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-muted)] transition-colors hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)] md:hidden"
      >
        <SearchIcon />
      </Link>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden h-9 min-w-0 max-w-[14rem] flex-1 items-center gap-2 truncate rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-left text-sm text-[var(--color-subtle)] transition-colors hover:border-[var(--color-border-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)] md:inline-flex lg:max-w-[18rem]"
      >
        <SearchIcon />
        <span className="truncate">Search…</span>
        <kbd className="ml-auto hidden rounded border border-[var(--color-border)] px-1.5 py-0.5 text-[10px] text-[var(--color-subtle)] xl:inline">
          ⌘K
        </kbd>
      </button>
      <Modal
        open={open}
        onClose={close}
        title="Search"
        description="Exercises, methods, articles, and academy — alias-aware. AI is not required."
        className="w-[min(100%-2rem,36rem)]"
        footer={
          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-[var(--color-muted)]">
              <Link
                href={mobilePageHref}
                className="text-[var(--color-accent)] underline-offset-2 hover:underline"
                onClick={close}
              >
                Open full search page
              </Link>
            </p>
            <Button variant="secondary" onClick={close}>
              Close
            </Button>
          </div>
        }
      >
        <SearchResultsPanel
          query={query}
          onQueryChange={setQuery}
          onNavigate={close}
          autoFocus={open}
        />
      </Modal>
    </>
  );
}

/** Compact trigger for public header (desktop palette + mobile page). */
export function PublicSearchTrigger() {
  return <GlobalSearch mobilePageHref="/search" />;
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10.5 10.5L14 14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
