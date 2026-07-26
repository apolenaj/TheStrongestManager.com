import Link from "next/link";
import {
  Alert,
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import type { BodybuildingModePayload } from "@/domain/bodybuilding-mode";

export function BodybuildingModePanel({
  mode,
}: {
  mode: BodybuildingModePayload;
}) {
  return (
    <div className="grid gap-8">
      <Alert tone="info" title="Bodybuilding Mode">
        {mode.honesty[0]} {mode.honesty[1]}
      </Alert>

      <Alert tone="warning" title="Photos & body-fat">
        {mode.photos.note}
      </Alert>

      <Alert tone="success" title="No growth score">
        {mode.muscleGrowthScore.reason}
      </Alert>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Priorities
        </h2>
        <p className="text-sm text-[var(--color-muted)]">
          Last {mode.lookbackDays} days.
        </p>
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
          Muscle-group workload
        </h2>
        {mode.muscleWorkload.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">
            No primary-muscle sets in this window yet.
          </p>
        ) : (
          <ul className="grid gap-2">
            {mode.muscleWorkload.map((m) => (
              <li
                key={m.muscleKey}
                className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-3 text-sm"
              >
                <span className="font-medium">{m.label}</span>
                <span className="text-[var(--color-muted)]">
                  {m.setCount} sets · {m.volumeKg} kg
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Exercise progression
        </h2>
        {mode.exerciseProgression.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">
            No repeated loaded exercises yet.
          </p>
        ) : (
          <ul className="grid gap-2">
            {mode.exerciseProgression.map((e) => (
              <li
                key={e.exerciseId}
                className="grid gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-3 text-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {e.href ? (
                    <Link
                      href={e.href}
                      className="font-medium text-[var(--color-accent)] underline-offset-2 hover:underline"
                    >
                      {e.exerciseName}
                    </Link>
                  ) : (
                    <span className="font-medium">{e.exerciseName}</span>
                  )}
                  <Badge variant="neutral">{e.trend}</Badge>
                </div>
                <p className="text-[var(--color-muted)]">
                  {e.setCount} sets · {e.volumeKg} kg
                  {e.latestLoadKg != null
                    ? ` · latest ${e.latestLoadKg} kg`
                    : ""}
                  {e.priorLoadKg != null ? ` · prior ${e.priorLoadKg} kg` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Recovery & photos
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {mode.support
            .filter((s) => s.id === "recovery" || s.id === "physique_photos")
            .map((s) => (
              <li key={s.id}>
                <Card>
                  <CardHeader>
                    <CardTitle>{s.label}</CardTitle>
                    <CardDescription>{s.headline}</CardDescription>
                  </CardHeader>
                  <div className="grid gap-2 px-6 pb-6 text-sm">
                    <p className="text-[var(--color-muted)]">{s.detail}</p>
                    {s.href ? (
                      <Link
                        href={s.href}
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

      <p className="text-xs text-[var(--color-muted)]">
        {mode.honesty.slice(2).join(" ")} Engine {mode.engineVersion}.
      </p>
    </div>
  );
}
