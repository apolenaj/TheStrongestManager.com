"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Badge,
  Button,
  ButtonLink,
  EmptyState,
} from "@/design-system";
import { formatMass } from "@/services/units/convert";
import { startTodaysWorkoutAction } from "@/services/workout/actions";
import type { TodayWorkoutView } from "@/services/workout/types";

export function TodayWorkoutPanel({ view }: { view: TodayWorkoutView }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function start() {
    setError(null);
    startTransition(async () => {
      const result = await startTodaysWorkoutAction();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/app/training/${result.sessionId}`);
      router.refresh();
    });
  }

  if (view.activeSessionId) {
    return (
      <div className="space-y-4">
        <Alert tone="info" title="Workout in progress">
          Continue where you left off — logged sets are already on this session.
        </Alert>
        <ButtonLink
          href={`/app/training/${view.activeSessionId}`}
          size="lg"
          className="min-h-14 w-full text-base sm:w-auto"
        >
          Continue workout
        </ButtonLink>
      </div>
    );
  }

  if (!view.prescription) {
    return (
      <EmptyState
        title="Nothing scheduled for today"
        description={
          view.emptyReason ??
          "Assign an active program or schedule a training session to see today’s workout."
        }
        action={
          <ButtonLink href="/app/programs" variant="secondary">
            Open programs
          </ButtonLink>
        }
      />
    );
  }

  const rx = view.prescription;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {rx.programName ? (
            <Badge variant="neutral">{rx.programName}</Badge>
          ) : null}
          {rx.estimatedMinutes != null ? (
            <Badge variant="accent">~{rx.estimatedMinutes} min</Badge>
          ) : null}
        </div>
        <h2 className="font-display text-3xl tracking-tight text-[var(--color-foreground)]">
          {rx.title}
        </h2>
        {rx.goal ? (
          <p className="text-base text-[var(--color-muted)]">
            <span className="text-[var(--color-subtle)]">Goal · </span>
            {rx.goal}
          </p>
        ) : view.goalTitle ? (
          <p className="text-base text-[var(--color-muted)]">
            <span className="text-[var(--color-subtle)]">Goal · </span>
            {view.goalTitle}
          </p>
        ) : null}
      </div>

      <ol className="space-y-4">
        {rx.exercisesPreview.map((ex, index) => {
          const targets: string[] = [];
          if (ex.targetSets != null) targets.push(`${ex.targetSets} sets`);
          if (ex.targetReps) targets.push(`${ex.targetReps} reps`);
          if (ex.targetLoadKg != null) {
            targets.push(formatMass(ex.targetLoadKg, view.units));
          }
          if (ex.targetRpe != null) targets.push(`RPE ${ex.targetRpe}`);
          if (ex.targetRir != null) targets.push(`RIR ${ex.targetRir}`);
          if (ex.restSeconds != null) targets.push(`${ex.restSeconds}s rest`);

          return (
            <li
              key={`${ex.name}-${index}`}
              className="border-t border-[var(--color-border)] pt-4 first:border-t-0 first:pt-0"
            >
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-subtle)]">
                Exercise {index + 1}
              </p>
              <p className="mt-1 font-display text-xl text-[var(--color-foreground)]">
                {ex.name}
              </p>
              {targets.length > 0 ? (
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  {targets.join(" · ")}
                </p>
              ) : null}
              {ex.techniqueCue ? (
                <p className="mt-2 text-sm text-[var(--color-foreground)]">
                  <span className="text-[var(--color-accent)]">Cue · </span>
                  {ex.techniqueCue}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>

      {error ? (
        <Alert tone="danger" title="Could not start workout">
          {error}
        </Alert>
      ) : null}

      <Button
        type="button"
        size="lg"
        className="min-h-14 w-full text-base"
        loading={pending}
        onClick={start}
      >
        Start workout
      </Button>
    </div>
  );
}
