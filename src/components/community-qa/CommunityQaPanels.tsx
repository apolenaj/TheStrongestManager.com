"use client";

import Link from "next/link";
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
import {
  QA_CATEGORIES,
  QA_CATEGORY_LABELS,
  type QaCategory,
} from "@/domain/community-qa";
import type { QaIndexView, QaQuestionDetail } from "@/services/community-qa";
import {
  acceptAnswerAction,
  answerQuestionAction,
  askQuestionAction,
  flagQaAction,
  summarizeQaAction,
  voteQaAction,
  type QaActionState,
} from "@/services/community-qa/actions";
import { ReportContentControl } from "@/components/content-moderation/ReportContentControl";
import { featureFlags } from "@/config/feature-flags";

const initial: QaActionState = { ok: false };

export function CommunityQaIndex({ view }: { view: QaIndexView }) {
  const [state, action, pending] = useActionState(askQuestionAction, initial);

  return (
    <div className="grid gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Community knowledge</CardTitle>
          <CardDescription>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {view.honesty.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/app/community-qa"
          className={`rounded-md border px-3 py-1.5 text-sm ${
            !view.category
              ? "border-[var(--color-accent)] text-[var(--color-accent)]"
              : "border-[var(--color-border)] text-[var(--color-muted)]"
          }`}
        >
          All
        </Link>
        {QA_CATEGORIES.map((c) => (
          <Link
            key={c}
            href={`/app/community-qa?category=${c}`}
            className={`rounded-md border px-3 py-1.5 text-sm ${
              view.category === c
                ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                : "border-[var(--color-border)] text-[var(--color-muted)]"
            }`}
          >
            {QA_CATEGORY_LABELS[c]}
          </Link>
        ))}
      </div>

      <Card elevated>
        <CardHeader>
          <CardTitle>Ask a question</CardTitle>
          <CardDescription>
            Structured categories only — answers come from humans.
          </CardDescription>
        </CardHeader>
        <form action={action} className="grid gap-3">
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--color-muted)]">Category</span>
            <select
              name="category"
              required
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
              defaultValue={(view.category as QaCategory) ?? "technique"}
            >
              {QA_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {QA_CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--color-muted)]">Title</span>
            <input
              name="title"
              required
              minLength={8}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--color-muted)]">Details</span>
            <textarea
              name="body"
              required
              minLength={20}
              rows={4}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            />
          </label>
          <Button type="submit" disabled={pending}>
            {pending ? "Posting…" : "Post question"}
          </Button>
          {state.error ? (
            <p className="text-sm text-[var(--color-score-critical)]">
              {state.error}
            </p>
          ) : null}
          {state.message && state.id ? (
            <p className="text-sm text-[var(--color-score-excellent)]">
              {state.message}{" "}
              <Link
                href={`/app/community-qa/${state.id}`}
                className="underline"
              >
                View
              </Link>
            </p>
          ) : null}
        </form>
      </Card>

      {view.questions.length === 0 ? (
        <EmptyState
          title="No questions yet"
          description="Be the first to ask in this category."
        />
      ) : (
        <ul className="grid gap-3">
          {view.questions.map((q) => (
            <li key={q.id}>
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="info">{q.categoryLabel}</Badge>
                    <Badge variant="neutral">Score {q.score}</Badge>
                    {q.hasAccepted ? (
                      <Badge variant="success">Accepted answer</Badge>
                    ) : null}
                  </div>
                  <CardTitle className="mt-2 text-lg">
                    <Link
                      href={`/app/community-qa/${q.id}`}
                      className="hover:text-[var(--color-accent)]"
                    >
                      {q.title}
                    </Link>
                  </CardTitle>
                  <CardDescription>
                    {q.answerCount} answer(s) · {q.authorLabel}
                  </CardDescription>
                </CardHeader>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function VoteButtons({
  targetType,
  targetId,
  questionId,
  score,
  myVote,
}: {
  targetType: "question" | "answer";
  targetId: string;
  questionId: string;
  score: number;
  myVote: 1 | -1 | null;
}) {
  const [, action, pending] = useActionState(voteQaAction, initial);
  return (
    <div className="flex items-center gap-2 text-sm">
      <form action={action}>
        <input type="hidden" name="targetType" value={targetType} />
        <input type="hidden" name="targetId" value={targetId} />
        <input type="hidden" name="questionId" value={questionId} />
        <input type="hidden" name="value" value="1" />
        <Button
          type="submit"
          size="sm"
          variant={myVote === 1 ? "primary" : "secondary"}
          disabled={pending}
        >
          ▲
        </Button>
      </form>
      <span className="min-w-[2rem] text-center font-medium">{score}</span>
      <form action={action}>
        <input type="hidden" name="targetType" value={targetType} />
        <input type="hidden" name="targetId" value={targetId} />
        <input type="hidden" name="questionId" value={questionId} />
        <input type="hidden" name="value" value="-1" />
        <Button
          type="submit"
          size="sm"
          variant={myVote === -1 ? "primary" : "secondary"}
          disabled={pending}
        >
          ▼
        </Button>
      </form>
    </div>
  );
}

export function CommunityQaDetail({ detail }: { detail: QaQuestionDetail }) {
  const [answerState, answerAction, answerPending] = useActionState(
    answerQuestionAction,
    initial,
  );
  const [, acceptAction, acceptPending] = useActionState(
    acceptAnswerAction,
    initial,
  );
  const [, summarizeAction, summarizePending] = useActionState(
    summarizeQaAction,
    initial,
  );
  const [, flagAction] = useActionState(flagQaAction, initial);

  return (
    <div className="grid gap-8">
      <p className="text-sm">
        <Link href="/app/community-qa" className="text-[var(--color-accent)]">
          ← All questions
        </Link>
      </p>

      <Card elevated>
        <CardHeader>
          <div className="flex flex-wrap gap-2">
            <Badge variant="info">{detail.categoryLabel}</Badge>
            <Badge variant="neutral">{detail.status}</Badge>
          </div>
          <CardTitle className="mt-2 font-[family-name:var(--font-display)] text-2xl tracking-tight">
            {detail.title}
          </CardTitle>
          <CardDescription>
            {detail.authorLabel} ·{" "}
            {new Date(detail.createdAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <p className="whitespace-pre-wrap text-sm">{detail.body}</p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <VoteButtons
            targetType="question"
            targetId={detail.id}
            questionId={detail.id}
            score={detail.score}
            myVote={detail.myVote}
          />
          <form action={flagAction}>
            <input type="hidden" name="kind" value="question" />
            <input type="hidden" name="id" value={detail.id} />
            <Button type="submit" variant="ghost" size="sm">
              Flag
            </Button>
          </form>
          {featureFlags.contentModeration ? (
            <ReportContentControl
              relatedType="community_question"
              relatedId={detail.id}
            />
          ) : null}
          <form action={summarizeAction}>
            <input type="hidden" name="questionId" value={detail.id} />
            <Button type="submit" variant="secondary" size="sm" disabled={summarizePending}>
              Refresh AI summary
            </Button>
          </form>
        </div>
      </Card>

      {detail.aiSummary ? (
        <Card>
          <CardHeader>
            <Badge variant="warning">{detail.aiSummary.label}</Badge>
            <CardTitle className="mt-2 text-base">
              Machine-generated overview
            </CardTitle>
            <CardDescription>{detail.aiSummary.disclaimer}</CardDescription>
          </CardHeader>
          <pre className="whitespace-pre-wrap text-sm text-[var(--color-muted)]">
            {detail.aiSummary.body}
          </pre>
        </Card>
      ) : null}

      <section className="grid gap-4">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Answers ({detail.answers.length})
        </h2>
        {detail.answers.length === 0 ? (
          <EmptyState
            title="No answers yet"
            description="Share a human reply — AI will not answer as a person."
          />
        ) : (
          <ul className="grid gap-4">
            {detail.answers.map((a) => (
              <li key={a.id}>
                <Card elevated={a.isAccepted}>
                  <CardHeader>
                    <div className="flex flex-wrap gap-2">
                      {a.isAccepted ? (
                        <Badge variant="success">Accepted</Badge>
                      ) : null}
                      {a.expertBadge ? (
                        <Badge variant="accent">Expert</Badge>
                      ) : null}
                      <Badge variant="neutral">{a.authorship.replace("_", " ")}</Badge>
                    </div>
                    <CardDescription>
                      {a.authorLabel} ·{" "}
                      {new Date(a.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <p className="whitespace-pre-wrap text-sm">{a.body}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <VoteButtons
                      targetType="answer"
                      targetId={a.id}
                      questionId={detail.id}
                      score={a.score}
                      myVote={a.myVote}
                    />
                    {detail.isQuestionAuthor && !a.isAccepted ? (
                      <form action={acceptAction}>
                        <input type="hidden" name="questionId" value={detail.id} />
                        <input type="hidden" name="answerId" value={a.id} />
                        <Button
                          type="submit"
                          size="sm"
                          variant="secondary"
                          disabled={acceptPending}
                        >
                          Accept answer
                        </Button>
                      </form>
                    ) : null}
                    <form action={flagAction}>
                      <input type="hidden" name="kind" value="answer" />
                      <input type="hidden" name="id" value={a.id} />
                      <Button type="submit" variant="ghost" size="sm">
                        Flag
                      </Button>
                    </form>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      {detail.status === "open" ? (
        <Card>
          <CardHeader>
            <CardTitle>Your answer</CardTitle>
            <CardDescription>
                      Posted as a human. Expert badge only if you are a
                      verified Expert Contributor (never automatic).
            </CardDescription>
          </CardHeader>
          <form action={answerAction} className="grid gap-3">
            <input type="hidden" name="questionId" value={detail.id} />
            <textarea
              name="body"
              required
              minLength={8}
              rows={4}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
            />
            <Button type="submit" disabled={answerPending}>
              {answerPending ? "Posting…" : "Post answer"}
            </Button>
            {answerState.error ? (
              <p className="text-sm text-[var(--color-score-critical)]">
                {answerState.error}
              </p>
            ) : null}
          </form>
        </Card>
      ) : null}
    </div>
  );
}
