"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import type { MonthlyAthleteReportPayload } from "@/domain/monthly-report";
import {
  createMonthlyReportShareAction,
  type MonthlyReportActionState,
} from "@/services/monthly-report/actions";
import type { MonthlyReportHistoryItem } from "@/services/monthly-report";

const initial: MonthlyReportActionState = { ok: false };

function SectionRow({
  label,
  thisMonth,
  previousMonth,
  delta,
  summary,
  missing,
}: {
  label: string;
  thisMonth: string | null;
  previousMonth: string | null;
  delta: string | null;
  summary: string;
  missing: string | null;
}) {
  return (
    <div className="grid gap-1 border-b border-[var(--color-border)] py-3 last:border-b-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold">{label}</p>
        {delta ? <Badge variant="info">{delta}</Badge> : null}
      </div>
      <p className="text-sm text-[var(--color-muted)]">{summary}</p>
      <div className="mt-1 grid gap-1 text-xs text-[var(--color-muted)] sm:grid-cols-2">
        <p>
          <span className="font-medium text-[var(--color-foreground)]">
            This month:
          </span>{" "}
          {thisMonth ?? "—"}
        </p>
        <p>
          <span className="font-medium text-[var(--color-foreground)]">
            Previous:
          </span>{" "}
          {previousMonth ?? "—"}
        </p>
      </div>
      {missing ? (
        <p className="text-xs text-[var(--color-score-needs-attention)]">
          {missing}
        </p>
      ) : null}
    </div>
  );
}

export function MonthlyAthleteReportPanel({
  report,
  history,
  previousHeadline,
}: {
  report: MonthlyAthleteReportPayload;
  history: MonthlyReportHistoryItem[];
  previousHeadline: string | null;
}) {
  const [shareState, shareAction, sharePending] = useActionState(
    createMonthlyReportShareAction,
    initial,
  );

  return (
    <div className="grid gap-6">
      <Alert tone="info" title="Automatic monthly report">
        Generated from logged data for {report.month.rangeLabel}.{" "}
        {report.month.inProgress
          ? "Month in progress — figures update as you log."
          : null}
      </Alert>

      {report.headline ? (
        <p className="font-[family-name:var(--font-display)] text-xl font-semibold">
          {report.headline}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Badge variant="neutral">{report.month.label}</Badge>
        {report.month.inProgress ? (
          <Badge variant="warning">In progress</Badge>
        ) : (
          <Badge variant="success">Closed month</Badge>
        )}
        {previousHeadline ? (
          <Badge variant="info">vs {report.previousMonthKey}</Badge>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sections</CardTitle>
          <CardDescription>
            Month summary through next priorities — missing data stays explicit.
          </CardDescription>
        </CardHeader>
        <div className="px-6 pb-6">
          {report.sections.map((s) => (
            <SectionRow
              key={s.id}
              label={s.label}
              thisMonth={s.thisMonthDisplay}
              previousMonth={s.previousMonthDisplay}
              delta={s.deltaDisplay}
              summary={s.summary}
              missing={s.missingNote}
            />
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next priorities</CardTitle>
          <CardDescription>Keep · Change · Watch</CardDescription>
        </CardHeader>
        <div className="grid gap-3 px-6 pb-6 text-sm sm:grid-cols-3">
          <div>
            <p className="font-medium">Keep</p>
            <ul className="mt-1 list-inside list-disc text-[var(--color-muted)]">
              {report.nextPriorities.keep.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-medium">Change</p>
            <ul className="mt-1 list-inside list-disc text-[var(--color-muted)]">
              {report.nextPriorities.change.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-medium">Watch</p>
            <ul className="mt-1 list-inside list-disc text-[var(--color-muted)]">
              {report.nextPriorities.watch.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      <section className="grid gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-5">
        <h2 className="font-medium">Share</h2>
        <p className="text-sm text-[var(--color-muted)]">
          Creates a public-safe summary link — not private recovery notes or full
          session dumps.
        </p>
        <form action={shareAction} className="flex flex-wrap items-center gap-3">
          <input type="hidden" name="monthKey" value={report.month.monthKey} />
          <Button type="submit" disabled={sharePending}>
            {sharePending ? "Creating…" : "Create share link"}
          </Button>
          {shareState.error ? (
            <span className="text-sm text-[var(--color-score-critical)]">
              {shareState.error}
            </span>
          ) : null}
          {shareState.sharePath ? (
            <Link
              href={shareState.sharePath}
              className="text-sm text-[var(--color-accent)] underline-offset-2 hover:underline"
              target="_blank"
            >
              Open {shareState.sharePath}
            </Link>
          ) : null}
        </form>
      </section>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-lg">
          Historical archive
        </h2>
        {history.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">No archived months yet.</p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)] rounded-[var(--radius-md)] border border-[var(--color-border)]">
            {history.map((h) => (
              <li
                key={h.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
              >
                <span>
                  <span className="font-medium">{h.monthKey}</span>
                  {h.summary ? (
                    <span className="text-[var(--color-muted)]">
                      {" "}
                      — {h.summary}
                    </span>
                  ) : null}
                </span>
                <Link
                  href={`/app/monthly-report?month=${h.monthKey}`}
                  className="text-[var(--color-accent)] underline-offset-2 hover:underline"
                >
                  Open
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-xs text-[var(--color-muted)]">
        {report.honesty.join(" ")}
      </p>
    </div>
  );
}
