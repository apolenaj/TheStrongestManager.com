"use client";

import { useActionState } from "react";
import {
  Badge,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
} from "@/design-system";
import type { AdminLiftReviewQueueItem } from "@/services/verified-lift";
import {
  adminReviewLiftAction,
  type VerifiedLiftActionState,
} from "@/services/verified-lift/actions";

const initial: VerifiedLiftActionState = { ok: false };

function ReviewRow({ item }: { item: AdminLiftReviewQueueItem }) {
  const [state, action, pending] = useActionState(
    adminReviewLiftAction,
    initial,
  );

  return (
    <Card elevated>
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          {item.badges.map((b) => (
            <Badge key={b.id} variant={b.variant}>
              {b.label}
            </Badge>
          ))}
        </div>
        <CardTitle className="mt-2 text-lg">
          {item.liftLabel} · {item.loadKg} kg × {item.reps}
        </CardTitle>
        <CardDescription>
          {item.athleteDisplayName ?? "Athlete"} · target:{" "}
          {item.reviewTarget ?? "—"} · {item.displayLabel}
        </CardDescription>
      </CardHeader>

      <div className="mb-4 grid gap-1 text-sm text-[var(--color-muted)]">
        <p>Video evidence: {item.hasVideoEvidence ? "yes" : "no"}</p>
        {item.metadata.meetName ? (
          <p>
            Meet: {item.metadata.meetName} / {item.metadata.meetDate ?? "—"} /{" "}
            {item.metadata.federation ?? "—"}
          </p>
        ) : (
          <p>No competition metadata</p>
        )}
        {item.athleteNote ? <p>Athlete note: {item.athleteNote}</p> : null}
      </div>

      <form action={action} className="grid gap-3">
        <input type="hidden" name="claimId" value={item.id} />
        <label className="grid gap-1 text-sm">
          <span className="text-[var(--color-muted)]">Review note</span>
          <input
            name="reviewNote"
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <Button
            type="submit"
            name="decision"
            value="approve"
            disabled={pending}
          >
            Approve
          </Button>
          <Button
            type="submit"
            name="decision"
            value="reject"
            disabled={pending}
          >
            Reject
          </Button>
        </div>
        {state.error ? (
          <p className="text-sm text-[var(--color-score-critical)]">
            {state.error}
          </p>
        ) : null}
        {state.message ? (
          <p className="text-sm text-[var(--color-score-excellent)]">
            {state.message}
          </p>
        ) : null}
      </form>
    </Card>
  );
}

export function AdminVerifiedLiftQueue({
  items,
}: {
  items: AdminLiftReviewQueueItem[];
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="Review queue empty"
        description="No lift claims are pending manual review."
      />
    );
  }

  return (
    <ul className="grid gap-4">
      {items.map((item) => (
        <li key={item.id}>
          <ReviewRow item={item} />
        </li>
      ))}
    </ul>
  );
}
