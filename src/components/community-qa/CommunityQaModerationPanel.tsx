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
import type { QaModerationQueueItem } from "@/services/community-qa";
import {
  moderateQaAction,
  type QaActionState,
} from "@/services/community-qa/actions";

const initial: QaActionState = { ok: false };

function ModRow({ item }: { item: QaModerationQueueItem }) {
  const [state, action, pending] = useActionState(moderateQaAction, initial);

  return (
    <Card elevated>
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          <Badge variant="neutral">{item.kind}</Badge>
          <Badge variant="warning">{item.status}</Badge>
          {item.category ? <Badge variant="info">{item.category}</Badge> : null}
          {item.flagCount > 0 ? (
            <Badge variant="danger">{item.flagCount} flag(s)</Badge>
          ) : null}
        </div>
        <CardTitle className="mt-2 text-base">{item.titleOrExcerpt}</CardTitle>
        <CardDescription>
          {item.authorLabel} · {new Date(item.createdAt).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <form action={action} className="grid gap-3">
        <input type="hidden" name="kind" value={item.kind} />
        <input type="hidden" name="id" value={item.id} />
        <label className="grid gap-1 text-sm">
          <span className="text-[var(--color-muted)]">Note</span>
          <input
            name="reason"
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" name="action" value="hide" disabled={pending}>
            Hide
          </Button>
          <Button type="submit" name="action" value="remove" disabled={pending}>
            Remove
          </Button>
          <Button
            type="submit"
            name="action"
            value="restore"
            variant="secondary"
            disabled={pending}
          >
            Restore
          </Button>
          <Button
            type="submit"
            name="action"
            value="note"
            variant="ghost"
            disabled={pending}
          >
            Note only
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

export function CommunityQaModerationPanel({
  items,
}: {
  items: QaModerationQueueItem[];
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="Moderation queue empty"
        description="Flagged, hidden, and removed Q&A items will appear here."
      />
    );
  }

  return (
    <ul className="grid gap-4">
      {items.map((item) => (
        <li key={`${item.kind}-${item.id}-${item.createdAt}`}>
          <ModRow item={item} />
        </li>
      ))}
    </ul>
  );
}
