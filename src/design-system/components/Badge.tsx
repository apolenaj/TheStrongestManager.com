import type { HTMLAttributes } from "react";
import { SCORE_SYMBOLS } from "@/domain/accessibility-system";
import {
  scoreLabels,
  type ScoreLevel,
} from "@/design-system/tokens/colors";
import { cn } from "@/design-system/utils/cn";

export type BadgeVariant =
  | "neutral"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  score?: ScoreLevel;
};

const variantClass: Record<BadgeVariant, string> = {
  neutral:
    "bg-[var(--color-surface-elevated)] text-[var(--color-muted)] border-[var(--color-border)]",
  accent:
    "bg-[var(--color-accent-muted)] text-[var(--color-accent)] border-transparent",
  success:
    "bg-[var(--color-score-excellent-muted)] text-[var(--color-score-excellent)] border-transparent",
  warning:
    "bg-[var(--color-score-needs-attention-muted)] text-[var(--color-score-needs-attention)] border-transparent",
  danger:
    "bg-[var(--color-score-critical-muted)] text-[var(--color-score-critical)] border-transparent",
  info: "bg-[rgba(56,189,248,0.14)] text-[var(--color-info)] border-transparent",
};

const scoreClass: Record<ScoreLevel, string> = {
  excellent: variantClass.success,
  good: "bg-[var(--color-score-good-muted)] text-[var(--color-score-good)] border-transparent",
  needsAttention: variantClass.warning,
  critical: variantClass.danger,
};

export function Badge({
  className,
  variant = "neutral",
  score,
  children,
  ...props
}: BadgeProps) {
  const scoreChild =
    score != null
      ? `${SCORE_SYMBOLS[score]} ${children ?? scoreLabels[score]}`
      : children;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-sm)] border px-2 py-0.5 text-xs font-medium",
        score ? scoreClass[score] : variantClass[variant],
        className,
      )}
      {...props}
    >
      {scoreChild ?? (score ? scoreLabels[score] : null)}
    </span>
  );
}
