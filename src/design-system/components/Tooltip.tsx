"use client";

import {
  useId,
  useState,
  type ReactNode,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { cn } from "@/design-system/utils/cn";

export type TooltipProps = {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom";
  className?: string;
};

/**
 * Accessible tooltip: shows on focus and hover; Escape dismisses.
 */
export function Tooltip({
  content,
  children,
  side = "top",
  className,
}: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);

  function onKeyDown(event: KeyboardEvent<HTMLSpanElement>) {
    if (event.key === "Escape") setOpen(false);
  }

  function onBlur(event: FocusEvent<HTMLSpanElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setOpen(false);
    }
  }

  return (
    <span
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    >
      <span aria-describedby={open ? id : undefined}>{children}</span>
      {open ? (
        <span
          id={id}
          role="tooltip"
          className={cn(
            "pointer-events-none absolute left-1/2 z-[var(--z-tooltip)] max-w-xs -translate-x-1/2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-2 py-1 text-xs text-[var(--color-foreground)] shadow-[var(--shadow-md)]",
            side === "top" ? "bottom-full mb-2" : "top-full mt-2",
          )}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
