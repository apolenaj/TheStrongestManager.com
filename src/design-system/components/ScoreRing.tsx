import {
  formatScoreAnnouncement,
  scorePresentation,
  type ScoreLevel as A11yScoreLevel,
} from "@/domain/accessibility-system";
import {
  scoreLevelFromValue,
  type ScoreLevel,
} from "@/design-system/tokens/colors";
import { cn } from "@/design-system/utils/cn";

export type ScoreRingProps = {
  /** 0–100 */
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  /** Override auto level from value */
  level?: ScoreLevel;
  className?: string;
};

const strokeVar: Record<ScoreLevel, string> = {
  excellent: "var(--color-score-excellent)",
  good: "var(--color-score-good)",
  needsAttention: "var(--color-score-needs-attention)",
  critical: "var(--color-score-critical)",
};

/**
 * Technique / performance score ring.
 * Always shows numeric value + text label + non-color symbol (WCAG 1.4.1).
 */
export function ScoreRing({
  value,
  size = 96,
  strokeWidth = 8,
  label,
  level,
  className,
}: ScoreRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const resolved = level ?? scoreLevelFromValue(clamped);
  const presentation = scorePresentation(resolved as A11yScoreLevel);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className={cn("inline-flex flex-col items-center gap-2", className)}
      role="img"
      aria-label={formatScoreAnnouncement(
        clamped,
        resolved as A11yScoreLevel,
        label,
      )}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeVar[resolved]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-[stroke-dashoffset] duration-[var(--duration-slow)] ease-[var(--easing-standard)]"
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="central"
          textAnchor="middle"
          fill="var(--color-foreground)"
          fontSize={size * 0.22}
          fontWeight={600}
          fontFamily="var(--font-display)"
        >
          {Math.round(clamped)}
        </text>
      </svg>
      {label ? (
        <span className="text-sm text-[var(--color-muted)]">{label}</span>
      ) : null}
      <span className="text-xs font-medium text-[var(--color-foreground)]">
        <span aria-hidden className="mr-1">
          {presentation.symbol}
        </span>
        {presentation.text}
      </span>
    </div>
  );
}
