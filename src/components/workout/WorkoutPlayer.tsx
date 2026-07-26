"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Badge,
  Button,
  ProgressBar,
  Textarea,
} from "@/design-system";
import { featureFlags } from "@/config/feature-flags";
import { formatMass, type MassUnit } from "@/services/units/convert";
import {
  completeWorkoutAction,
  updateWorkoutNotesAction,
} from "@/services/workout/actions";
import {
  formatPreviousLine,
  type WorkoutSessionView,
} from "@/services/workout/types";
import { RestTimer } from "@/components/workout/RestTimer";
import {
  SetLogger,
  useFlushOfflineSetLogs,
} from "@/components/workout/SetLogger";
import { AutoregulationSuggestionBanner } from "@/components/workout/AutoregulationSuggestionBanner";
import type { AutoregulationOffer } from "@/services/live-session-autoregulation";
import { clearPendingForSession } from "@/lib/workout/offline-queue";
import { formatDateTimeInTimeZone } from "@/domain/timezone-system";
import { LearnWhy } from "@/components/on-site-education/LearnWhy";
import { initialFocusedExerciseIndex } from "@/domain/mobile-workout";
import { PwaOnlineStatus } from "@/components/pwa/PwaOnlineStatus";
import {
  cacheWorkoutSnapshot,
  clearCachedWorkout,
} from "@/lib/pwa/workout-cache";

function PrescriptionLine({
  sets,
  reps,
  loadKg,
  percent,
  rpe,
  rir,
  restSeconds,
  units,
  compact,
}: {
  sets: number | null;
  reps: string | null;
  loadKg: number | null;
  percent: number | null;
  rpe: number | null;
  rir: number | null;
  restSeconds: number | null;
  units: MassUnit;
  compact?: boolean;
}) {
  const parts: string[] = [];
  if (sets != null) parts.push(`${sets}×`);
  if (reps) parts.push(String(reps));
  if (loadKg != null) parts.push(formatMass(loadKg, units));
  if (percent != null) parts.push(`${percent}%`);
  if (rpe != null) parts.push(`RPE ${rpe}`);
  if (rir != null) parts.push(`RIR ${rir}`);
  if (restSeconds != null) parts.push(`${restSeconds}s`);
  if (parts.length === 0) return null;
  return (
    <div className="space-y-2">
      <p
        className={
          compact
            ? "text-base font-medium text-[var(--color-foreground)]"
            : "text-sm text-[var(--color-muted)]"
        }
      >
        {parts.join(" · ")}
      </p>
      {!compact && rpe != null ? <LearnWhy topicId="rpe" compact /> : null}
    </div>
  );
}

