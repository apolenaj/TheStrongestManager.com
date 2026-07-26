import type { ReactNode } from "react";
import { cn } from "@/design-system/utils/cn";

export type PageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  className?: string;
};

/**
 * Consistent page header for app and marketing content areas.
 */
export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex min-w-0 flex-col gap-5 border-b border-[var(--color-border)] pb-6 sm:flex-row sm:items-end sm:justify-between sm:pb-8",
        className,
      )}
    >
      <div className="min-w-0 max-w-2xl">
        {eyebrow ? <p className="ui-eyebrow">{eyebrow}</p> : null}
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-[-0.02em] text-[var(--color-foreground)] sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)] sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
