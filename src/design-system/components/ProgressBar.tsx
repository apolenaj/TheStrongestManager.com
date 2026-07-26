import {
  scoreLabels,
  scoreLevelFromValue,
  type ScoreLevel,
} from "@/design-system/tokens/colors";
import { SCORE_SYMBOLS } from "@/domain/accessibility-system";
import { cn } from "@/design-system/utils/cn";

export type ProgressBarProps = {
  value: number;
  max?: number;
  label: string;
  showValue?: boolean;
  tone?: ScoreLevel | "accent" | "neutral";
  className?: string;
};

const toneClass: Record<ScoreLevel | "accent" | "neutral", string> = {
  excellent: "bg-[var(--color-score-excellent)]",
  good: "bg-[var(--color-score-good)]",
  needsAttention: "bg-[var(--color-score-needs-attention)]",
  critical: "bg-[var(--color-score-critical)]",
  accent: "bg-[var(--color-accent)]",
  neutral: "bg-[var(--color-border-strong)]",
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  tone,
  className,
}: ProgressBarProps) {
  const pct = max <= 0 ? 0 : Math.max(0, Math.min(100, (value / max) * 100));
  const resolved = tone ?? scoreLevelFromValue(pct);
  const explicitScore =
    tone === "excellent" ||
    tone === "good" ||
    tone === "needsAttention" ||
    tone === "critical"
      ? tone
      : null;
  const valueText = showValue
    ? explicitScore
      ? `${Math.round(pct)}% ${SCORE_SYMBOLS[explicitScore]} ${scoreLabels[explicitScore]}`
      : `${Math.round(pct)}%`
    : undefined;

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="text-[var(--color-muted)]">{label}</span>
        {valueText ? (
          <span className="tabular-nums text-[var(--color-foreground)]">
            {valueText}
          </span>
        ) : null}
      </div>
      <div
        className="h-2 overflow-hidden rounded-[var(--radius-full)] bg-[var(--color-surface-elevated)]"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={
          explicitScore
            ? `${label}: ${Math.round(pct)} percent, ${scoreLabels[explicitScore]}`
            : label
        }
      >
        <div
          className={cn(
            "h-full rounded-[var(--radius-full)] transition-[width] duration-[var(--duration-normal)] ease-[var(--easing-standard)]",
            toneClass[resolved],
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
