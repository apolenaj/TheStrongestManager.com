import Link from "next/link";
import {
  Badge,
  ButtonLink,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import type { CompetitionModeView } from "@/domain/competition-mode";
import { formatCompetitionDateInTimeZone, formatDateInTimeZone } from "@/domain/timezone-system";
import { CompetitionSetupForm } from "@/components/competition-mode/CompetitionSetupForm";
import { featureFlags } from "@/config/feature-flags";
import type { CompetitionModePageView } from "@/services/competition-mode";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card elevated>
      <CardHeader>
        <CardTitle className="text-lg tracking-tight">{title}</CardTitle>
      </CardHeader>
      <div className="text-sm text-[var(--color-muted)]">{children}</div>
    </Card>
  );
}

function Dashboard({
  view,
  timeZone,
}: {
  view: CompetitionModeView;
  timeZone: string;
}) {
  return (
    <div className="grid gap-4">
      <Card elevated>
        <CardHeader>
          <div className="flex flex-wrap gap-2">
            <Badge variant="accent">{view.competition.sportLabel}</Badge>
            {view.competition.weightClassLabel ? (
              <Badge variant="neutral">{view.competition.weightClassLabel}</Badge>
            ) : null}
          </div>
          <CardTitle className="mt-2 text-2xl tracking-tight">
            {view.competition.name?.trim() || "Competition Mode"}
          </CardTitle>
          <p className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--color-fg)]">
            {view.countdown.label}
          </p>
          <CardDescription className="mt-2">
            {formatCompetitionDateInTimeZone(
              view.competition.competitionDate,
              timeZone,
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      {view.strongmanNotice ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Strongman</CardTitle>
            <CardDescription>{view.strongmanNotice}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <Section title="Training phase">
        <p className="font-medium text-[var(--color-fg)]">
          {view.trainingPhase.label}
        </p>
        <p className="mt-1">{view.trainingPhase.summary}</p>
      </Section>

      <Section title="Last heavy session">
        {view.lastHeavySession ? (
          <>
            <p className="font-medium text-[var(--color-fg)]">
              {view.lastHeavySession.exerciseLabel}:{" "}
              {view.lastHeavySession.summary}
            </p>
            <p className="mt-1">
              {formatDateInTimeZone(view.lastHeavySession.at, timeZone)}
            </p>
          </>
        ) : (
          <p>No recent heavy work logged (RPE ≥ 8 or ≤3 reps).</p>
        )}
      </Section>

      <Section title="Taper">
        <p className="font-medium text-[var(--color-fg)]">{view.taper.headline}</p>
        <ul className="mt-2 grid gap-2">
          {view.taper.bullets.map((b, i) => (
            <li key={i} className="border-l-2 border-[var(--color-border)] pl-3">
              {b}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs">Illustrative only — not auto-applied.</p>
      </Section>

      <Section title="Attempt planning">
        <div className="grid gap-4">
          {view.attemptPlans.map((p) => (
            <div key={p.lift}>
              <p className="font-medium text-[var(--color-fg)]">{p.label}</p>
              {p.openerKg != null ? (
                <p className="mt-1">
                  Opener {p.openerKg} · 2nd {p.secondKg} · 3rd {p.thirdKg} kg
                </p>
              ) : (
                <p className="mt-1">No sketch yet.</p>
              )}
              <p className="mt-1 text-xs">{p.basis}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs">
          <Link
            href="/app/attempt-selector"
            className="text-[var(--color-accent)] underline-offset-2 hover:underline"
          >
            Open Attempt Selector
          </Link>{" "}
          for risk preference and conditional thirds.
        </p>
      </Section>

      <Section title="Bodyweight trend">
        <p>{view.bodyweightTrend.summary}</p>
      </Section>

      <Section title="Readiness">
        <p>{view.readiness.summary}</p>
      </Section>

      <Card elevated>
        <CardHeader>
          <Badge variant="warning">Weight class</Badge>
          <CardTitle className="mt-2 text-lg tracking-tight">
            {view.weightCut.headline}
          </CardTitle>
          <CardDescription>{view.weightCut.detail}</CardDescription>
        </CardHeader>
        <div className="grid gap-2 text-sm">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--color-muted)]">
            Safety warnings
          </p>
          <ul className="grid gap-2">
            {view.weightCut.safetyWarnings.map((w, i) => (
              <li
                key={i}
                className="border-l-2 border-[var(--color-warning,var(--color-border))] pl-3 text-[var(--color-muted)]"
              >
                {w}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            Auto-prescribes dehydration: never.
          </p>
        </div>
      </Card>

      <ul className="grid gap-1 text-xs text-[var(--color-muted)]">
        {view.honestyNotes.map((n, i) => (
          <li key={i}>{n}</li>
        ))}
      </ul>
    </div>
  );
}

export function CompetitionModePanel({
  page,
}: {
  page: CompetitionModePageView;
}) {
  return (
    <div className="grid gap-8">
      {page.view ? (
        <Dashboard view={page.view} timeZone={page.timeZone} />
      ) : null}

      <div className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl tracking-tight">
          {page.prep ? "Update meet details" : "Set up Competition Mode"}
        </h2>
        <p className="text-sm text-[var(--color-muted)]">
          Competition date, weight class, and target lifts. Strongman is listed
          for later — powerlifting and deadlift-only are ready.
        </p>
        <CompetitionSetupForm prep={page.prep} />
      </div>

      {featureFlags.liveCompetitionMode ? (
        <p className="text-sm text-[var(--color-muted)]">
          Meet-day attempt board (architecture):{" "}
          <ButtonLink href="/app/competition/live" variant="secondary">
            Live Competition
          </ButtonLink>
        </p>
      ) : null}
    </div>
  );
}
