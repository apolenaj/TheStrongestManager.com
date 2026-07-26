"use client";

import Link from "next/link";
import {
  Badge,
  ButtonLink,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  ScoreRing,
} from "@/design-system";
import type {
  DashboardScore,
  DashboardView,
} from "@/services/dashboard/types";
import { NOT_ENOUGH_DATA } from "@/services/dashboard/types";
import type { AthleteStateView } from "@/services/performance-intelligence";
import { AthleteStatePanel } from "@/components/performance-intelligence/AthleteStatePanel";
import { LearnWhy } from "@/components/on-site-education/LearnWhy";
import { MicroLearningCard } from "@/components/micro-learning/MicroLearningCard";

function formatWhen(date: Date | null): string {
  if (!date) return "Date not set";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function sourceBadgeLabel(source: DashboardScore["source"]): string | null {
  if (source === "insufficient") return null;
  if (source === "heuristic") return "Heuristic";
  if (source === "reported") return "Reported";
  if (source === "recommended") return "Recommended";
  return "Observed";
}

function DashboardCardLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={
        className ??
        "ui-interactive block rounded-[var(--radius-md)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
      }
    >
      {children}
    </Link>
  );
}

function ScorePillar({ score }: { score: DashboardScore }) {
  const sourceLabel = sourceBadgeLabel(score.source);

  return (
    <DashboardCardLink href={score.href}>
      <Card elevated className="h-full min-h-[9.5rem]">
        <div className="flex items-start justify-between gap-2">
          <p className="ui-eyebrow text-[var(--color-subtle)]">{score.label}</p>
          {sourceLabel ? (
            <Badge variant="neutral">{sourceLabel}</Badge>
          ) : null}
        </div>
        <div className="mt-3">
          {score.value != null ? (
            <div className="flex items-center gap-4">
              <ScoreRing value={score.value} size={72} strokeWidth={6} />
              {score.detail ? (
                <p className="text-xs leading-relaxed text-[var(--color-muted)]">
                  {score.detail}
                </p>
              ) : null}
            </div>
          ) : score.statusLabel ? (
            <>
              <p className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight">
                {score.statusLabel}
              </p>
              <p className="mt-1 text-xs text-[var(--color-muted)]">
                {score.detail ?? "Open for details."}
              </p>
            </>
          ) : (
            <>
              <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--color-muted)]">
                {score.emptyLabel}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--color-subtle)]">
                {score.detail}
              </p>
            </>
          )}
        </div>
        <div className="mt-3">
          <LearnWhy metricKey={score.key} compact />
        </div>
      </Card>
    </DashboardCardLink>
  );
}

function SectionCard({
  title,
  description,
  href,
  children,
  empty,
}: {
  title: string;
  description: string;
  href: string;
  children?: React.ReactNode;
  empty?: boolean;
}) {
  return (
    <DashboardCardLink href={href}>
      <Card elevated className="h-full">
        <CardHeader className="mb-3">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        {empty ? (
          <p className="text-sm text-[var(--color-muted)]">{NOT_ENOUGH_DATA}</p>
        ) : (
          children
        )}
        <p className="mt-5 text-xs font-medium tracking-wide text-[var(--color-accent)] transition-colors group-hover:text-[var(--color-accent-hover)]">
          View details →
        </p>
      </Card>
    </DashboardCardLink>
  );
}

