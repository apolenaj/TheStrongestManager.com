"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/design-system/utils/cn";
import {
  CATALOG_WORKOUT_HONESTY,
  CATALOG_WORKOUT_PAIN_FLAG_MESSAGE,
} from "@/domain/catalog-workout";
import type { CatalogWorkoutView } from "@/services/catalog-workout";
import {
  completeCatalogWorkoutAction,
  logCatalogSetAction,
  resolveCatalogTmAdjustmentAction,
} from "@/services/catalog-workout/actions";

type SetDraft = {
  actualWeight: string;
  actualRpe: string;
  actualRir: string;
  notes: string;
  painFlag: boolean;
};

function setKey(exerciseId: string, setIndex: number) {
  return `${exerciseId}:${setIndex}`;
}

export function CatalogWorkoutPlayer({
  workout,
}: {
  workout: CatalogWorkoutView;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [painNotice, setPainNotice] = useState(false);

  const initialDrafts = useMemo(() => {
    const map: Record<string, SetDraft> = {};
    for (const ex of workout.exercises) {
      for (const set of ex.sets) {
        map[setKey(ex.exerciseId, set.setIndex)] = {
          actualWeight:
            set.actualWeight != null ? String(set.actualWeight) : "",
          actualRpe: set.actualRpe != null ? String(set.actualRpe) : "",
          actualRir: set.actualRir != null ? String(set.actualRir) : "",
          notes: set.notes ?? "",
          painFlag: set.painFlag,
        };
      }
    }
    return map;
  }, [workout]);

  const [drafts, setDrafts] = useState(initialDrafts);

  useEffect(() => {
    setDrafts(initialDrafts);
  }, [initialDrafts]);

  function updateDraft(
    exerciseId: string,
    setIndex: number,
    patch: Partial<SetDraft>,
  ) {
    const key = setKey(exerciseId, setIndex);
    setDrafts((prev) => ({
      ...prev,
      [key]: { ...prev[key]!, ...patch },
    }));
  }

  function saveSet(
    exerciseId: string,
    exerciseName: string,
    set: CatalogWorkoutView["exercises"][number]["sets"][number],
  ) {
    const draft = drafts[setKey(exerciseId, set.setIndex)];
    if (!draft) return;
    setError(null);
    startTransition(async () => {
      const result = await logCatalogSetAction({
        sessionId: workout.sessionId,
        userProgramId: workout.userProgramId,
        dayKey: workout.dayKey,
        exerciseId,
        exerciseName,
        setIndex: set.setIndex,
        prescribedReps: set.prescribedReps,
        prescribedPercent: set.prescribedPercent,
        prescribedRpe: set.prescribedRpe,
        suggestedWeight: set.suggestedWeight,
        actualWeight: draft.actualWeight,
        actualRpe: draft.actualRpe,
        actualRir: draft.actualRir,
        notes: draft.notes,
        painFlag: draft.painFlag,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (draft.painFlag) setPainNotice(true);
      router.refresh();
    });
  }

  function resolveAdjustment(
    adjustmentId: string,
    decision: "approved" | "dismissed",
  ) {
    setError(null);
    startTransition(async () => {
      const result = await resolveCatalogTmAdjustmentAction({
        adjustmentId,
        userProgramId: workout.userProgramId,
        dayKey: workout.dayKey,
        decision,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function completeWorkout() {
    setError(null);
    startTransition(async () => {
      const result = await completeCatalogWorkoutAction({
        sessionId: workout.sessionId,
        userProgramId: workout.userProgramId,
        dayKey: workout.dayKey,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/app/programs");
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
          Week {workout.weekNumber} · {workout.productName}
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
          {workout.dayLabel}
        </h1>
        {workout.dayNotes ? (
          <p className="mt-3 text-sm text-[var(--color-muted)]">{workout.dayNotes}</p>
        ) : null}
        <p className="mt-2 text-xs text-[var(--color-subtle)]">
          Units: {workout.unitSystem}. Suggested loads use your training maxes.
        </p>
      </div>

      {workout.pendingAdjustments.length > 0 ? (
        <section className="space-y-3 border border-[color-mix(in_srgb,var(--color-warning)_45%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-warning)_10%,var(--color-surface-elevated))] p-5">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
            Training max suggestion
          </h2>
          <p className="text-sm text-[var(--color-muted)]">
            Template rule only — nothing changes until you approve.
          </p>
          {workout.pendingAdjustments.map((adj) => (
            <article
              key={adj.id}
              className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
            >
              <p className="text-sm font-medium text-[var(--color-foreground)]">
                {adj.liftKey}: {adj.fromTm} → {adj.toTm} {workout.unitSystem}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
                {adj.reason}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => resolveAdjustment(adj.id, "approved")}
                  className="min-h-11 rounded-sm bg-[var(--color-accent)] px-4 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-accent-foreground)] disabled:opacity-50"
                >
                  Approve change
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => resolveAdjustment(adj.id, "dismissed")}
                  className="min-h-11 border border-[var(--color-border)] px-4 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-foreground)] disabled:opacity-50"
                >
                  Keep current TM
                </button>
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {painNotice ? (
        <div
          role="alert"
          className="border border-[color-mix(in_srgb,var(--color-danger)_50%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_12%,transparent)] p-4 text-sm text-[var(--color-foreground)]"
        >
          {CATALOG_WORKOUT_PAIN_FLAG_MESSAGE}
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {error}
        </p>
      ) : null}

      <div className="space-y-6">
        {workout.exercises.map((exercise) => (
          <section
            key={exercise.exerciseId}
            className="border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5"
          >
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
              {exercise.name}
            </h2>
            {exercise.notes ? (
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                {exercise.notes}
              </p>
            ) : null}

            <div className="mt-5 space-y-4">
              {exercise.sets.map((set) => {
                const draft = drafts[setKey(exercise.exerciseId, set.setIndex)]!;
                return (
                  <div
                    key={set.setIndex}
                    className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold text-[var(--color-foreground)]">
                        Set {set.setIndex}
                      </p>
                      <p className="text-xs text-[var(--color-muted)]">
                        {set.prescribedReps != null
                          ? `${set.prescribedReps} reps`
                          : "reps n/a"}
                        {set.prescribedPercent != null
                          ? ` · ${set.prescribedPercent}%`
                          : ""}
                        {set.prescribedRpe != null
                          ? ` · RPE ${set.prescribedRpe}`
                          : ""}
                        {set.estimatedRir != null
                          ? ` · ~RIR ${set.estimatedRir}`
                          : ""}
                        {set.suggestedWeight != null
                          ? ` · suggest ${set.suggestedWeight}${workout.unitSystem}`
                          : " · no suggested load"}
                      </p>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <label className="block text-xs text-[var(--color-muted)]">
                        Actual weight ({workout.unitSystem})
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={draft.actualWeight}
                          onChange={(e) =>
                            updateDraft(exercise.exerciseId, set.setIndex, {
                              actualWeight: e.target.value,
                            })
                          }
                          className="mt-1.5 w-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm text-[var(--color-foreground)] outline-none focus:border-[var(--color-accent)]"
                        />
                      </label>
                      <label className="block text-xs text-[var(--color-muted)]">
                        Actual RPE
                        <input
                          type="number"
                          step="0.5"
                          min="1"
                          max="10"
                          value={draft.actualRpe}
                          onChange={(e) =>
                            updateDraft(exercise.exerciseId, set.setIndex, {
                              actualRpe: e.target.value,
                            })
                          }
                          className="mt-1.5 w-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm text-[var(--color-foreground)] outline-none focus:border-[var(--color-accent)]"
                        />
                      </label>
                      <label className="block text-xs text-[var(--color-muted)]">
                        Actual RIR (optional)
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="10"
                          value={draft.actualRir}
                          onChange={(e) =>
                            updateDraft(exercise.exerciseId, set.setIndex, {
                              actualRir: e.target.value,
                            })
                          }
                          className="mt-1.5 w-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm text-[var(--color-foreground)] outline-none focus:border-[var(--color-accent)]"
                        />
                      </label>
                    </div>

                    <label className="mt-3 block text-xs text-[var(--color-muted)]">
                      Notes
                      <textarea
                        value={draft.notes}
                        rows={2}
                        onChange={(e) =>
                          updateDraft(exercise.exerciseId, set.setIndex, {
                            notes: e.target.value,
                          })
                        }
                        className="mt-1.5 w-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm text-[var(--color-foreground)] outline-none focus:border-[var(--color-accent)]"
                      />
                    </label>

                    <label className="mt-3 flex items-start gap-3 text-sm text-[var(--color-foreground)]">
                      <input
                        type="checkbox"
                        checked={draft.painFlag}
                        onChange={(e) =>
                          updateDraft(exercise.exerciseId, set.setIndex, {
                            painFlag: e.target.checked,
                          })
                        }
                        className="mt-1 accent-[var(--color-accent)]"
                      />
                      <span>
                        Pain / issue flag
                        <span className="mt-1 block text-xs text-[var(--color-subtle)]">
                          Flags a concern only — not a diagnosis.
                        </span>
                      </span>
                    </label>

                    <button
                      type="button"
                      disabled={pending}
                      onClick={() =>
                        saveSet(exercise.exerciseId, exercise.name, set)
                      }
                      className={cn(
                        "mt-4 min-h-11 rounded-sm border border-[var(--color-border-strong)] px-4 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-foreground)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:opacity-50",
                      )}
                    >
                      Save set
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/app/programs"
          className="text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
        >
          Back to My Programs
        </Link>
        {workout.sessionStatus !== "completed" ? (
          <button
            type="button"
            disabled={pending}
            onClick={completeWorkout}
            className="inline-flex min-h-12 items-center justify-center rounded-sm bg-[var(--color-accent)] px-5 text-sm font-bold uppercase tracking-[0.08em] text-[var(--color-accent-foreground)] disabled:opacity-50"
          >
            Complete workout
          </button>
        ) : (
          <p className="text-sm text-[var(--color-muted)]">Workout completed.</p>
        )}
      </div>

      <ul className="space-y-1 text-xs text-[var(--color-subtle)]">
        {CATALOG_WORKOUT_HONESTY.map((line) => (
          <li key={line}>· {line}</li>
        ))}
      </ul>
    </div>
  );
}
