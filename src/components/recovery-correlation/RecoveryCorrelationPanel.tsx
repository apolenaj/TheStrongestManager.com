import Link from "next/link";
import { Alert, Badge } from "@/design-system";
import {
  RECOVERY_CORR_MIN_WEEKS_PER_ARM,
  RECOVERY_CORR_MIN_WEEKS_TOTAL,
  type RecoveryCorrelationAnalysis,
} from "@/domain/recovery-correlation";

export function RecoveryCorrelationPanel({
  analysis,
}: {
  analysis: RecoveryCorrelationAnalysis;
}) {
  const published = analysis.insights.filter((i) => i.publishable);

  return (
    <div className="grid gap-8">
      <Alert tone="warning" title="Observed association — not causal proof">
        {analysis.honesty[0]} {analysis.honesty[1]}
      </Alert>
      <Alert tone="info" title="Confounders exist">
        {analysis.honesty[2]} {analysis.honesty[3]}
      </Alert>

      <p className="text-sm text-[var(--color-muted)]">
        Weeks with both recovery and performance signals:{" "}
        {analysis.weeksWithBothSignals}. Thresholds: ≥
        {RECOVERY_CORR_MIN_WEEKS_TOTAL} total weeks, ≥
        {RECOVERY_CORR_MIN_WEEKS_PER_ARM} weeks per compared group.
      </p>

      <section className="grid gap-4">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Associations with sufficient data
        </h2>
        {published.length === 0 ? (
          <Alert tone="info" title="No publishable correlations yet">
            {analysis.suppressedCount} candidate pattern
            {analysis.suppressedCount === 1 ? "" : "s"} suppressed for
            insufficient sample. Keep logging sleep, stress, soreness, and
            session RPE.
          </Alert>
        ) : (
          <ul className="grid gap-4">
            {published.map((insight) => (
              <li
                key={insight.id}
                className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="accent">{insight.associationLabel}</Badge>
                  <Badge variant="neutral">{insight.causalityLabel}</Badge>
                </div>
                <h3 className="mt-3 font-medium text-[var(--color-foreground)]">
                  {insight.headline}
                </h3>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  {insight.detail}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {analysis.missingNotes.length > 0 ? (
        <Alert tone="info" title="More data helps">
          <ul className="list-disc pl-5 text-sm">
            {analysis.missingNotes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </Alert>
      ) : null}

      <p className="text-sm text-[var(--color-muted)]">
        Log check-ins on{" "}
        <Link href="/app/recovery" className="text-[var(--color-accent)]">
          Recovery
        </Link>{" "}
        and session RPE after training. Signals analyzed: sleep, stress,
        soreness, and performance (session RPE).
      </p>
    </div>
  );
}
