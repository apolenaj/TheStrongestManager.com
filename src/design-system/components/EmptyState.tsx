import type { ReactNode } from "react";
import { cn } from "@/design-system/utils/cn";

export type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

/**
 * Honest empty state — use instead of fake demo data.
 */
export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-start overflow-hidden rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)] px-[var(--space-6)] py-[var(--space-8)] shadow-[var(--shadow-panel)]",
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 w-0.5 bg-[var(--color-accent)]/70"
      />
      <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--color-foreground)]">
        {title}
      </h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--color-muted)]">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
