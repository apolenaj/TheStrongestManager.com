"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/design-system/utils/cn";

export type DropdownItem = {
  id: string;
  label: string;
  disabled?: boolean;
  onSelect?: () => void;
};

export type DropdownProps = {
  label: string;
  items: DropdownItem[];
  className?: string;
  align?: "start" | "end";
};

export function Dropdown({
  label,
  items,
  className,
  align = "start",
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const buttonId = useId();

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative inline-block", className)}>
      <button
        id={buttonId}
        type="button"
        className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] px-3 text-sm text-[var(--color-foreground)] transition-colors hover:border-[var(--color-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
      >
        {label}
        <ChevronIcon />
      </button>
      {open ? (
        <ul
          id={listId}
          role="menu"
          aria-labelledby={buttonId}
          className={cn(
            "absolute z-[var(--z-dropdown)] mt-1 min-w-[12rem] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] py-1 shadow-[var(--shadow-md)]",
            align === "end" ? "right-0" : "left-0",
          )}
        >
          {items.map((item) => (
            <li key={item.id} role="none">
              <button
                type="button"
                role="menuitem"
                disabled={item.disabled}
                className="flex w-full px-3 py-2 text-left text-sm text-[var(--color-foreground)] hover:bg-[var(--color-surface-overlay)] focus-visible:bg-[var(--color-surface-overlay)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                onClick={() => {
                  item.onSelect?.();
                  setOpen(false);
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden fill="none">
      <path
        d="M3 4.5L6 7.5L9 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
