import Link from "next/link";
import { Alert, Badge } from "@/design-system";
import {
  AB_INSIGHT_MIN_SAMPLE,
  AB_PROGRAMMING_DIMENSION_DESCRIPTIONS,
  AB_PROGRAMMING_DIMENSION_LABELS,
  type AbProgrammingInsightsOverview,
} from "@/domain/ab-programming-insights";

export function AbProgrammingInsightsPanel({
  overview,
}: {
  overview: AbProgrammingInsightsOverview;
}) {
  return (
    <div className="grid gap-8">
      <Alert tone="info" title="Architecture readiness">
        {overview.honesty[0]} Pipeline status:{" "}
        <code>{overview.pipelineStatus}</code>.
      </Alert>
      <Alert tone="warning" title="Sample thresholds & causation">
        {overview.honesty[1]} {overview.honesty[2]}
      </Alert>
      <Alert tone="info" title="Not personal Experiment Mode">
        {overview.honesty[3]} See{" "}
        <Link href="/app/experiments" className="text-[var(--color-accent)]">
          Experiment Mode
        </Link>{" "}
        for personal n=1 checks.
      </Alert>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Minimum sample thresholds
        </h2>
        <ul className="grid gap-2 text-sm text-[var(--color-muted)]">
          <li>
            Default / dimension floor: ≥{AB_INSIGHT_MIN_SAMPLE.default}{" "}
            anonymized outcomes
          </li>
          <li>
            Pairwise arm comparison: ≥{AB_INSIGHT_MIN_SAMPLE.pairwiseComparison}{" "}
            per arm
          </li>
        </ul>
      </section>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Comparison dimensions
        </h2>
        <ul className="grid gap-4">
          {overview.dimensions.map((d) => (
            <li key={d}>
              <p className="font-medium text-[var(--color-foreground)]">
                {AB_PROGRAMMING_DIMENSION_LABELS[d]}
              </p>
              <p className="text-sm text-[var(--color-muted)]">
                {AB_PROGRAMMING_DIMENSION_DESCRIPTIONS[d]}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-4">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Aggregate insights
        </h2>
        <p className="text-sm text-[var(--color-muted)]">
          Suppressed cohorts: {overview.suppressedCohortCount}. Published
          observations appear only when thresholds pass.
        </p>
        <ul className="grid gap-4">
          {overview.insights.map((insight) => (
            <li
              key={insight.id}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={insight.publishable ? "success" : "neutral"}>
                  {insight.publishable ? "Publishable" : "Suppressed"}
                </Badge>
                <Badge variant="neutral">
                  {AB_PROGRAMMING_DIMENSION_LABELS[insight.dimension]}
                </Badge>
                <Badge variant="neutral">n={insight.cohortSize}</Badge>
              </div>
              <h3 className="mt-2 font-medium text-[var(--color-foreground)]">
                {insight.title}
              </h3>
              <p className="mt-1 text-xs text-[var(--color-muted)]">
                {insight.disclaimer}
              </p>
              {insight.suppressedReason ? (
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  {insight.suppressedReason}
                </p>
              ) : null}
              {insight.publishable && insight.observations.length > 0 ? (
                <ul className="mt-3 grid gap-2 text-sm">
                  {insight.observations.map((obs) => (
                    <li key={`${obs.armKey}-${obs.metricKey}`}>
                      {obs.armLabel}: {obs.metricLabel} = {obs.value}
                      {obs.unit ? ` ${obs.unit}` : ""} (arm n=
                      {obs.armSampleSize})
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-[var(--color-subtle)]">
                  No aggregate observations shown.
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <p className="text-sm text-[var(--color-muted)]">
        Related: data moat consent and k-anonymity (
        <code>docs/DATA_MOAT_ARCHITECTURE.md</code>).
      </p>
    </div>
  );
}
