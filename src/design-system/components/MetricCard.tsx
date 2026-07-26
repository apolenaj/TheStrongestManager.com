import { Card } from "@/design-system/components/Card";
import { Badge } from "@/design-system/components/Badge";
import {
  scoreLabels,
  type ScoreLevel,
} from "@/design-system/tokens/colors";
import { cn } from "@/design-system/utils/cn";

export type MetricCardProps = {
  label: string;
  value: string | number;
  unit?: string;
  delta?: string;
  deltaTone?: "positive" | "negative" | "neutral";
  score?: ScoreLevel;
  description?: string;
  className?: string;
};

const deltaClass = {
  positive: "text-[var(--color-score-excellent)]",
  negative: "text-[var(--color-score-critical)]",
  neutral: "text-[var(--color-muted)]",
} as const;

export function MetricCard({
  label,
  value,
  unit,
  delta,
  deltaTone = "neutral",
  score,
  description,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("flex flex-col gap-[var(--space-2)]", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[var(--letter-wider,0.2em)] text-[var(--color-subtle)]">
          {label}
        </p>
        {score ? (
          <Badge score={score}>{scoreLabels[score]}</Badge>
        ) : null}
      </div>
      <p className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
        {value}
        {unit ? (
          <span className="ml-1 text-base font-medium text-[var(--color-muted)]">
            {unit}
          </span>
        ) : null}
      </p>
      {delta ? (
        <p className={cn("text-sm", deltaClass[deltaTone])}>{delta}</p>
      ) : null}
      {description ? (
        <p className="text-sm text-[var(--color-muted)]">{description}</p>
      ) : null}
    </Card>
  );
}
