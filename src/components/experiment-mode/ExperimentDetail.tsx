"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Alert, Badge, Button } from "@/design-system";
import {
  abandonExperimentAction,
  completeExperimentAction,
  startExperimentAction,
  type ExperimentActionState,
} from "@/services/experiment-mode/actions";
import {
  EXPERIMENT_MEASURE_LABELS,
  EXPERIMENT_MODE_HONESTY,
  EXPERIMENT_STATUS_LABELS,
  type PersonalTrainingExperimentView,
} from "@/domain/experiment-mode";

const initial: ExperimentActionState = { ok: false };

export function ExperimentDetail({
  experiment,
}: {
  experiment: PersonalTrainingExperimentView;
}) {
  const [startState, startAction, startPending] = useActionState(
    startExperimentAction,
    initial,
  );
  const [completeState, completeAction, completePending] = useActionState(
    completeExperimentAction,
    initial,
  );
  const [abandonState, abandonAction, abandonPending] = useActionState(
    abandonExperimentAction,
    initial,
  );

  const actionState = startState.message
    ? startState
    : completeState.message
      ? completeState
      : abandonState.message
        ? abandonState
        : startState.error
          ? startState
          : completeState.error
            ? completeState
            : abandonState;

  return (
    <div className="grid gap-8">
      <Alert tone="warning" title="Personal training experiment">
        {EXPERIMENT_MODE_HONESTY[0]} {EXPERIMENT_MODE_HONESTY[3]}
      </Alert>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="accent">{EXPERIMENT_STATUS_LABELS[experiment.status]}</Badge>
        <Badge variant="neutral">{experiment.durationWeeks} weeks</Badge>
      </div>

      <dl className="grid gap-4 text-sm">
        <div>
          <dt className="font-medium text-[var(--color-foreground)]">Test</dt>
          <dd className="text-[var(--color-muted)]">{experiment.intervention}</dd>
        </div>
        <div>
          <dt className="font-medium text-[var(--color-foreground)]">
            Personal prediction
          </dt>
          <dd className="text-[var(--color-muted)]">{experiment.hypothesis}</dd>
        </div>
        <div>
          <dt className="font-medium text-[var(--color-foreground)]">Measure</dt>
          <dd className="text-[var(--color-muted)]">
            {experiment.measures.map((m) => EXPERIMENT_MEASURE_LABELS[m]).join(", ")}
          </dd>
        </div>
      </dl>

      {actionState.error ? (
        <Alert tone="danger" title="Action failed">
          {actionState.error}
        </Alert>
      ) : null}
      {actionState.message ? (
        <Alert tone="success" title="Updated">
          {actionState.message}
        </Alert>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {experiment.status === "planned" ? (
          <form action={startAction}>
            <input type="hidden" name="experimentId" value={experiment.id} />
            <Button type="submit" loading={startPending}>
              Start & capture before
            </Button>
          </form>
        ) : null}
        {experiment.status === "active" ? (
          <form action={completeAction}>
            <input type="hidden" name="experimentId" value={experiment.id} />
            <Button type="submit" loading={completePending}>
              Complete & compare after
            </Button>
          </form>
        ) : null}
        {experiment.status === "planned" || experiment.status === "active" ? (
          <form action={abandonAction}>
            <input type="hidden" name="experimentId" value={experiment.id} />
            <Button type="submit" variant="ghost" loading={abandonPending}>
              Abandon
            </Button>
          </form>
        ) : null}
        <Link
          href="/app/experiments"
          className="inline-flex items-center text-sm text-[var(--color-accent)]"
        >
          ← All experiments
        </Link>
      </div>

      {experiment.compare ? (
        <section className="grid gap-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
            Before / after
          </h2>
          <Alert tone="info" title="Observational comparison">
            {experiment.compare.disclaimer}
          </Alert>
          <ul className="grid gap-3">
            {experiment.compare.rows.map((row) => (
              <li
                key={row.measure}
                className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4 text-sm"
              >
                <p className="font-medium text-[var(--color-foreground)]">
                  {row.label}
                </p>
                <div className="mt-2 grid gap-1 text-[var(--color-muted)] sm:grid-cols-3">
                  <p>Before: {row.beforeDisplay ?? "—"}</p>
                  <p>After: {row.afterDisplay ?? "—"}</p>
                  <p>Delta: {row.deltaDisplay ?? "—"}</p>
                </div>
                {row.missingNote ? (
                  <p className="mt-2 text-xs text-[var(--color-subtle)]">
                    {row.missingNote}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="text-sm text-[var(--color-muted)]">
          Before/after appears after you start (baseline) and complete (outcome).
        </p>
      )}
    </div>
  );
}
