import Link from "next/link";
import {
  Badge,
  ButtonLink,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import type {
  ComponentTrend,
  TechniqueTrendResult,
  TechniqueTrendSeries,
} from "@/domain/technique-trend";

function directionLabel(d: TechniqueTrendSeries["direction"]): string {
  if (d === "up") return "Improving";
  if (d === "down") return "Regressing";
  if (d === "flat") return "Stable overall";
  return "Unknown";
}

function MetricList({
  title,
  items,
  empty,
}: {
  title: string;
  items: ComponentTrend[];
  empty: string;
}) {
  return (
    <section>
      <h3 className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-[var(--color-muted)]">{empty}</p>
      ) : (
        <ul className="mt-2 grid gap-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="border-l-2 border-[var(--color-border)] pl-3 text-sm"
            >
              <span className="font-medium text-[var(--color-fg)]">
                {item.label}
              </span>
              <span className="text-[var(--color-muted)]">
                {" "}
                · {item.scores.join(" → ")} (Δ
                {item.delta > 0 ? "+" : ""}
                {item.delta})
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function SeriesCard({ series }: { series: TechniqueTrendSeries }) {
  const scores = series.overallScores.map((p) => p.score);

  return (
    <Card elevated>
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          <Badge variant="accent">{series.exerciseName}</Badge>
          <Badge variant="neutral">{series.cameraAngle} view</Badge>
          <Badge variant="info">Confidence: {series.confidence}</Badge>
          <Badge variant="neutral">{directionLabel(series.direction)}</Badge>
        </div>
        <CardTitle className="mt-2 text-xl tracking-tight">
          {series.exerciseName} Technique Score
        </CardTitle>
        <CardDescription>
          Comparable series only — same exercise and compatible camera angle.
        </CardDescription>
      </CardHeader>

      <div className="grid gap-5 text-sm">
        <div className="flex flex-wrap items-end gap-3">
          {series.overallScores.map((point) => (
            <Link
              key={point.analysisId}
              href={point.href}
              className="group grid gap-1 text-center"
            >
              <span className="font-[family-name:var(--font-display)] text-3xl font-semibold tabular-nums tracking-tight text-[var(--color-fg)] transition-colors group-hover:text-[var(--color-accent)]">
                {point.score}
              </span>
              <span className="text-xs text-[var(--color-muted)]">
                {point.createdAtIso.slice(0, 10)}
              </span>
            </Link>
          ))}
        </div>
        <p className="text-[var(--color-muted)]">
          Series: {scores.join(" · ")}
          {series.overallDelta != null ? (
            <>
              {" "}
              · Δ{series.overallDelta > 0 ? "+" : ""}
              {series.overallDelta}
            </>
          ) : null}
        </p>

        {series.mostImproved ? (
          <section>
            <h3 className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
              Most improved technical element
            </h3>
            <p className="mt-2 text-[var(--color-fg)]">
              {series.mostImproved.detail}
            </p>
          </section>
        ) : null}

        {series.persistentIssue ? (
          <section>
            <h3 className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
              Current persistent issue
            </h3>
            <p className="mt-2 text-[var(--color-fg)]">
              {series.persistentIssue.detail}
            </p>
          </section>
        ) : (
          <p className="text-[var(--color-muted)]">
            No persistent issue band across this comparable series.
          </p>
        )}

        <MetricList
          title="Improved metrics"
          items={series.improved}
          empty="No component improved by the delta threshold yet."
        />
        <MetricList
          title="Stable metrics"
          items={series.stable}
          empty="No stable component trends in this series."
        />
        <MetricList
          title="Regressed metrics"
          items={series.regressed}
          empty="No component regressed by the delta threshold."
        />

        {series.excludedIncompatibleCount > 0 ? (
          <p className="text-xs text-[var(--color-subtle)]">
            {series.excludedIncompatibleCount} analysis/analyses excluded from
            this series due to incompatible camera angles.
          </p>
        ) : null}

        {series.missingInformation.length > 0 ? (
          <ul className="list-disc space-y-1 pl-5 text-xs text-[var(--color-subtle)]">
            {series.missingInformation.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </Card>
  );
}

export function TechniqueTrendPanel({
  result,
}: {
  result: TechniqueTrendResult;
}) {
  return (
    <div className="grid gap-6">
      <Card elevated>
        <CardHeader>
          <div className="flex flex-wrap gap-2">
            <Badge variant="accent">Technique Trend Engine</Badge>
            <Badge variant="neutral">{result.engineVersion}</Badge>
          </div>
          <CardTitle className="mt-2 text-2xl tracking-tight">
            Technique over time
          </CardTitle>
          <CardDescription>
            Longitudinal scores and component trends — never mixed across
            incompatible camera angles.
          </CardDescription>
        </CardHeader>
        <ul className="grid gap-2 text-sm text-[var(--color-muted)]">
          {result.honesty.map((line) => (
            <li
              key={line}
              className="border-l-2 border-[var(--color-border)] pl-3"
            >
              {line}
            </li>
          ))}
        </ul>
        {result.skippedSummary ? (
          <p className="mt-3 text-xs text-[var(--color-subtle)]">
            {result.skippedSummary}
          </p>
        ) : null}
      </Card>

      {result.emptyReason ? (
        <Card>
          <CardHeader>
            <CardTitle>No technique trends yet</CardTitle>
            <CardDescription>{result.emptyReason}</CardDescription>
          </CardHeader>
          <div className="flex flex-wrap gap-2">
            <ButtonLink href="/app/technique">Upload technique</ButtonLink>
          </div>
        </Card>
      ) : (
        result.series.map((s) => <SeriesCard key={s.id} series={s} />)
      )}
    </div>
  );
}