export function WorkoutPlayer({
  view,
  timeZone = "UTC",
}: {
  view: WorkoutSessionView;
  timeZone?: string;
}) {
  const mobile = featureFlags.mobileWorkoutExperience;
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState(view.notes ?? "");
  const [notesOpen, setNotesOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(() =>
    initialFocusedExerciseIndex(view.exercises),
  );
  const [restSeed, setRestSeed] = useState<number | null>(
    view.exercises[0]?.restSeconds ?? 90,
  );
  const [restKey, setRestKey] = useState(0);
  const [restAutoStart, setRestAutoStart] = useState(false);
  const [autoregOffer, setAutoregOffer] = useState<AutoregulationOffer | null>(
    null,
  );
  const [pending, startTransition] = useTransition();
  const locked = view.prescriptionLocked || view.status === "completed";

  useEffect(() => {
    setFocusIndex((i) =>
      Math.min(i, Math.max(0, view.exercises.length - 1)),
    );
  }, [view.exercises.length]);

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const onSetLogged = useCallback(
    (offer?: AutoregulationOffer | null) => {
      if (featureFlags.liveSessionAutoregulation && offer) {
        setAutoregOffer(offer);
      }
      refresh();
    },
    [refresh],
  );

  useFlushOfflineSetLogs(view.sessionId, refresh);

  useEffect(() => {
    if (!featureFlags.pwaReadiness) return;
    void cacheWorkoutSnapshot({ athleteKey: "self", view });
  }, [view]);

  useEffect(() => {
    if (!featureFlags.pwaReadiness) return;
    function onMessage(event: MessageEvent) {
      if (event.data?.type === "tsm-workout-sync") {
        refresh();
      }
    }
    navigator.serviceWorker?.addEventListener("message", onMessage);
    return () => {
      navigator.serviceWorker?.removeEventListener("message", onMessage);
    };
  }, [refresh]);

  const progress =
    view.totalSetCount > 0
      ? Math.round((view.completedSetCount / view.totalSetCount) * 100)
      : 0;

  function complete() {
    setError(null);
    startTransition(async () => {
      const result = await completeWorkoutAction(view.sessionId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      clearPendingForSession(view.sessionId);
      if (featureFlags.pwaReadiness) {
        void clearCachedWorkout(view.sessionId);
      }
      router.push("/app/today");
      router.refresh();
    });
  }

  function saveNotes() {
    setError(null);
    startTransition(async () => {
      const result = await updateWorkoutNotesAction({
        sessionId: view.sessionId,
        notes,
      });
      if (!result.ok) setError(result.error);
      else refresh();
    });
  }

  function startRest(secs: number | null) {
    setRestSeed(secs ?? 90);
    setRestAutoStart(true);
    setRestKey((value) => value + 1);
  }

  if (mobile && !locked) {
    const exercise = view.exercises[focusIndex];
    const previousLine = exercise
      ? formatPreviousLine(exercise.previous, view.units)
      : null;

    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col gap-4 pb-36">
        <header className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent">Workout</Badge>
            <PwaOnlineStatus />
            <span className="text-xs text-[var(--color-muted)]">
              {view.completedSetCount}/{view.totalSetCount} sets
            </span>
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl tracking-tight text-[var(--color-foreground)]">
            {view.title}
          </h1>
          {view.totalSetCount > 0 ? (
            <ProgressBar
              value={progress}
              label="Progress"
              tone="accent"
              showValue
            />
          ) : null}
        </header>

        {error ? (
          <Alert tone="danger" title="Could not update workout">
            {error}
          </Alert>
        ) : null}

        {autoregOffer ? (
          <AutoregulationSuggestionBanner
            sessionId={view.sessionId}
            offer={autoregOffer}
            onDismiss={() => setAutoregOffer(null)}
            onApplied={() => {
              setAutoregOffer(null);
              refresh();
            }}
          />
        ) : null}

        {!exercise ? (
          <Alert tone="info" title="No exercises">
            This session has no exercises.
          </Alert>
        ) : (
          <section className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-subtle)]">
                Exercise {focusIndex + 1} of {view.exercises.length}
              </p>
              <h2 className="font-[family-name:var(--font-display)] text-3xl leading-tight text-[var(--color-foreground)]">
                {exercise.name}
              </h2>
              <PrescriptionLine
                compact
                sets={exercise.targetSets}
                reps={exercise.targetReps}
                loadKg={exercise.targetLoadKg}
                percent={exercise.targetPercent}
                rpe={exercise.targetRpe}
                rir={exercise.targetRir}
                restSeconds={exercise.restSeconds}
                units={view.units}
              />
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-panel)]/50 px-3 py-3">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-subtle)]">
                  Previous
                </p>
                <p className="mt-1 text-base font-medium text-[var(--color-foreground)]">
                  {previousLine ?? "No logged sets yet for this lift"}
                </p>
                {exercise.previous?.sessionLabel ? (
                  <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                    {exercise.previous.sessionLabel}
                  </p>
                ) : null}
              </div>
              {exercise.techniqueCue ? (
                <p className="rounded-[var(--radius-md)] bg-[var(--color-accent-muted)] px-3 py-2.5 text-sm text-[var(--color-foreground)]">
                  <span className="font-medium text-[var(--color-accent)]">
                    Cue ·{" "}
                  </span>
                  {exercise.techniqueCue}
                </p>
              ) : null}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                size="lg"
                variant="secondary"
                className="min-h-12 flex-1"
                disabled={focusIndex <= 0}
                onClick={() => setFocusIndex((i) => Math.max(0, i - 1))}
              >
                Prev
              </Button>
              <Button
                type="button"
                size="lg"
                variant="secondary"
                className="min-h-12 flex-1"
                disabled={focusIndex >= view.exercises.length - 1}
                onClick={() =>
                  setFocusIndex((i) =>
                    Math.min(view.exercises.length - 1, i + 1),
                  )
                }
              >
                Next
              </Button>
            </div>

            <div className="space-y-3">
              {exercise.sets.length === 0 ? (
                <Alert tone="info" title="No sets prescribed">
                  No sets were prescribed for this exercise.
                </Alert>
              ) : (
                exercise.sets.map((set) => (
                  <SetLogger
                    key={set.sessionSetId}
                    sessionId={view.sessionId}
                    set={set}
                    units={view.units}
                    mobile
                    onLogged={onSetLogged}
                    onStartRest={startRest}
                  />
                ))
              )}
            </div>
          </section>
        )}

        <div className="pt-2">
          <button
            type="button"
            className="min-h-11 text-sm font-medium text-[var(--color-accent)] underline-offset-2 hover:underline"
            onClick={() => setNotesOpen((o) => !o)}
          >
            {notesOpen ? "Hide session notes" : "Session notes (optional)"}
          </button>
          {notesOpen ? (
            <div className="mt-2 space-y-2">
              <Textarea
                className="min-h-20 text-base"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Overall session notes…"
              />
              <Button
                type="button"
                size="lg"
                variant="secondary"
                className="min-h-12 w-full"
                loading={pending}
                onClick={saveNotes}
              >
                Save notes
              </Button>
            </div>
          ) : null}
        </div>

        {/* Thumb-zone dock: rest + finish */}
        <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-[var(--z-sticky)] border-t border-[var(--color-border)] bg-[var(--color-background)]/95 px-3 py-3 backdrop-blur md:bottom-0">
          <div className="mx-auto max-w-lg space-y-2">
            <RestTimer
              key={restKey}
              defaultSeconds={restSeed}
              compact
              autoStart={restAutoStart}
            />
            <Button
              type="button"
              size="lg"
              className="min-h-14 w-full text-base"
              loading={pending}
              onClick={complete}
            >
              Finish workout
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Legacy / completed layout (or flag off)
  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={locked ? "success" : "accent"}>
            {locked ? "Completed" : "In progress"}
          </Badge>
          {view.programName ? (
            <Badge variant="neutral">{view.programName}</Badge>
          ) : null}
        </div>
        <h1 className="font-display text-3xl tracking-tight text-[var(--color-foreground)] sm:text-4xl">
          {view.title}
        </h1>
        {view.goal ? (
          <p className="text-base text-[var(--color-muted)]">
            <span className="text-[var(--color-subtle)]">Goal · </span>
            {view.goal}
          </p>
        ) : null}
        {view.startedAt ? (
          <p className="text-sm text-[var(--color-subtle)]">
            Started {formatDateTimeInTimeZone(view.startedAt, timeZone)}
            {view.completedAt
              ? ` · Completed ${formatDateTimeInTimeZone(view.completedAt, timeZone)}`
              : ""}
          </p>
        ) : null}
        {view.estimatedMinutes != null ? (
          <p className="text-sm text-[var(--color-subtle)]">
            Est. {view.estimatedMinutes} min
          </p>
        ) : null}
        {!locked && view.totalSetCount > 0 ? (
          <ProgressBar
            value={progress}
            label={`${view.completedSetCount} / ${view.totalSetCount} sets`}
            tone="accent"
            showValue
          />
        ) : null}
      </header>

      {!locked ? (
        <RestTimer key={restKey} defaultSeconds={restSeed} />
      ) : null}

      {error ? (
        <Alert tone="danger" title="Could not update workout">
          {error}
        </Alert>
      ) : null}

      {autoregOffer ? (
        <AutoregulationSuggestionBanner
          sessionId={view.sessionId}
          offer={autoregOffer}
          onDismiss={() => setAutoregOffer(null)}
          onApplied={() => {
            setAutoregOffer(null);
            refresh();
          }}
        />
      ) : null}

      <div className="space-y-8">
        {view.exercises.map((ex, index) => {
          const prev = formatPreviousLine(ex.previous, view.units);
          return (
            <section
              key={ex.sessionExerciseId}
              className="space-y-3 border-t border-[var(--color-border)] pt-6 first:border-t-0 first:pt-0"
            >
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-subtle)]">
                  Exercise {index + 1}
                </p>
                <h2 className="font-display text-2xl text-[var(--color-foreground)]">
                  {ex.name}
                </h2>
                <PrescriptionLine
                  sets={ex.targetSets}
                  reps={ex.targetReps}
                  loadKg={ex.targetLoadKg}
                  percent={ex.targetPercent}
                  rpe={ex.targetRpe}
                  rir={ex.targetRir}
                  restSeconds={ex.restSeconds}
                  units={view.units}
                />
                {ex.techniqueCue ? (
                  <p className="rounded-[var(--radius-sm)] bg-[var(--color-accent-muted)] px-3 py-2 text-sm text-[var(--color-foreground)]">
                    <span className="font-medium text-[var(--color-accent)]">
                      Cue ·{" "}
                    </span>
                    {ex.techniqueCue}
                  </p>
                ) : null}
                <p className="text-sm text-[var(--color-muted)]">
                  Previous · {prev ?? "No logged sets yet for this lift"}
                  {ex.previous?.sessionLabel
                    ? ` (${ex.previous.sessionLabel})`
                    : ""}
                </p>
              </div>

              <div className="space-y-3">
                {ex.sets.length === 0 ? (
                  <Alert tone="info" title="No sets prescribed">
                    No sets were prescribed for this exercise.
                  </Alert>
                ) : (
                  ex.sets.map((set) =>
                    locked ? (
                      <div
                        key={set.sessionSetId}
                        className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
                      >
                        <p className="text-sm font-medium">
                          Set {set.setNumber}
                          {set.isComplete ? " · done" : ""}
                        </p>
                        <p className="mt-1 text-sm text-[var(--color-muted)]">
                          {[
                            set.performedLoadKg != null
                              ? formatMass(set.performedLoadKg, view.units)
                              : null,
                            set.performedReps != null
                              ? `${set.performedReps} reps`
                              : null,
                            set.performedRpe != null
                              ? `RPE ${set.performedRpe}`
                              : null,
                            set.notes,
                          ]
                            .filter(Boolean)
                            .join(" · ") || "Not logged"}
                        </p>
                      </div>
                    ) : (
                      <SetLogger
                        key={set.sessionSetId}
                        sessionId={view.sessionId}
                        set={set}
                        units={view.units}
                        onLogged={onSetLogged}
                        onStartRest={(secs) => {
                          setRestSeed(secs ?? ex.restSeconds ?? 90);
                          setRestKey((value) => value + 1);
                        }}
                      />
                    ),
                  )
                )}
              </div>
            </section>
          );
        })}
      </div>

      <section className="space-y-3 border-t border-[var(--color-border)] pt-6">
        <h2 className="font-display text-xl text-[var(--color-foreground)]">
          Session notes
        </h2>
        {locked ? (
          <p className="text-sm text-[var(--color-muted)]">
            {view.notes?.trim() || "No session notes."}
          </p>
        ) : (
          <>
            <Textarea
              className="min-h-24 text-base"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Overall session notes…"
            />
            <Button
              type="button"
              size="lg"
              variant="secondary"
              className="min-h-12 w-full sm:w-auto"
              loading={pending}
              onClick={saveNotes}
            >
              Save notes
            </Button>
          </>
        )}
      </section>

      {!locked ? (
        <div className="sticky bottom-20 z-[var(--z-sticky)] -mx-3 border-t border-[var(--color-border)] bg-[var(--color-background)]/95 px-3 py-3 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none">
          <Button
            type="button"
            size="lg"
            className="min-h-14 w-full text-base"
            loading={pending}
            onClick={complete}
          >
            Finish workout
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          size="lg"
          variant="secondary"
          className="min-h-12 w-full sm:w-auto"
          onClick={() => router.push("/app/today")}
        >
          Back to Today
        </Button>
      )}
    </div>
  );
}
