"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/design-system/components/Button";
import { Modal } from "@/design-system/components/Modal";
import { featureFlags } from "@/config/feature-flags";
import {
  COMMAND_PALETTE_CATEGORY_LABELS,
  COMMAND_PALETTE_HONESTY,
  COMMAND_PALETTE_SHORTCUT,
  filterCommands,
  type CommandPaletteAction,
} from "@/domain/command-palette";

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    target.isContentEditable
  );
}

function matchesShortcut(event: KeyboardEvent): boolean {
  if (!COMMAND_PALETTE_SHORTCUT.metaOrCtrl) return false;
  if (!(event.metaKey || event.ctrlKey)) return false;
  if (Boolean(event.shiftKey) !== COMMAND_PALETTE_SHORTCUT.shiftKey) return false;
  return event.key.toLowerCase() === COMMAND_PALETTE_SHORTCUT.key;
}

/**
 * Power-user command palette — Ctrl/Cmd+Shift+P.
 * Keyboard: arrows, Enter, Escape. Distinct from ⌘K content search.
 */
export function CommandPalette() {
  const enabled = featureFlags.commandPalette;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const router = useRouter();
  const pathname = usePathname();

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);

  const matches = useMemo(() => filterCommands(query), [query]);

  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!enabled) return;

    function onKeyDown(event: KeyboardEvent) {
      if (!matchesShortcut(event)) return;
      if (isEditableTarget(event.target) && !open) return;
      event.preventDefault();
      setOpen((prev) => {
        if (prev) {
          setQuery("");
          setActiveIndex(0);
          return false;
        }
        return true;
      });
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, open]);

  useEffect(() => {
    if (open) {
      // Focus after dialog paints
      const t = window.setTimeout(() => inputRef.current?.focus(), 0);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  function runCommand(command: CommandPaletteAction) {
    close();
    router.push(command.href);
  }

  function onInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) =>
        matches.length === 0 ? 0 : Math.min(i + 1, matches.length - 1),
      );
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(matches.length > 0 ? matches.length - 1 : 0);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const pick = matches[activeIndex];
      if (pick) runCommand(pick.command);
      return;
    }
  }

  if (!enabled) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open command palette"
        title={`Command palette (${COMMAND_PALETTE_SHORTCUT.label})`}
        className="hidden h-9 items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 text-sm text-[var(--color-muted)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)] md:inline-flex"
      >
        <CommandIcon />
        <span className="hidden lg:inline">Commands</span>
        <kbd className="hidden rounded border border-[var(--color-border)] px-1 py-0.5 text-[10px] text-[var(--color-subtle)] xl:inline">
          ⌘⇧P
        </kbd>
      </button>

      <Modal
        open={open}
        onClose={close}
        title="Command palette"
        description="Run a power-user command. Arrows move, Enter runs, Escape closes."
        className="w-[min(100%-2rem,36rem)]"
        footer={
          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-[var(--color-muted)]">
              {COMMAND_PALETTE_HONESTY[0]}
            </p>
            <Button variant="secondary" onClick={close}>
              Close
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <label className="sr-only" htmlFor={`${listId}-input`}>
            Filter commands
          </label>
          <input
            ref={inputRef}
            id={`${listId}-input`}
            type="search"
            role="combobox"
            aria-expanded={true}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={
              matches[activeIndex]
                ? `${listId}-option-${matches[activeIndex]!.command.id}`
                : undefined
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Log workout, upload deadlift, ask coach…"
            className="h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-sm text-[var(--color-foreground)] outline-none focus-visible:border-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />

          <ul
            id={listId}
            role="listbox"
            aria-label="Commands"
            className="max-h-[min(50vh,20rem)] overflow-y-auto rounded-[var(--radius-sm)] border border-[var(--color-border)]"
          >
            {matches.length === 0 ? (
              <li className="px-3 py-4 text-sm text-[var(--color-muted)]">
                No matching commands. Try “log workout” or “view PR”.
              </li>
            ) : (
              matches.map((m, index) => {
                const active = index === activeIndex;
                return (
                  <li
                    key={m.command.id}
                    id={`${listId}-option-${m.command.id}`}
                    role="option"
                    aria-selected={active}
                  >
                    <button
                      type="button"
                      className={`flex w-full flex-col gap-0.5 px-3 py-2.5 text-left text-sm transition-colors ${
                        active
                          ? "bg-[var(--color-accent-muted)] text-[var(--color-foreground)]"
                          : "hover:bg-[var(--color-surface-elevated)]"
                      }`}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => runCommand(m.command)}
                    >
                      <span className="font-medium">{m.command.label}</span>
                      <span className="text-xs text-[var(--color-muted)]">
                        {COMMAND_PALETTE_CATEGORY_LABELS[m.command.category]} ·{" "}
                        {m.command.description}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </Modal>
    </>
  );
}

function CommandIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3 4.5h10M3 8h7M3 11.5h5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
