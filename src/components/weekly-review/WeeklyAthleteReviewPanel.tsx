import Link from "next/link";
import {
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import type { WeeklyAthleteReviewPayload } from "@/domain/weekly-review";
import type { WeeklyReviewHistoryItem } from "@/services/weekly-review";

function SectionRow({
  label,
  thisWeek,
  previousWeek,
  delta,
  summary,
  missing,
}: {
  label: string;
  thisWeek: string | null;
  previousWeek: string | null;
  delta: string | null;
  summary: string;
  missing: string | null;
}) {
  return (
    <div className="grid gap-1 border-b border-[var(--color-border)] py-3 last:border-b-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-[var(--color-fg)]">{label}</p>
        {delta ? (
          <Badge variant="info">{delta}</Badge>
        ) : null}
      </div>
      <p className="text-sm text-[var(--color-muted)]">{summary}</p>
      <div className="mt-1 grid gap-1 text-xs text-[var(--color-muted)] sm:grid-cols-2">
        <p>
          <span className="font-medium text-[var(--color-fg)]">This week:</span>{" "}
          {thisWeek ?? "—"}
        </p>
        <p>
          <span className="font-medium text-[var(--color-fg)]">
            Previous week:
          </span>{" "}
          {previousWeek ?? "—"}
        </p>
      </div>
      {missing ? (
        <p className="text-xs text-[var(--color-muted)]">Missing: {missing}</p>
      ) : null}
    </div>
  );
}

export function WeeklyAthleteReviewPanel({
  review,
  previousReview,
  history,
}: {
  review: WeeklyAthleteReviewPayload;
  previousReview: WeeklyAthleteReviewPayload | null;
  history: WeeklyReviewHistoryItem[];
}) {
  return (
    <div className="grid gap-6">
      <Card elevated>
        <CardHeader>
          <div className="flex flex-wrap gap-2">
            <Badge variant="accent">{review.week.weekKey}</Badge>
            {review.week.inProgress ? (
              <Badge variant="warning">Week in progress</Badge>
            ) : (
              <Badge variant="neutral">Completed week</Badge>
            )}
            <Badge variant="neutral">{review.engineVersion}</Badge>
          </div>
          <CardTitle className="mt-2 text-2xl tracking-tight">
            Weekly review
          </CardTitle>
          <CardDescription>
            {review.week.rangeLabel} · compared to {review.previousWeekKey}.
            Summaries only — not a raw data dump.
          </CardDescription>
        </CardHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
              Main improvement
            </p>
            <p className="mt-2 text-base font-medium text-[var(--color-fg)]">
              {review.mainImprovement?.title ?? "None identified from logs"}
            </p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              {review.mainImprovement?.detail ??
                "Not enough positive signal this week to call out a clear win."}
            </p>
          </div>
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
              Biggest current limitation
            </p>
            <p className="mt-2 text-base font-medium text-[var(--color-fg)]">
              {review.biggestLimitation?.title ?? "None identified from logs"}
            </p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              {review.biggestLimitation?.detail ??
                "No standout limiter from available signals."}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Week summary</CardTitle>
          <CardDescription>
            This week vs previous week — high-value lines only.
          </CardDescription>
        </CardHeader>
        <div>
          {review.sections.map((s) => (
            <SectionRow
              key={s.id}
              label={s.label}
              thisWeek={s.thisWeekDisplay}
              previousWeek={s.previousWeekDisplay}
              delta={s.deltaDisplay}
              summary={s.summary}
              missing={s.missingNote}
            />
          ))}
        </div>
      </Card>

      <Card elevated>
        <CardHeader>
          <CardTitle>Next week</CardTitle>
          <CardDescription>Keep · Change · Watch</CardDescription>
        </CardHeader>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
              Keep
            </p>
            <ul className="mt-2 grid gap-2 text-sm text-[var(--color-fg)]">
              {review.nextWeek.keep.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
              Change
            </p>
            <ul className="mt-2 grid gap-2 text-sm text-[var(--color-fg)]">
              {review.nextWeek.change.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
              Watch
            </p>
            <ul className="mt-2 grid gap-2 text-sm text-[var(--color-fg)]">
              {review.nextWeek.watch.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {previousReview ? (
        <Card>
          <CardHeader>
            <CardTitle>Previous week snapshot</CardTitle>
            <CardDescription>
              {previousReview.week.weekKey} · {previousReview.week.rangeLabel}
            </CardDescription>
          </CardHeader>
          <p className="text-sm text-[var(--color-muted)]">
            Improvement:{" "}
            {previousReview.mainImprovement?.title ?? "None identified"} ·
            Limitation:{" "}
            {previousReview.biggestLimitation?.title ?? "None identified"}
          </p>
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            Next week plan then: Keep — {previousReview.nextWeek.keep[0] ?? "—"}
          </p>
        </Card>
      ) : null}

      {history.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>History</CardTitle>
            <CardDescription>
              Stored weekly reviews — open any week to compare.
            </CardDescription>
          </CardHeader>
          <ul className="grid gap-2">
            {history.map((h) => (
              <li key={h.id}>
                <Link
                  href={`/app/weekly-review?week=${encodeURIComponent(h.weekKey)}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 text-sm transition-colors hover:border-[var(--color-accent)]/40"
                >
                  <span className="font-medium text-[var(--color-fg)]">
                    {h.weekKey}
                  </span>
                  <span className="text-[var(--color-muted)]">
                    {h.summary ?? "Stored review"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <p className="text-xs text-[var(--color-muted)]">
        {review.honesty[0]}
      </p>
    </div>
  );
}
