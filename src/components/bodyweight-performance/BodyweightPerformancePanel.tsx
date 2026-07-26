import Link from "next/link";
import { Alert, Badge } from "@/design-system";
import {
  BODYWEIGHT_PERFORMANCE_TREND_LABELS,
  type BodyweightPerformanceAnalysis,
} from "@/domain/bodyweight-performance";

function TrendBadge({
  trend,
}: {
  trend: keyof typeof BODYWEIGHT_PERFORMANCE_TREND_LABELS;
}) {
  const variant =
    trend === "up"
      ? "success"
      : trend === "down"
        ? "warning"
        : trend === "stable"
          ? "accent"
          : "neutral";
  return (
    <Badge variant={variant}>{BODYWEIGHT_PERFORMANCE_TREND_LABELS[trend]}</Badge>
  );
}

export function BodyweightPerformancePanel({
  analysis,
}: {
  analysis: BodyweightPerformanceAnalysis;
}) {
  return (
    <div className="grid gap-8">
      <Alert tone="warning" title="Independent signals">
        {analysis.disclaimers[0]} {analysis.disclaimers[3]}
      </Alert>
      <Alert tone="info" title="Estimated, not a PR">
        {analysis.disclaimers[1]}
      </Alert>

      <p className="text-sm text-[var(--color-muted)]">
        Window: {analysis.windowLabel}
      </p>

      <section className="grid gap-4">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Trends
        </h2>
        <ul className="grid gap-3">
          <li className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">Bodyweight</span>
              <TrendBadge trend={analysis.bodyweight.trend} />
            </div>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              {analysis.bodyweight.deltaDisplay ?? "—"}
              {analysis.bodyweight.startKg != null &&
              analysis.bodyweight.endKg != null
                ? ` (${analysis.bodyweight.startKg.toFixed(1)} → ${analysis.bodyweight.endKg.toFixed(1)} kg)`
                : null}
            </p>
          </li>
          <li className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">Estimated strength</span>
              <TrendBadge trend={analysis.estimatedStrength.trend} />
            </div>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              {analysis.estimatedStrength.deltaDisplay ?? "—"}
              {analysis.estimatedStrength.startKg != null &&
              analysis.estimatedStrength.endKg != null
                ? ` (${analysis.estimatedStrength.startKg.toFixed(1)} → ${analysis.estimatedStrength.endKg.toFixed(1)} kg e1RM)`
                : null}
            </p>
          </li>
          <li className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">Relative strength</span>
              <TrendBadge trend={analysis.relativeStrength.trend} />
            </div>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              {analysis.relativeStrength.deltaDisplay ?? "—"}
              {analysis.relativeStrength.startRatio != null &&
              analysis.relativeStrength.endRatio != null
                ? ` (${analysis.relativeStrength.startRatio.toFixed(2)}× → ${analysis.relativeStrength.endRatio.toFixed(2)}× BW)`
                : null}
            </p>
          </li>
        </ul>
      </section>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Relationship narrative
        </h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-[var(--color-foreground)]">
          {analysis.narrativeLines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      {analysis.missingNotes.length > 0 ? (
        <Alert tone="info" title="Missing data">
          <ul className="list-disc pl-5 text-sm">
            {analysis.missingNotes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </Alert>
      ) : null}

      <p className="text-sm text-[var(--color-muted)]">
        Log bodyweight on your{" "}
        <Link href="/app/profile" className="text-[var(--color-accent)]">
          profile
        </Link>{" "}
        and train with multi-rep sets for estimated strength. Also see{" "}
        <Link href="/app/progress" className="text-[var(--color-accent)]">
          Progress
        </Link>
        .
      </p>
    </div>
  );
}
