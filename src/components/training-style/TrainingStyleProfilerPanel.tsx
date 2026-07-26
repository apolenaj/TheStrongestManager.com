import Link from "next/link";
import { Alert, Badge, Card, CardDescription, CardHeader, CardTitle } from "@/design-system";
import type { TrainingStyleProfilePayload } from "@/domain/training-style";

export function TrainingStyleProfilerPanel({
  profile,
}: {
  profile: TrainingStyleProfilePayload;
}) {
  return (
    <div className="grid gap-6">
      <Alert tone="info" title="Practical preferences only">
        {profile.honesty[0]} {profile.honesty[1]}
      </Alert>

      {profile.summaryLine ? (
        <p className="font-[family-name:var(--font-display)] text-xl font-semibold leading-snug">
          {profile.summaryLine}
        </p>
      ) : (
        <Alert tone="warning" title="Not enough data yet">
          Complete profile frequency preferences and log sessions with RPE so
          we can describe your training preferences.
        </Alert>
      )}

      <div className="flex flex-wrap gap-2">
        <Badge variant="neutral">Last {profile.lookbackDays} days</Badge>
        {profile.statedChoices.daysPerWeek != null ? (
          <Badge variant="info">
            Stated {profile.statedChoices.daysPerWeek}d/week
          </Badge>
        ) : null}
      </div>

      <ul className="grid gap-4">
        {profile.dimensions.map((d) => (
          <li key={d.id}>
            <Card>
              <CardHeader>
                <CardTitle>{d.label}</CardTitle>
                <CardDescription>{d.bandLabel}</CardDescription>
              </CardHeader>
              <div className="grid gap-2 px-6 pb-6 text-sm">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="neutral">{d.source}</Badge>
                  <Badge variant="neutral">confidence: {d.confidence}</Badge>
                </div>
                {d.evidence.length > 0 ? (
                  <ul className="list-inside list-disc text-[var(--color-muted)]">
                    {d.evidence.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                ) : null}
                {d.missingNote ? (
                  <p className="text-xs text-[var(--color-score-needs-attention)]">
                    {d.missingNote}
                  </p>
                ) : null}
              </div>
            </Card>
          </li>
        ))}
      </ul>

      <p className="text-sm text-[var(--color-muted)]">
        Update stated choices in{" "}
        <Link
          href="/app/profile"
          className="text-[var(--color-accent)] underline-offset-2 hover:underline"
        >
          Profile
        </Link>
        . Preferences never auto-change your program.
      </p>

      <p className="text-xs text-[var(--color-muted)]">
        {profile.honesty.slice(2).join(" ")} Engine {profile.engineVersion}.
      </p>
    </div>
  );
}
