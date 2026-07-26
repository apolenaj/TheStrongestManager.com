"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { useFocusTrap } from "@/components/a11y/useFocusTrap";
import { IconButton } from "@/design-system/components/IconButton";
import { cn } from "@/design-system/utils/cn";

export type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  side?: "right" | "left";
  className?: string;
};

export function Drawer({
  open,
  onClose,
  title,
  children,
  side = "right",
  className,
}: DrawerProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useFocusTrap(open, panelRef);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[var(--z-modal)]" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label="Close drawer"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "absolute top-0 flex h-full w-[min(100%,24rem)] flex-col border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-overlay)] outline-none",
          side === "right"
            ? "right-0 border-l"
            : "left-0 border-r",
          className,
        )}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-[var(--space-4)] py-[var(--space-3)]">
          <h2
            id={titleId}
            className="font-[family-name:var(--font-display)] text-base font-semibold"
          >
            {title}
          </h2>
          <IconButton
            aria-label="Close drawer"
            data-autofocus
            onClick={onClose}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden fill="none">
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </IconButton>
        </div>
        <div className="flex-1 overflow-y-auto px-[var(--space-4)] py-[var(--space-4)]">
          {children}
        </div>
      </div>
    </div>
  );
}
