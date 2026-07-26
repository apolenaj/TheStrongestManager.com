import Link from "next/link";
import {
  Alert,
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import type { PowerliftingModePayload } from "@/domain/powerlifting-mode";

export function PowerliftingModePanel({
  mode,
}: {
  mode: PowerliftingModePayload;
}) {
  return (
    <div className="grid gap-8">
      <Alert tone="info" title="Powerlifting Mode">
        {mode.honesty[0]} {mode.honesty[2]}
      </Alert>

      <Alert tone="warning" title="Federation selection later">
        {mode.federation.note}
      </Alert>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Dashboard priorities
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
          Training
        </h2>
        <ul className="grid gap-3">
          {mode.training.map((t) => (
            <li key={t.id}>
              <Card>
                <CardHeader>
                  <CardTitle>{t.label}</CardTitle>
                  <CardDescription>{t.headline}</CardDescription>
                </CardHeader>
                <div className="grid gap-2 px-6 pb-6 text-sm">
                  <p className="text-[var(--color-muted)]">{t.detail}</p>
                  {t.cues && t.cues.length > 0 ? (
                    <ul className="flex flex-wrap gap-2">
                      {t.cues.map((cue) => (
                        <li key={cue}>
                          <Badge variant="info">{cue}</Badge>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <Link
                    href={t.href}
                    className="text-[var(--color-accent)] underline-offset-2 hover:underline"
                  >
                    Open
                  </Link>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Technique library
        </h2>
        <p className="text-sm text-[var(--color-muted)]">
          Core competition lifts from the exercise catalog.
        </p>
        <ul className="grid gap-2 sm:grid-cols-3">
          {mode.techniqueLibrary.map((t) => (
            <li key={t.slug}>
              <Link
                href={t.href}
                className="block rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-3 text-sm font-medium text-[var(--color-accent)] underline-offset-2 hover:underline"
              >
                {t.label}
              </Link>
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
