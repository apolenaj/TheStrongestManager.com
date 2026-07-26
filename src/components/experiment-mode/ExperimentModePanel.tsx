"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  Alert,
  Badge,
  Button,
  Input,
  Label,
  Textarea,
} from "@/design-system";
import {
  createExperimentAction,
  type ExperimentActionState,
} from "@/services/experiment-mode/actions";
import {
  EXPERIMENT_DURATION_WEEKS_MAX,
  EXPERIMENT_DURATION_WEEKS_MIN,
  EXPERIMENT_MEASURE_LABELS,
  EXPERIMENT_MEASURES,
  EXPERIMENT_MODE_HONESTY,
  EXPERIMENT_MODE_PRODUCT_NAME,
  EXPERIMENT_STATUS_LABELS,
  type PersonalTrainingExperimentView,
} from "@/domain/experiment-mode";

const initial: ExperimentActionState = { ok: false };

export function ExperimentModePanel({
  experiments,
}: {
  experiments: PersonalTrainingExperimentView[];
}) {
  const [state, action, pending] = useActionState(
    createExperimentAction,
    initial,
  );

  return (
    <div className="grid gap-10">
      <Alert tone="warning" title="Not scientific research">
        {EXPERIMENT_MODE_HONESTY[0]} {EXPERIMENT_MODE_HONESTY[1]}
      </Alert>

      <section className="grid gap-4 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Start a {EXPERIMENT_MODE_PRODUCT_NAME.toLowerCase()}
        </h2>
        <p className="text-sm text-[var(--color-muted)]">
          Example: test paused deadlift for 6 weeks, track “improve floor
          strength,” measure deadlift performance and technique.
        </p>
        <form action={action} className="grid gap-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              className="mt-1"
              placeholder="Paused deadlift block"
              required
            />
          </div>
          <div>
            <Label htmlFor="intervention">Test (intervention)</Label>
            <Textarea
              id="intervention"
              name="intervention"
              rows={2}
              className="mt-1"
              placeholder="Paused deadlift for 6 weeks"
              required
            />
          </div>
          <div>
            <Label htmlFor="hypothesis">Personal prediction</Label>
            <Textarea
              id="hypothesis"
              name="hypothesis"
              rows={2}
              className="mt-1"
              placeholder="Improve floor strength"
              required
            />
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              Your coaching prediction — not a scientific hypothesis.
            </p>
          </div>
          <div>
            <Label htmlFor="durationWeeks">Duration (weeks)</Label>
            <Input
              id="durationWeeks"
              name="durationWeeks"
              type="number"
              min={EXPERIMENT_DURATION_WEEKS_MIN}
              max={EXPERIMENT_DURATION_WEEKS_MAX}
              defaultValue={6}
              className="mt-1"
              required
            />
          </div>
          <fieldset>
            <legend className="text-sm font-medium">Measure</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {EXPERIMENT_MEASURES.map((m) => (
                <label
                  key={m}
                  className="flex items-center gap-2 text-sm text-[var(--color-foreground)]"
                >
                  <input
                    type="checkbox"
                    name={`measure_${m}`}
                    defaultChecked={
                      m === "deadlift_performance" || m === "technique"
                    }
                  />
                  {EXPERIMENT_MEASURE_LABELS[m]}
                </label>
              ))}
            </div>
          </fieldset>
          <div>
            <Label htmlFor="athleteNotes">Notes (optional)</Label>
            <Textarea id="athleteNotes" name="athleteNotes" rows={2} className="mt-1" />
          </div>
          <Button type="submit" loading={pending}>
            Create personal training experiment
          </Button>
        </form>
        {state.error ? (
          <Alert tone="danger" title="Could not create">
            {state.error}
          </Alert>
        ) : null}
        {state.message ? (
          <Alert tone="success" title="Created">
            {state.message}{" "}
            {state.experimentId ? (
              <Link
                href={`/app/experiments/${state.experimentId}`}
                className="text-[var(--color-accent)]"
              >
                Open →
              </Link>
            ) : null}
          </Alert>
        ) : null}
      </section>

      <section className="grid gap-4">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Your experiments
        </h2>
        {experiments.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">
            No personal training experiments yet.
          </p>
        ) : (
          <ul className="grid gap-3">
            {experiments.map((ex) => (
              <li key={ex.id}>
                <Link
                  href={`/app/experiments/${ex.id}`}
                  className="block border-b border-[var(--color-border)] pb-3 transition-colors hover:border-[var(--color-accent)]"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={
                        ex.status === "active"
                          ? "accent"
                          : ex.status === "completed"
                            ? "success"
                            : "neutral"
                      }
                    >
                      {EXPERIMENT_STATUS_LABELS[ex.status]}
                    </Badge>
                    <span className="font-medium text-[var(--color-foreground)]">
                      {ex.title}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                    Test: {ex.intervention}
                  </p>
                  <p className="text-sm text-[var(--color-muted)]">
                    Prediction: {ex.hypothesis}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