function NewAthleteDashboard({ data }: { data: DashboardView }) {
  const { firstSession } = data;
  const progressPct = Math.round(
    (firstSession.completedCount / firstSession.totalCount) * 100,
  );

  const priorities: {
    id: string;
    done: boolean;
    title: string;
    body: string;
    href: string;
    cta: string;
  }[] = [
    {
      id: "profile",
      done: firstSession.profileReady,
      title: "Complete profile",
      body: firstSession.profileReady
        ? "Basics are on file — you can refine details anytime."
        : "Add your name and training details so recommendations stay realistic.",
      href: "/app/profile",
      cta: firstSession.profileReady ? "Review profile" : "Complete profile",
    },
    {
      id: "technique",
      done: firstSession.techniqueUploaded,
      title: "Upload first technique video",
      body: firstSession.techniqueUploaded
        ? "First upload is in — open Technique when you are ready for the next one."
        : "Upload a deadlift side-view clip to run movement analysis when pose data is suitable. Other lifts can store privately without an invented score.",
      href: "/app/technique",
      cta: firstSession.techniqueUploaded ? "Open technique" : "Upload video",
    },
    {
      id: "workout",
      done: firstSession.workoutLogged,
      title: "Log first workout",
      body: firstSession.workoutLogged
        ? "First session logged — consistency builds from here."
        : "Log what you actually trained. Empty charts stay empty until then.",
      href: "/app/today",
      cta: firstSession.workoutLogged ? "Open Today" : "Log a workout",
    },
    {
      id: "goal",
      done: firstSession.goalChosen,
      title: firstSession.goalChosen ? "Confirm your goal" : "Choose first goal",
      body: firstSession.goalChosen
        ? data.goalTitle
          ? `Active focus: “${data.goalTitle}”. Refine it whenever priorities change.`
          : "A goal is on file. Refine it whenever priorities change."
        : "Pick one primary goal so Today and programming have a clear target.",
      href: "/app/profile",
      cta: firstSession.goalChosen ? "Refine goal" : "Choose goal",
    },
  ];

  const nextOpen = priorities.find((p) => !p.done) ?? priorities[0];

  return (
    <div className="grid gap-6">
      <Card className="border-[var(--color-accent)]/30 bg-[var(--color-accent-muted)]">
        <CardHeader>
          <CardTitle>Welcome, {data.greetingName}</CardTitle>
          <CardDescription>
            First session checklist — get one useful action done before the
            score wall appears. Nothing here is invented.
          </CardDescription>
        </CardHeader>
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-[var(--color-fg)]">
              {firstSession.completedCount} of {firstSession.totalCount} done
            </span>
            <span className="text-[var(--color-muted)]">{progressPct}%</span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-[var(--color-border)]"
            role="progressbar"
            aria-valuenow={firstSession.completedCount}
            aria-valuemin={0}
            aria-valuemax={firstSession.totalCount}
            aria-label="First session progress"
          >
            <div
              className="h-full rounded-full bg-[var(--color-accent)] transition-[width] duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={nextOpen.href}>{nextOpen.cta}</ButtonLink>
          <ButtonLink href="/app/today" variant="secondary">
            Open Today
          </ButtonLink>
        </div>
      </Card>

      <section aria-labelledby="first-session-priorities">
        <h2
          id="first-session-priorities"
          className="mb-3 font-[family-name:var(--font-display)] text-lg font-semibold"
        >
          Your next four moves
        </h2>
        <ol className="grid gap-3">
          {priorities.map((item, index) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="group flex gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-panel)] p-4 transition-[border-color,box-shadow,transform] hover:-translate-y-px hover:border-[var(--color-accent)]/40 hover:shadow-[var(--shadow-panel)]"
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    item.done
                      ? "bg-[var(--color-success-muted,var(--color-accent-muted))] text-[var(--color-success,var(--color-accent))]"
                      : "bg-[var(--color-accent-muted)] text-[var(--color-accent)]"
                  }`}
                  aria-hidden
                >
                  {item.done ? "✓" : index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-[var(--color-fg)]">
                      {item.title}
                    </p>
                    {item.done ? (
                      <Badge variant="success">Done</Badge>
                    ) : index === priorities.findIndex((p) => !p.done) ? (
                      <Badge variant="accent">Next</Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                    {item.body}
                  </p>
                  <p className="mt-2 text-xs font-medium tracking-wide text-[var(--color-accent)]">
                    {item.cta} →
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {data.opportunity ? (
        <SectionCard
          title="Your first useful insight"
          description={data.opportunity.body}
          href={data.opportunity.href}
        >
          <p className="font-[family-name:var(--font-display)] text-xl font-semibold">
            {data.opportunity.title}
          </p>
          <Badge variant="accent" className="mt-2">
            {data.opportunity.category}
          </Badge>
        </SectionCard>
      ) : data.topInsight ? (
        <SectionCard
          title="Your first useful insight"
          description={data.topInsight.summary}
          href="/app/insights"
        >
          <p className="font-[family-name:var(--font-display)] text-xl font-semibold">
            {data.topInsight.title}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="accent">{data.topInsight.confidence} confidence</Badge>
          </div>
        </SectionCard>
      ) : (
        <SectionCard
          title="Your first useful insight"
          description="Complete one checklist item above — the first recommendation appears from what you actually enter."
          href={nextOpen.href}
          empty
        />
      )}

      {data.isMultiSport && data.prsBySport.some((g) => g.prs.length > 0) ? (
        <SectionCard
          title="Reported lifts by sport"
          description="Self-reported values — kept in separate sport namespaces."
          href="/app/multi-sport"
        >
          <div className="grid gap-3">
            {data.prsBySport.map((group) =>
              group.prs.length === 0 ? null : (
                <div key={group.sportId}>
                  <p className="mb-1 text-xs font-medium text-[var(--color-muted)]">
                    {group.sportLabel}
                  </p>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {group.prs.map((pr) => (
                      <li
                        key={pr.liftId}
                        className="flex items-baseline justify-between gap-2 text-sm"
                      >
                        <span className="text-[var(--color-muted)]">
                          {pr.label}
                        </span>
                        <span className="font-medium">{pr.display}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ),
            )}
          </div>
        </SectionCard>
      ) : data.personalRecords.length > 0 ? (
        <SectionCard
          title="Reported lifts on file"
          description="Self-reported values from your profile — not yet a verified strength score."
          href="/app/profile"
        >
          <ul className="grid gap-2 sm:grid-cols-2">
            {data.personalRecords.map((pr) => (
              <li
                key={pr.liftId}
                className="flex items-baseline justify-between gap-2 text-sm"
              >
                <span className="text-[var(--color-muted)]">{pr.label}</span>
                <span className="font-medium">{pr.display}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      ) : null}
    </div>
  );
}

function ActiveDashboard({ data }: { data: DashboardView }) {
  const pillars = [
    data.scores.strength,
    data.scores.technique,
    data.scores.programming,
    data.scores.recovery,
    data.scores.consistency,
    ...(data.scores.mobilityReadiness
      ? [data.scores.mobilityReadiness]
      : []),
  ];

  return (
    <div className="grid gap-6">
      {data.isMultiSport ? (
        <SectionCard
          title="Multi-sport focuses"
          description="One profile — focuses stay distinct. PRs are separated by sport below."
          href="/app/multi-sport"
        >
          <div className="flex flex-wrap gap-2">
            {data.sportFocuses.map((focus) => (
              <Link key={focus.id} href={focus.href}>
                <Badge variant="accent">{focus.label}</Badge>
              </Link>
            ))}
          </div>
          {data.goals.length > 1 ? (
            <ul className="mt-3 grid gap-1 text-sm text-[var(--color-muted)]">
              {data.goals.map((goal, index) => (
                <li key={`${goal.title}-${index}`}>
                  {goal.title}
                  <span className="ml-2 text-xs">({goal.category})</span>
                </li>
              ))}
            </ul>
          ) : null}
        </SectionCard>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <ScorePillar score={data.scores.athlete} />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {pillars.map((score) => (
            <ScorePillar key={score.key} score={score} />
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <MicroLearningCard
          goalCategories={data.goals.map((g) => g.category)}
          primaryDiscipline={data.discipline}
        />
        {data.topInsight ? (
          <SectionCard
            title="Cross-domain insight"
            description={data.topInsight.summary}
            href="/app/insights"
          >
            <p className="font-[family-name:var(--font-display)] text-xl font-semibold">
              {data.topInsight.title}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="accent">
                {data.topInsight.confidence} confidence
              </Badge>
            </div>
            <p className="mt-3 text-sm text-[var(--color-muted)]">
              Action: {data.topInsight.actionLabel}
            </p>
          </SectionCard>
        ) : data.opportunity ? (
          <SectionCard
            title="Biggest current opportunity"
            description="Highest-priority pending recommendation — grounded in your profile and logs."
            href={data.opportunity.href}
          >
            <p className="font-[family-name:var(--font-display)] text-xl font-semibold">
              {data.opportunity.title}
            </p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              {data.opportunity.body}
            </p>
          </SectionCard>
        ) : (
          <SectionCard
            title="Biggest current opportunity"
            description="No pending recommendation yet."
            href="/app/insights"
            empty
          />
        )}

        <SectionCard
          title="Upcoming workout"
          description="Next planned or in-progress session."
          href={data.upcomingWorkout?.href ?? "/app/today"}
          empty={!data.upcomingWorkout}
        >
          {data.upcomingWorkout ? (
            <>
              <p className="font-[family-name:var(--font-display)] text-xl font-semibold">
                {data.upcomingWorkout.title}
              </p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {formatWhen(data.upcomingWorkout.when)} ·{" "}
                {data.upcomingWorkout.status}
              </p>
            </>
          ) : null}
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Recent progress"
          description="Latest logged progress metrics."
          href="/app/progress"
          empty={data.recentProgress.length === 0}
        >
          <ul className="grid gap-2">
            {data.recentProgress.map((item) => (
              <li
                key={item.id}
                className="flex items-baseline justify-between gap-3 text-sm"
              >
                <span className="text-[var(--color-muted)]">{item.label}</span>
                <span className="font-medium">
                  {item.valueLabel}
                  <span className="ml-2 text-xs text-[var(--color-subtle)]">
                    {formatWhen(item.recordedAt)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          title="Training load"
          description="Completed sessions from your log — not estimated volume."
          href={data.trainingLoad.href}
          empty={!data.trainingLoad.hasEnoughData}
        >
          <dl className="grid grid-cols-3 gap-3 text-center">
            <div>
              <dt className="text-xs uppercase tracking-wide text-[var(--color-subtle)]">
                7 days
              </dt>
              <dd className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold">
                {data.trainingLoad.completedLast7Days}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-[var(--color-subtle)]">
                28 days
              </dt>
              <dd className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold">
                {data.trainingLoad.completedLast28Days}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-[var(--color-subtle)]">
                Upcoming
              </dt>
              <dd className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold">
                {data.trainingLoad.plannedUpcoming}
              </dd>
            </div>
          </dl>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Recent sessions"
          description="Completed training from your session log."
          href="/app/training"
          empty={data.recentSessions.length === 0}
        >
          <ul className="grid gap-2">
            {data.recentSessions.map((session) => (
              <li
                key={session.id}
                className="flex items-baseline justify-between gap-3 text-sm"
              >
                <span>{session.title}</span>
                <span className="text-[var(--color-muted)]">
                  {formatWhen(session.when)}
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          title={data.isMultiSport ? "Personal records by sport" : "Personal records"}
          description={
            data.isMultiSport
              ? "Separated by sport namespace — never mixed into one cross-sport total."
              : "Best logged lift values (historical — not overwritten)."
          }
          href={data.isMultiSport ? "/app/multi-sport" : "/app/profile"}
          empty={
            data.isMultiSport
              ? data.prsBySport.every((g) => g.prs.length === 0)
              : data.personalRecords.length === 0
          }
        >
          {data.isMultiSport ? (
            <div className="grid gap-4">
              {data.prsBySport.map((group) => (
                <div key={group.sportId}>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{group.sportLabel}</span>
                    <Link
                      href={group.href}
                      className="text-xs text-[var(--color-accent)] underline-offset-2 hover:underline"
                    >
                      Open
                    </Link>
                  </div>
                  {group.prs.length === 0 ? (
                    <p className="text-sm text-[var(--color-muted)]">
                      {group.emptyNote}
                    </p>
                  ) : (
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {group.prs.map((pr) => (
                        <li
                          key={pr.liftId}
                          className="flex items-baseline justify-between gap-2 text-sm"
                        >
                          <span className="text-[var(--color-muted)]">
                            {pr.label}
                          </span>
                          <span className="font-medium">{pr.display}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {data.personalRecords.map((pr) => (
                <li
                  key={pr.liftId}
                  className="flex items-baseline justify-between gap-2 text-sm"
                >
                  <span className="text-[var(--color-muted)]">{pr.label}</span>
                  <span className="font-medium">{pr.display}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Technique trend"
          description="Completed analyses with overall scores only."
          href="/app/technique"
          empty={data.techniqueTrend.length === 0}
        >
          <ul className="grid gap-2">
            {data.techniqueTrend.map((point) => (
              <li
                key={point.id}
                className="flex items-baseline justify-between gap-3 text-sm"
              >
                <span className="text-[var(--color-muted)]">{point.label}</span>
                <span className="font-medium">
                  {Math.round(point.value)}
                  <span className="ml-2 text-xs text-[var(--color-subtle)]">
                    {formatWhen(point.recordedAt)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          title="Recovery trend"
          description="Readiness logs over time."
          href="/app/recovery"
          empty={data.recoveryTrend.length === 0}
        >
          <ul className="grid gap-2">
            {data.recoveryTrend.map((point) => (
              <li
                key={point.id}
                className="flex items-baseline justify-between gap-3 text-sm"
              >
                <span className="text-[var(--color-muted)]">
                  {formatWhen(point.recordedAt)}
                </span>
                <span className="font-medium">{Math.round(point.value)}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}

export function PerformanceDashboard({
  data,
  athleteState,
}: {
  data: DashboardView;
  /** From PerformanceIntelligenceService only — never computed in this component. */
  athleteState?: AthleteStateView | null;
}) {
  if (data.isNewAthlete) {
    return (
      <div className="grid gap-6">
        <NewAthleteDashboard data={data} />
        {athleteState ? <AthleteStatePanel view={athleteState} /> : null}
      </div>
    );
  }
  return (
    <div className="grid gap-4">
      {data.isDemoPresentation ? (
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="warning">Demo athlete</Badge>
          <p className="text-sm text-[var(--color-muted)]">
            Explore example dashboard. Not a production athlete account.
          </p>
        </div>
      ) : null}
      <ActiveDashboard data={data} />
      {athleteState ? <AthleteStatePanel view={athleteState} /> : null}
    </div>
  );
}
