import Link from "next/link";
import {
  Alert,
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import {
  STRONGMAN_METRIC_LABELS,
  type StrongmanEventPr,
  type StrongmanModePayload,
} from "@/domain/strongman-mode";
import {
  formatDistance,
  formatMass,
  toCanonicalKg,
  toCanonicalMeters,
  type MassUnit,
} from "@/domain/unit-system";

function formatStrongmanPrDisplay(
  pr: StrongmanEventPr,
  units: MassUnit,
): string {
  if (pr.metric === "weight") {
    return formatMass(toCanonicalKg(pr.value, pr.unit), units);
  }
  if (pr.metric === "distance") {
    return formatDistance(toCanonicalMeters(pr.value, pr.unit), units);
  }
  return `${pr.value} ${pr.unit}`;
}

export function StrongmanModePanel({
  mode,
  units = "kg",
}: {
  mode: StrongmanModePayload;
  /** Presentation preference — values stay canonical in storage. */
  units?: MassUnit;
}) {
  return (
    <div className="grid gap-8">
      <Alert tone="info" title="Strongman Mode">
        {mode.honesty[0]} {mode.honesty[2]}
      </Alert>

      <Alert tone="success" title="Architecture guard">
        Powerlifting metrics forced:{" "}
        {mode.powerliftingMetricsForced ? "yes" : "no"}. Excluded:{" "}
        {mode.excludedPowerliftingMetrics.join(", ")}.
      </Alert>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Priorities
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
                        {p.metricUnit === "kg" || p.metricUnit === "lb"
                          ? formatMass(
                              toCanonicalKg(p.metricValue, p.metricUnit),
                              units,
                            )
                          : p.metricUnit === "m" ||
                              p.metricUnit === "ft" ||
                              p.metricUnit === "km" ||
                              p.metricUnit === "mi"
                            ? formatDistance(
                                toCanonicalMeters(p.metricValue, p.metricUnit),
                                units,
                              )
                            : `${p.metricValue} ${p.metricUnit}`}
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
          Event types
        </h2>
        <ul className="grid gap-4">
          {mode.events.map((event) => (
            <li key={event.eventId}>
              <Card>
                <CardHeader>
                  <CardTitle>{event.label}</CardTitle>
                  <CardDescription>
                    Tracks:{" "}
                    {event.trackedMetrics
                      .map((m) => STRONGMAN_METRIC_LABELS[m])
                      .join(" · ")}
                  </CardDescription>
                </CardHeader>
                <div className="grid gap-2 px-6 pb-6 text-sm">
                  {event.prs.length === 0 ? (
                    <p className="text-[var(--color-muted)]">
                      No event PRs logged yet
                      {event.missingMetrics.length > 0
                        ? ` — missing ${event.missingMetrics
                            .map((m) => STRONGMAN_METRIC_LABELS[m])
                            .join(", ")}`
                        : ""}
                      .
                    </p>
                  ) : (
                    <ul className="grid gap-2">
                      {event.prs.map((pr) => (
                        <li
                          key={`${pr.metricKey}-${pr.value}`}
                          className="flex flex-wrap items-center justify-between gap-2"
                        >
                          <span className="font-medium">{pr.metricLabel}</span>
                          <Badge variant="info">
                            {formatStrongmanPrDisplay(pr, units)}
                          </Badge>
                        </li>
                      ))}
                      {event.missingMetrics.length > 0 ? (
                        <li className="text-xs text-[var(--color-muted)]">
                          Still open:{" "}
                          {event.missingMetrics
                            .map((m) => STRONGMAN_METRIC_LABELS[m])
                            .join(", ")}
                        </li>
                      ) : null}
                    </ul>
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-xs text-[var(--color-muted)]">
        {mode.honesty[1]} {mode.honesty[3]} Engine {mode.engineVersion}.
      </p>
    </div>
  );
}
