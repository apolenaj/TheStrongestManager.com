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
import type { ExpertReviewQueueItem } from "@/services/expert-contributor";
import {
  reviewExpertAction,
  type ExpertActionState,
} from "@/services/expert-contributor/actions";

const initial: ExpertActionState = { ok: false };

function ReviewRow({ item }: { item: ExpertReviewQueueItem }) {
  const [state, action, pending] = useActionState(reviewExpertAction, initial);

  return (
    <Card elevated>
      <CardHeader>
        <Badge variant="warning">{item.verificationStatus}</Badge>
        <CardTitle className="mt-2 text-lg">{item.displayName}</CardTitle>
        <CardDescription>
          {item.userEmail ?? "—"} ·{" "}
          {item.specializations.join(", ") || "No specializations"}
        </CardDescription>
      </CardHeader>
      <div className="mb-4 grid gap-1 text-sm text-[var(--color-muted)]">
        {item.bio ? <p>Bio: {item.bio}</p> : null}
        {item.credentialsSummary ? (
          <p>Credentials: {item.credentialsSummary}</p>
        ) : null}
        {item.experienceSummary ? (
          <p>Experience: {item.experienceSummary}</p>
        ) : null}
      </div>
      <form action={action} className="grid gap-3">
        <input type="hidden" name="profileId" value={item.id} />
        <label className="grid gap-1 text-sm">
          <span className="text-[var(--color-muted)]">Note</span>
          <input
            name="note"
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <Button
            type="submit"
            name="decision"
            value="verify"
            disabled={pending}
          >
            Verify Expert Contributor
          </Button>
          <Button
            type="submit"
            name="decision"
            value="reject"
            variant="secondary"
            disabled={pending}
          >
            Reject
          </Button>
          <Button
            type="submit"
            name="decision"
            value="revoke"
            variant="ghost"
            disabled={pending}
          >
            Revoke
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

export function ExpertReviewQueue({ items }: { items: ExpertReviewQueueItem[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="No pending expert applications"
        description="Applications awaiting explicit verification appear here."
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
