"use client";

import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from "react";
import { useFocusTrap } from "@/components/a11y/useFocusTrap";
import { Button } from "@/design-system/components/Button";
import { IconButton } from "@/design-system/components/IconButton";
import { cn } from "@/design-system/utils/cn";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useFocusTrap(open, dialogRef);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        "fixed top-1/2 left-1/2 z-[var(--z-modal)] m-0 w-[min(100%-2rem,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-0 text-[var(--color-foreground)] shadow-[var(--shadow-overlay)] open:flex open:flex-col backdrop:bg-black/60",
        className,
      )}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          onClose();
        }
      }}
    >
      <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] px-[var(--space-5)] py-[var(--space-4)]">
        <div>
          <h2
            id={titleId}
            className="font-[family-name:var(--font-display)] text-lg font-semibold"
          >
            {title}
          </h2>
          {description ? (
            <p
              id={descriptionId}
              className="mt-1 text-sm text-[var(--color-muted)]"
            >
              {description}
            </p>
          ) : null}
        </div>
        <IconButton
          aria-label="Close dialog"
          data-autofocus
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      </div>
      <div className="px-[var(--space-5)] py-[var(--space-4)]">{children}</div>
      {footer ? (
        <div className="flex justify-end gap-2 border-t border-[var(--color-border)] px-[var(--space-5)] py-[var(--space-4)]">
          {footer}
        </div>
      ) : (
        <div className="flex justify-end border-t border-[var(--color-border)] px-[var(--space-5)] py-[var(--space-4)]">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      )}
    </dialog>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden fill="none">
      <path
        d="M4 4l8 8M12 4l-8 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
