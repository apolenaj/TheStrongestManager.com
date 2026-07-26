"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import {
  COACH_CHAT_HONESTY,
  COACH_CHAT_SUGGESTED_QUESTIONS,
  type CoachChatAnswer,
  type CoachChatDataRef,
} from "@/domain/coach-brain";
import { askCoachChatAction } from "@/services/coach-brain/actions";
import { cn } from "@/design-system/utils/cn";
import { fromCoachChatAnswer } from "@/domain/explainable-ai";
import { WhyAmISeeingThis } from "@/components/explainable-ai/WhyAmISeeingThis";
import { AiTrustChrome } from "@/components/ai/AiTrustChrome";
import { ConfidenceBadge } from "@/components/confidence/ConfidenceBadge";

type ChatBubble = {
  id: string;
  role: "user" | "assistant";
  content: string;
  answer?: CoachChatAnswer;
};

function DataRefCard({ refItem }: { refItem: CoachChatDataRef }) {
  const inner = (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2 transition-[border-color] hover:border-[var(--color-accent)]/40">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="neutral">{refItem.kind.replaceAll("_", " ")}</Badge>
        <p className="text-sm font-medium text-[var(--color-fg)]">
          {refItem.label}
        </p>
      </div>
      <p className="mt-1 text-xs text-[var(--color-muted)]">{refItem.detail}</p>
      {refItem.href ? (
        <p className="mt-1 text-xs font-medium text-[var(--color-accent)]">
          Open →
        </p>
      ) : null}
    </div>
  );

  if (!refItem.href) return inner;
  return (
    <Link
      href={refItem.href}
      className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
    >
      {inner}
    </Link>
  );
}

export function CoachChat({
  initialSuggestions = COACH_CHAT_SUGGESTED_QUESTIONS,
}: {
  initialSuggestions?: readonly string[];
}) {
  const [messages, setMessages] = useState<ChatBubble[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function send(question: string) {
    const trimmed = question.trim();
    if (!trimmed || pending) return;
    setError(null);
    const userId = `u-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: userId, role: "user", content: trimmed },
    ]);
    setDraft("");

    startTransition(async () => {
      const result = await askCoachChatAction(trimmed);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          id: result.turn.runId,
          role: "assistant",
          content: result.turn.answer.content,
          answer: result.turn.answer,
        },
      ]);
    });
  }

  return (
    <div className="grid gap-4">
      <Card elevated>
        <CardHeader>
          <CardTitle>Coach chat</CardTitle>
          <CardDescription>
            Ask about your training. Answers cite your logs — missing data stays
            missing.
          </CardDescription>
        </CardHeader>
        <ul className="mb-4 grid gap-1 text-xs text-[var(--color-muted)]">
          {COACH_CHAT_HONESTY.map((line) => (
            <li key={line}>• {line}</li>
          ))}
        </ul>

        {messages.length === 0 ? (
          <div className="mb-4">
            <p className="mb-2 text-sm font-medium text-[var(--color-fg)]">
              Try a question
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {initialSuggestions.map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={pending}
                  onClick={() => send(q)}
                  className="min-h-11 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 text-left text-sm text-[var(--color-fg)] transition-colors hover:border-[var(--color-accent)]/50 disabled:opacity-60"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div
          className="mb-4 grid max-h-[28rem] gap-3 overflow-y-auto pr-1"
          aria-live="polite"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "rounded-[var(--radius-lg)] px-3 py-3 text-sm",
                m.role === "user"
                  ? "ml-6 bg-[var(--color-accent-muted)] text-[var(--color-fg)]"
                  : "mr-2 border border-[var(--color-border)] bg-[var(--color-surface)]",
              )}
            >
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                {m.role === "user" ? "You" : "AI Coach"}
              </p>
              <p className="leading-relaxed text-[var(--color-fg)]">{m.content}</p>
              {m.answer ? (
                <div className="mt-3 grid gap-2">
                  <div className="flex flex-wrap gap-2">
                    <ConfidenceBadge confidence={m.answer.confidence} />
                    <Badge variant="neutral">{m.answer.intent}</Badge>
                  </div>
                  <WhyAmISeeingThis
                    view={fromCoachChatAnswer({
                      confidence: m.answer.confidence,
                      dataRefs: m.answer.dataRefs,
                      missingInformation: m.answer.missingInformation,
                    })}
                  />
                  {m.answer.dataRefs.length > 0 ? (
                    <div>
                      <p className="mb-2 text-xs font-medium text-[var(--color-muted)]">
                        Data references
                      </p>
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {m.answer.dataRefs.map((refItem) => (
                          <li key={refItem.id}>
                            <DataRefCard refItem={refItem} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {m.answer.suggestedFollowUps.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {m.answer.suggestedFollowUps.map((q) => (
                        <button
                          key={q}
                          type="button"
                          disabled={pending}
                          onClick={() => send(q)}
                          className="rounded-sm text-xs font-medium text-[var(--color-accent)] underline-offset-2 hover:underline disabled:opacity-60"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  <AiTrustChrome
                    relatedType="coach_chat"
                    relatedId={m.id}
                    correctHref="/app/recovery"
                    correctLabel="Update recovery / training logs"
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>

        {error ? <Alert tone="danger" title={error} className="mb-3" /> : null}

        <form
          className="flex flex-col gap-2 sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            send(draft);
          }}
        >
          <label className="min-w-0 flex-1 text-sm">
            <span className="mb-1 block text-[var(--color-muted)]">
              Your question
            </span>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
              maxLength={500}
              disabled={pending}
              placeholder="e.g. Should I deload?"
              className="min-h-12 w-full resize-y rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-[var(--color-fg)] outline-none focus-visible:border-[var(--color-accent)]"
            />
          </label>
          <Button type="submit" disabled={pending || !draft.trim()} size="lg">
            {pending ? "Thinking…" : "Ask"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
