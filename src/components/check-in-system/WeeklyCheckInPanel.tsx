"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Alert, Badge, Button, Label } from "@/design-system";
import {
  CHECK_IN_CATEGORY_LABELS,
  type CheckInCategory,
} from "@/domain/check-in-system";
import type { AthleteCheckInView } from "@/services/check-in-system";
import {
  submitWeeklyCheckInAction,
  summarizeWeeklyCheckInAction,
} from "@/services/check-in-system/actions";

export function WeeklyCheckInPanel({ view }: { view: AthleteCheckInView }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const byCategory = new Map<CheckInCategory, typeof view.questions>();
  for (const q of view.questions) {
    const list = byCategory.get(q.category) ?? [];
    list.push(q);
    byCategory.set(q.category, list);
  }

  return (
    <div className="grid gap-8 max-w-2xl">
      <Alert tone="info" title="Training-safe check-in">
        {view.honesty[0]} {view.honesty[1]}
      </Alert>

      <div className="flex flex-wrap gap-2">
        <Badge variant="neutral">{view.weekKey}</Badge>
        <Badge variant={view.status === "submitted" ? "success" : "warning"}>
          {view.status === "submitted" ? "Submitted" : "Due this week"}
        </Badge>
      </div>

      {error ? (
        <Alert tone="danger" title="Could not save">
          {error}
        </Alert>
      ) : null}

      {view.summary ? (
        <section className="grid gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="info">{view.summary.sourceLabel}</Badge>
            <span className="text-sm text-[var(--color-muted)]">
              {new Date(view.summary.createdAt).toLocaleString()}
            </span>
          </div>
          <pre className="whitespace-pre-wrap font-sans text-sm">
            {view.summary.body}
          </pre>
        </section>
      ) : null}

      {view.status === "submitted" ? (
        <div className="grid gap-3">
          <Alert tone="success" title="Check-in submitted">
            Thanks — your answers for {view.weekKey} are saved. You can
            regenerate an AI summary below.
          </Alert>
          {view.checkInId ? (
            <form action={summarizeWeeklyCheckInAction}>
              <input type="hidden" name="checkInId" value={view.checkInId} />
              <Button type="submit" variant="secondary">
                Refresh AI summary
              </Button>
            </form>
          ) : null}
          <SubmittedAnswers view={view} />
        </div>
      ) : (
        <form
          className="grid gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            startTransition(async () => {
              const result = await submitWeeklyCheckInAction(fd);
              if (!result.ok) setError(result.error);
              else {
                setError(null);
                router.refresh();
              }
            });
          }}
        >
          {[...byCategory.entries()].map(([cat, questions]) => (
            <section key={cat} className="grid gap-3">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
                {CHECK_IN_CATEGORY_LABELS[cat]}
              </h2>
              {questions.map((q) => (
                <div key={q.key} className="grid gap-1">
                  <Label htmlFor={`q_${q.key}`}>{q.prompt}</Label>
                  {q.helper ? (
                    <p className="text-xs text-[var(--color-muted)]">
                      {q.helper}
                    </p>
                  ) : null}
                  {q.answerType === "scale_1_5" ? (
                    <select
                      id={`q_${q.key}`}
                      name={`q_${q.key}`}
                      className="mt-1 flex h-11 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-transparent px-3 text-sm"
                      defaultValue=""
                    >
                      <option value="">Skip</option>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  ) : q.answerType === "boolean" ? (
                    <select
                      id={`q_${q.key}`}
                      name={`q_${q.key}`}
                      className="mt-1 flex h-11 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-transparent px-3 text-sm"
                      defaultValue=""
                    >
                      <option value="">Skip</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  ) : q.answerType === "number" ? (
                    <input
                      id={`q_${q.key}`}
                      name={`q_${q.key}`}
                      type="number"
                      step="any"
                      className="mt-1 flex h-11 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-transparent px-3 text-sm"
                    />
                  ) : (
                    <input
                      id={`q_${q.key}`}
                      name={`q_${q.key}`}
                      type="text"
                      maxLength={500}
                      className="mt-1 flex h-11 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-transparent px-3 text-sm"
                    />
                  )}
                </div>
              ))}
            </section>
          ))}
          <Button type="submit" disabled={pending}>
            Submit weekly check-in
          </Button>
        </form>
      )}
    </div>
  );
}

function SubmittedAnswers({ view }: { view: AthleteCheckInView }) {
  return (
    <ul className="grid gap-2 text-sm">
      {view.questions.map((q) => {
        const raw = view.responses[q.key];
        if (raw === null || raw === undefined || raw === "") return null;
        const display =
          typeof raw === "boolean" ? (raw ? "Yes" : "No") : String(raw);
        return (
          <li key={q.key}>
            <span className="text-[var(--color-muted)]">{q.prompt}</span>
            <br />
            <span>{display}</span>
          </li>
        );
      })}
    </ul>
  );
}
