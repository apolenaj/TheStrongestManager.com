import Link from "next/link";
import {
  Alert,
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import type { MultiSportModePayload } from "@/domain/multi-sport-mode";
import { multiSportModeText } from "@/domain/multi-sport-mode";

export function MultiSportModePanel({
  mode,
}: {
  mode: MultiSportModePayload;
}) {
  return (
    <div className="grid gap-8">
      <Alert tone="info" title="Multi-Sport Athlete Mode">
        {multiSportModeText(mode)} {mode.honesty[0]}
      </Alert>

      <Alert tone="success" title="Single profile">
        Profiles duplicated: {mode.singleProfile ? "no" : "yes"}. Mixed goals
        allowed: {mode.mixedGoalsAllowed ? "yes" : "no"}. Lead discipline:{" "}
        {mode.leadDiscipline ?? "not set"}.
      </Alert>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Active focuses
        </h2>
        {mode.focuses.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">
            Select multiple sports under Profile → Sport focus (e.g. Powerlifting
            + Strongman).
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {mode.focuses.map((focus) => (
              <li key={focus.id}>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>{focus.label}</CardTitle>
                    <CardDescription>
                      PR namespace: {focus.prNamespace}
                    </CardDescription>
                  </CardHeader>
                  <div className="grid gap-2 px-6 pb-6 text-sm">
                    <Badge variant="neutral">{focus.prCount} PRs</Badge>
                    <Link
                      href={focus.href}
                      className="text-[var(--color-accent)] underline-offset-2 hover:underline"
                    >
                      Open mode
                    </Link>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          PRs by sport
        </h2>
        <p className="text-sm text-[var(--color-muted)]">
          Separated by namespace — never merged into a cross-sport total.
        </p>
        <ul className="grid gap-4">
          {mode.prGroups.map((group) => (
            <li key={group.sportId}>
              <Card>
                <CardHeader>
                  <CardTitle>{group.sportLabel}</CardTitle>
                  <CardDescription>
                    <Link
                      href={group.href}
                      className="text-[var(--color-accent)] underline-offset-2 hover:underline"
                    >
                      Open {group.sportLabel}
                    </Link>
                  </CardDescription>
                </CardHeader>
                <div className="px-6 pb-6 text-sm">
                  {group.prs.length === 0 ? (
                    <p className="text-[var(--color-muted)]">
                      {group.emptyNote}
                    </p>
                  ) : (
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {group.prs.map((pr) => (
                        <li
                          key={pr.metricKey}
                          className="flex items-baseline justify-between gap-2"
                        >
                          <span className="text-[var(--color-muted)]">
                            {pr.label}
                          </span>
                          <span className="font-medium">
                            {pr.value} {pr.unit}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Goals
        </h2>
        <p className="text-sm text-[var(--color-muted)]">
          Training may contain mixed goals across focuses.
        </p>
        {mode.goals.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">
            No active goals yet — add them from Profile.
          </p>
        ) : (
          <ul className="grid gap-2">
            {mode.goals.map((goal, index) => (
              <li
                key={`${goal.title}-${index}`}
                className="flex flex-wrap items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-3 text-sm"
              >
                <span className="font-medium">{goal.title}</span>
                <Badge variant="neutral">{goal.category}</Badge>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-xs text-[var(--color-muted)]">
        {mode.honesty.slice(1).join(" ")} Engine {mode.engineVersion}.
      </p>
    </div>
  );
}
