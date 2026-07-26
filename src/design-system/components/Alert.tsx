import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/design-system/utils/cn";

export type AlertTone = "info" | "success" | "warning" | "danger";

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
  tone?: AlertTone;
  title: string;
  children?: ReactNode;
};

const toneClass: Record<AlertTone, string> = {
  info: "border-[var(--color-info)]/40 bg-[rgba(56,189,248,0.08)]",
  success:
    "border-[var(--color-score-excellent)]/40 bg-[var(--color-score-excellent-muted)]",
  warning:
    "border-[var(--color-score-needs-attention)]/40 bg-[var(--color-score-needs-attention-muted)]",
  danger:
    "border-[var(--color-score-critical)]/40 bg-[var(--color-score-critical-muted)]",
};

const titleTone: Record<AlertTone, string> = {
  info: "text-[var(--color-info)]",
  success: "text-[var(--color-score-excellent)]",
  warning: "text-[var(--color-score-needs-attention)]",
  danger: "text-[var(--color-score-critical)]",
};

export function Alert({
  className,
  tone = "info",
  title,
  children,
  role = "status",
  ...props
}: AlertProps) {
  return (
    <div
      role={role}
      className={cn(
        "rounded-[var(--radius-md)] border px-[var(--space-4)] py-3.5 shadow-[var(--shadow-sm)]",
        toneClass[tone],
        className,
      )}
      {...props}
    >
      <p className={cn("text-sm font-semibold", titleTone[tone])}>{title}</p>
      {children ? (
        <div className="mt-1 text-sm text-[var(--color-muted)]">{children}</div>
      ) : null}
    </div>
  );
}
