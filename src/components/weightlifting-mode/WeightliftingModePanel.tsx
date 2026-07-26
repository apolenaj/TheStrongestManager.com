import Link from "next/link";
import {
  Alert,
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import type { WeightliftingModePayload } from "@/domain/weightlifting-mode";

export function WeightliftingModePanel({
  mode,
}: {
  mode: WeightliftingModePayload;
}) {
  return (
    <div className="grid gap-8">
      <Alert tone="info" title="Weightlifting Mode">
        {mode.honesty[0]} {mode.honesty[1]}
      </Alert>

      <Alert tone="warning" title="Technique analysis deferred">
        {mode.techniqueAnalysis.reason} Advanced video analysis flag:{" "}
        {mode.techniqueAnalysis.advancedVideoAnalysisEnabled
          ? "on (models still not shipped)"
          : "off"}
        .
      </Alert>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Lifts & priorities
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {mode.priorities.map((p) => (
            <li key={p.id}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>{p.label}</CardTitle>
                  <CardDescription>{p.headline}</CardDescription>
                </CardHeader>
                <div className="grid gap-2 px-6 pb-6 text-sm">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={p.available ? "success" : "neutral"}>
                      {p.available ? "ready" : "pending"}
                    </Badge>
                    {p.metricValue != null && p.metricUnit ? (
                      <Badge variant="neutral">
                        {p.metricValue} {p.metricUnit}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-[var(--color-muted)]">{p.detail}</p>
                  {p.missingNote ? (
                    <p className="text-xs text-[var(--color-score-needs-attention)]">
                      {p.missingNote}
                    </p>
                  ) : null}
                  {p.href ? (
                    <Link
                      href={p.href}
                      className="text-[var(--color-accent)] underline-offset-2 hover:underline"
                    >
                      Open
                    </Link>
                  ) : null}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Tracking
        </h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {(
            Object.entries(mode.tracking) as Array<
              [
                string,
                WeightliftingModePayload["tracking"][keyof WeightliftingModePayload["tracking"]],
              ]
            >
          ).map(([key, row]) => (
            <li
              key={key}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-3 text-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{row.label}</span>
                <Badge variant="neutral">{row.status}</Badge>
              </div>
              <p className="mt-1 text-[var(--color-muted)]">{row.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Positions
        </h2>
        <p className="text-sm text-[var(--color-muted)]">
          Educational cues only — not automatic video scoring.
        </p>
        <ul className="grid gap-2">
          {mode.positions.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-3 text-sm"
            >
              <span className="font-medium">{p.label}</span>
              <span className="text-[var(--color-muted)]">
                {p.lifts.join(" · ")}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Attempts
        </h2>
        <Card>
          <CardHeader>
            <CardTitle>
              {mode.attempts.snatchAttempts} snatch ·{" "}
              {mode.attempts.cleanAndJerkAttempts} clean & jerk
            </CardTitle>
            <CardDescription>{mode.attempts.detail}</CardDescription>
          </CardHeader>
          <div className="px-6 pb-6 text-sm">
            <Link
              href={mode.attempts.href}
              className="text-[var(--color-accent)] underline-offset-2 hover:underline"
            >
              Open Competition
            </Link>
          </div>
        </Card>
      </section>

      <p className="text-xs text-[var(--color-muted)]">
        {mode.honesty.slice(2).join(" ")} Engine {mode.engineVersion}.
      </p>
    </div>
  );
}
