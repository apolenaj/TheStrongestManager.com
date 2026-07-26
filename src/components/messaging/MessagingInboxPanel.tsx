"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Alert,
  Badge,
  Button,
  ButtonLink,
  Label,
  Textarea,
} from "@/design-system";
import {
  MESSAGE_RELATED_TYPE_LABELS,
  MESSAGE_RELATED_TYPES,
} from "@/domain/messaging";
import type {
  MessageThreadDetailView,
  MessagingInboxView,
} from "@/services/messaging";
import {
  flagMessageAction,
  openThreadAction,
  sendMessageAction,
} from "@/services/messaging/actions";
import { formatDateTimeInTimeZone } from "@/domain/timezone-system";

export function MessagingInboxPanel({
  inbox,
  thread,
  messageable,
  timeZone = "UTC",
}: {
  inbox: MessagingInboxView;
  thread: MessageThreadDetailView | null;
  messageable: {
    coaches: Array<{
      coachUserId: string;
      name: string;
      athleteProfileId: string;
    }>;
    athletes: Array<{
      athleteProfileId: string;
      displayName: string;
      coachUserId: string;
    }>;
  };
  /** Athlete IANA timezone — message timestamps display local, stored UTC. */
  timeZone?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(240px,320px)_1fr]">
      <aside className="grid gap-4 content-start">
        <Alert tone="info" title="Secure messaging">
          {inbox.honesty[0]} {inbox.honesty[1]}
        </Alert>

        {(messageable.coaches.length > 0 || messageable.athletes.length > 0) && (
          <section className="grid gap-2">
            <h2 className="text-sm font-semibold">Start a thread</h2>
            {messageable.coaches.map((c) => (
              <form
                key={c.coachUserId}
                action={async (fd) => {
                  const result = await openThreadAction(fd);
                  if (result && result.ok) {
                    router.push(`/app/messages?thread=${result.threadId}`);
                    router.refresh();
                  }
                }}
              >
                <input type="hidden" name="coachUserId" value={c.coachUserId} />
                <input
                  type="hidden"
                  name="athleteProfileId"
                  value={c.athleteProfileId}
                />
                <Button type="submit" variant="secondary" size="sm">
                  Message {c.name}
                </Button>
              </form>
            ))}
            {messageable.athletes.map((a) => (
              <form
                key={a.athleteProfileId}
                action={async (fd) => {
                  const result = await openThreadAction(fd);
                  if (result && result.ok) {
                    router.push(`/app/messages?thread=${result.threadId}`);
                    router.refresh();
                  }
                }}
              >
                <input type="hidden" name="coachUserId" value={a.coachUserId} />
                <input
                  type="hidden"
                  name="athleteProfileId"
                  value={a.athleteProfileId}
                />
                <Button type="submit" variant="secondary" size="sm">
                  Message {a.displayName}
                </Button>
              </form>
            ))}
          </section>
        )}

        <section className="grid gap-2">
          <h2 className="text-sm font-semibold">Threads</h2>
          {inbox.threads.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">
              No conversations yet. Start one with a linked coach or athlete.
            </p>
          ) : (
            <ul className="grid gap-2">
              {inbox.threads.map((t) => (
                <li key={t.id}>
                  <ButtonLink
                    href={`/app/messages?thread=${t.id}`}
                    variant={
                      thread?.thread.id === t.id ? "primary" : "secondary"
                    }
                    size="sm"
                    className="w-full justify-start"
                  >
                    <span className="flex flex-col items-start gap-0.5 text-left">
                      <span className="flex items-center gap-2">
                        {t.counterpartLabel}
                        {t.unread ? (
                          <Badge variant="accent">Unread</Badge>
                        ) : null}
                      </span>
                      <span className="line-clamp-1 text-xs opacity-80">
                        {t.lastMessagePreview ?? "No messages yet"}
                      </span>
                    </span>
                  </ButtonLink>
                </li>
              ))}
            </ul>
          )}
        </section>
      </aside>

      <section className="grid gap-4 content-start min-w-0">
        {error ? (
          <Alert tone="danger" title="Could not send">
            {error}
          </Alert>
        ) : null}

        {!thread ? (
          <EmptyThreadHint />
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
                {thread.thread.counterpartLabel}
              </h2>
              <Badge variant="neutral">{thread.thread.status}</Badge>
              <Badge variant="info">You: {thread.viewerRole}</Badge>
            </div>

            <ul className="grid gap-3 max-h-[50vh] overflow-y-auto rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
              {thread.messages.length === 0 ? (
                <li className="text-sm text-[var(--color-muted)]">
                  No messages yet — say hello.
                </li>
              ) : (
                thread.messages.map((m) => (
                  <li key={m.id} className="grid gap-1 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          m.senderRole === "coach" ? "accent" : "neutral"
                        }
                      >
                        {m.senderRole === "coach" ? "Coach" : "Athlete"}
                      </Badge>
                      <span className="text-[var(--color-muted)]">
                        {formatDateTimeInTimeZone(m.createdAt, timeZone)}
                      </span>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const fd = new FormData(e.currentTarget);
                          startTransition(async () => {
                            await flagMessageAction(fd);
                            setError(null);
                          });
                        }}
                      >
                        <input type="hidden" name="messageId" value={m.id} />
                        <Button type="submit" variant="ghost" size="sm">
                          Report
                        </Button>
                      </form>
                    </div>
                    {m.body ? (
                      <p className="text-[var(--color-foreground)] whitespace-pre-wrap">
                        {m.body}
                      </p>
                    ) : null}
                    {m.relatedLabel && m.relatedHref ? (
                      <ButtonLink
                        href={m.relatedHref}
                        variant="secondary"
                        size="sm"
                      >
                        Ref: {m.relatedLabel}
                      </ButtonLink>
                    ) : m.relatedLabel ? (
                      <Badge variant="info">Ref: {m.relatedLabel}</Badge>
                    ) : null}
                    {m.attachments.length > 0 ? (
                      <ul className="text-xs text-[var(--color-muted)]">
                        {m.attachments.map((a) => (
                          <li key={a.id}>
                            Attachment: {a.originalFileName ?? a.mediaType} (
                            {a.mimeType ?? "file"})
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))
              )}
            </ul>

            {thread.canSend ? (
              <form
                className="grid gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  startTransition(async () => {
                    const result = await sendMessageAction(fd);
                    if (!result.ok) setError(result.error);
                    else {
                      setError(null);
                      e.currentTarget.reset();
                      router.refresh();
                    }
                  });
                }}
              >
                <input type="hidden" name="threadId" value={thread.thread.id} />
                <div>
                  <Label htmlFor="msg-body">Message</Label>
                  <Textarea
                    id="msg-body"
                    name="body"
                    rows={3}
                    className="mt-1"
                    placeholder="Write a message…"
                  />
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="relatedType">Reference (optional)</Label>
                    <select
                      id="relatedType"
                      name="relatedType"
                      className="mt-1 flex h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-transparent px-3 text-sm"
                      defaultValue=""
                    >
                      <option value="">None</option>
                      {MESSAGE_RELATED_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {MESSAGE_RELATED_TYPE_LABELS[t]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="relatedId">Reference id</Label>
                    <input
                      id="relatedId"
                      name="relatedId"
                      type="text"
                      placeholder="Session or technique analysis id"
                      className="mt-1 flex h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-transparent px-3 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="attachment">Attachment (optional)</Label>
                  <input
                    id="attachment"
                    name="attachment"
                    type="file"
                    className="mt-1 block w-full text-sm"
                  />
                </div>
                <Button type="submit" disabled={pending}>
                  Send
                </Button>
              </form>
            ) : (
              <Alert tone="warning" title="Thread locked">
                New messages are disabled until coach access is active again.
              </Alert>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function EmptyThreadHint() {
  return (
    <p className="text-sm text-[var(--color-muted)]">
      Select a thread or start a new conversation with someone who has an active
      access grant.
    </p>
  );
}
