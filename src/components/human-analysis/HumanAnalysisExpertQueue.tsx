"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Alert, Badge, Button } from "@/design-system";
import {
  claimHumanAnalysisOrderAction,
  submitHumanAnalysisExpertReportAction,
  type HumanAnalysisActionState,
} from "@/services/human-analysis/actions";

const initial: HumanAnalysisActionState = { ok: false };

export function HumanAnalysisExpertQueue({
  items,
  honesty,
  capacityMessage,
  error,
}: {
  items: Array<{
    orderId: string;
    productName: string;
    status: string;
    athleteLabel: string;
    queuedAt: Date | null;
  }>;
  honesty: readonly string[];
  capacityMessage: string;
  error?: string;
}) {
  return (
    <div className="grid gap-6">
      <Alert tone="info" title="Paid expert queue">
        {honesty[0]} {capacityMessage}
      </Alert>
      {error ? (
        <Alert tone="warning" title="Queue unavailable">
          {error}
        </Alert>
      ) : null}
      {items.length === 0 && !error ? (
        <p className="text-sm text-[var(--color-muted)]">
          No paid orders in queue.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--color-border)] rounded-[var(--radius-md)] border border-[var(--color-border)]">
          {items.map((item) => (
            <li
              key={item.orderId}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div>
                <p className="font-medium">{item.productName}</p>
                <p className="text-xs text-[var(--color-muted)]">
                  {item.athleteLabel}
                  {item.queuedAt
                    ? ` · queued ${item.queuedAt.toISOString().slice(0, 10)}`
                    : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="warning">{item.status}</Badge>
                <Link
                  href={`/app/human-analysis/expert/${item.orderId}`}
                  className="text-sm text-[var(--color-accent)] underline-offset-2 hover:underline"
                >
                  Open
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function HumanAnalysisExpertOrderPanel({
  order,
}: {
  order: {
    id: string;
    productName: string;
    status: string;
    statusLabel: string;
    athleteNote: string | null;
    techniqueAnalysisId: string | null;
    programId: string | null;
    competitionPrepId: string | null;
    expertSummary: string | null;
  };
}) {
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap gap-2">
        <Badge variant="info">{order.statusLabel}</Badge>
        <Badge variant="neutral">{order.productName}</Badge>
      </div>
      {order.athleteNote ? (
        <p className="text-sm">
          <span className="text-[var(--color-muted)]">Athlete note: </span>
          {order.athleteNote}
        </p>
      ) : null}
      <dl className="grid gap-2 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-[var(--color-muted)]">Technique analysis</dt>
          <dd>{order.techniqueAnalysisId ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-muted)]">Program</dt>
          <dd>{order.programId ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-muted)]">Competition prep</dt>
          <dd>{order.competitionPrepId ?? "—"}</dd>
        </div>
      </dl>

      {order.status === "queued" ? <ClaimForm orderId={order.id} /> : null}
      {order.status === "in_review" ? <ReportForm orderId={order.id} /> : null}
      {order.status === "report_ready" && order.expertSummary ? (
        <Alert tone="success" title="Report delivered">
          {order.expertSummary}
        </Alert>
      ) : null}

      <Link
        href="/app/human-analysis/expert"
        className="text-sm text-[var(--color-accent)] underline-offset-2 hover:underline"
      >
        Back to paid queue
      </Link>
    </div>
  );
}

function ClaimForm({ orderId }: { orderId: string }) {
  const [state, action, pending] = useActionState(
    claimHumanAnalysisOrderAction,
    initial,
  );
  return (
    <form action={action} className="grid gap-2">
      <input type="hidden" name="orderId" value={orderId} />
      {state.error ? (
        <Alert tone="danger" title="Could not claim">
          {state.error}
        </Alert>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Claiming…" : "Claim for review"}
      </Button>
    </form>
  );
}

function ReportForm({ orderId }: { orderId: string }) {
  const [state, action, pending] = useActionState(
    submitHumanAnalysisExpertReportAction,
    initial,
  );
  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="orderId" value={orderId} />
      <label className="grid gap-1 text-sm">
        Expert report summary
        <textarea
          name="summary"
          rows={8}
          required
          minLength={20}
          className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
          placeholder="Written expert findings — not AI output."
        />
      </label>
      {state.error ? (
        <Alert tone="danger" title="Could not submit">
          {state.error}
        </Alert>
      ) : null}
      {state.ok ? (
        <Alert tone="success" title="Report ready">
          Athlete can view the expert report on their order page.
        </Alert>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Submitting…" : "Submit expert report"}
      </Button>
    </form>
  );
}
