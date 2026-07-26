"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Alert, Button } from "@/design-system";
import { cn } from "@/design-system/utils/cn";
import { featureFlags } from "@/config/feature-flags";
import {
  fromCanonicalKg,
  roundDisplay,
  type MassUnit,
} from "@/services/units/convert";
import { logSessionSetAction } from "@/services/workout/actions";
import type { WorkoutSetView } from "@/services/workout/types";
import type { AutoregulationOffer } from "@/services/live-session-autoregulation";
import {
  enqueuePendingSetLog,
  isBrowserOnline,
  listPendingSetLogs,
  removePendingSetLog,
} from "@/lib/workout/offline-queue";
import {
  MOBILE_WORKOUT_AUTO_SAVE_MS,
  nudgeLoad,
  nudgeReps,
  nudgeRpe,
} from "@/domain/mobile-workout";
import { NumberStepper } from "@/components/workout/NumberStepper";

type SetLoggerProps = {
  sessionId: string;
  set: WorkoutSetView;
  units: MassUnit;
  onLogged?: (offer?: AutoregulationOffer | null) => void;
  onStartRest?: (seconds: number | null) => void;
  /** Compact mobile layout (default when mobileWorkoutExperience is on). */
  mobile?: boolean;
};

function seedLoad(set: WorkoutSetView, units: MassUnit): string {
  const kg = set.performedLoadKg ?? set.prescribedLoadKg;
  if (kg == null) return "";
  return String(roundDisplay(fromCanonicalKg(kg, units), units === "lb" ? 1 : 1));
}

function seedReps(set: WorkoutSetView): string {
  if (set.performedReps != null) return String(set.performedReps);
  if (set.prescribedReps != null) return String(set.prescribedReps);
  return "";
}

export function SetLogger({
  sessionId,
  set,
  units,
  onLogged,
  onStartRest,
  mobile = featureFlags.mobileWorkoutExperience,
}: SetLoggerProps) {
  const [load, setLoad] = useState(() => seedLoad(set, units));
  const [reps, setReps] = useState(() => seedReps(set));
  const [rpe, setRpe] = useState(
    set.performedRpe != null
      ? String(set.performedRpe)
      : set.prescribedRpe != null
        ? String(set.prescribedRpe)
        : "",
  );
  const [rir, setRir] = useState(
    set.performedRir != null
      ? String(set.performedRir)
      : set.prescribedRir != null
        ? String(set.prescribedRir)
        : "",
  );
  const [notes, setNotes] = useState(set.notes ?? "");
  const [notesOpen, setNotesOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queued, setQueued] = useState(false);
  const [savedHint, setSavedHint] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const skipAutoSave = useRef(true);
  const lastSaved = useRef("");

  useEffect(() => {
    skipAutoSave.current = true;
    setLoad(seedLoad(set, units));
    setReps(seedReps(set));
    setRpe(
      set.performedRpe != null
        ? String(set.performedRpe)
        : set.prescribedRpe != null
          ? String(set.prescribedRpe)
          : "",
    );
    setRir(
      set.performedRir != null
        ? String(set.performedRir)
        : set.prescribedRir != null
          ? String(set.prescribedRir)
          : "",
    );
    setNotes(set.notes ?? "");
    lastSaved.current = JSON.stringify({
      load: seedLoad(set, units),
      reps: seedReps(set),
      rpe:
        set.performedRpe != null
          ? String(set.performedRpe)
          : set.prescribedRpe != null
            ? String(set.prescribedRpe)
            : "",
      rir:
        set.performedRir != null
          ? String(set.performedRir)
          : set.prescribedRir != null
            ? String(set.prescribedRir)
            : "",
      notes: set.notes ?? "",
    });
    const t = window.setTimeout(() => {
      skipAutoSave.current = false;
    }, 50);
    return () => window.clearTimeout(t);
  }, [set, units]);

  const submit = useCallback(
    (markComplete: boolean, opts?: { silent?: boolean }) => {
      setError(null);
      setQueued(false);
      const payload = {
        sessionSetId: set.sessionSetId,
        sessionId,
        load,
        reps,
        rpe,
        rir,
        notes,
        markComplete,
      };
      const fingerprint = JSON.stringify({
        load,
        reps,
        rpe,
        rir,
        notes,
      });

      if (!markComplete && fingerprint === lastSaved.current && opts?.silent) {
        return;
      }

    if (!isBrowserOnline()) {
      enqueuePendingSetLog(payload);
      setQueued(true);
      lastSaved.current = fingerprint;
      void import("@/lib/pwa/workout-cache").then((m) =>
        m.requestWorkoutBackgroundSync(),
      );
      if (markComplete) {
        onStartRest?.(set.prescribedRestSeconds);
      }
      if (!opts?.silent) onLogged?.(null);
      else setSavedHint("Saved offline");
      return;
    }

      startTransition(async () => {
        const result = await logSessionSetAction(payload);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        lastSaved.current = fingerprint;
        if (markComplete) {
          onStartRest?.(set.prescribedRestSeconds);
        }
        if (opts?.silent) {
          setSavedHint("Saved");
          window.setTimeout(() => setSavedHint(null), 1500);
        } else {
          onLogged?.(result.autoregulation ?? null);
        }
      });
    },
    [
      load,
      notes,
      onLogged,
      onStartRest,
      reps,
      rir,
      rpe,
      sessionId,
      set.prescribedRestSeconds,
      set.sessionSetId,
    ],
  );

  // Auto-save drafts (not complete) after debounce.
  useEffect(() => {
    if (!mobile || skipAutoSave.current) return;
    const id = window.setTimeout(() => {
      submit(false, { silent: true });
    }, MOBILE_WORKOUT_AUTO_SAVE_MS);
    return () => window.clearTimeout(id);
  }, [load, reps, rpe, rir, notes, mobile, submit]);

  if (!mobile) {
    return (
      <LegacySetLogger
        sessionId={sessionId}
        set={set}
        units={units}
        load={load}
        setLoad={setLoad}
        reps={reps}
        setReps={setReps}
        rpe={rpe}
        setRpe={setRpe}
        rir={rir}
        setRir={setRir}
        notes={notes}
        setNotes={setNotes}
        error={error}
        queued={queued}
        pending={pending}
        onSubmit={submit}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border p-4",
        set.isComplete
          ? "border-[var(--color-success)]/40 bg-[var(--color-score-excellent-muted)]"
          : "border-[var(--color-border)] bg-[var(--color-surface)]",
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="font-[family-name:var(--font-display)] text-lg text-[var(--color-foreground)]">
          Set {set.setNumber}
          {set.setType !== "work" ? (
            <span className="ml-2 text-sm text-[var(--color-subtle)]">
              · {set.setType}
            </span>
          ) : null}
        </p>
        <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
          {savedHint ? <span>{savedHint}</span> : null}
          {set.isComplete ? (
            <span className="font-medium uppercase tracking-wider text-[var(--color-success)]">
              Done
            </span>
          ) : (
            <span className="text-[var(--color-subtle)]">Auto-saves</span>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        <NumberStepper
          id={`load-${set.sessionSetId}`}
          label={`Load (${units})`}
          value={load}
          inputMode="decimal"
          onChange={setLoad}
          onDecrement={() => setLoad((v) => nudgeLoad(v, units, -1))}
          onIncrement={() => setLoad((v) => nudgeLoad(v, units, 1))}
          disabled={pending}
        />
        <NumberStepper
          id={`reps-${set.sessionSetId}`}
          label="Reps"
          value={reps}
          inputMode="numeric"
          onChange={setReps}
          onDecrement={() => setReps((v) => nudgeReps(v, -1))}
          onIncrement={() => setReps((v) => nudgeReps(v, 1))}
          disabled={pending}
        />
        <NumberStepper
          id={`rpe-${set.sessionSetId}`}
          label="RPE"
          value={rpe}
          inputMode="decimal"
          onChange={setRpe}
          onDecrement={() => setRpe((v) => nudgeRpe(v, -1))}
          onIncrement={() => setRpe((v) => nudgeRpe(v, 1))}
          disabled={pending}
        />
      </div>

      <div className="mt-3">
        <button
          type="button"
          className="min-h-11 text-sm font-medium text-[var(--color-accent)] underline-offset-2 hover:underline"
          onClick={() => setNotesOpen((o) => !o)}
        >
          {notesOpen ? "Hide notes" : "Add note (optional)"}
        </button>
        {notesOpen ? (
          <textarea
            className="mt-2 min-h-16 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-base text-[var(--color-fg)] outline-none focus-visible:border-[var(--color-accent)]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How it felt…"
            rows={2}
          />
        ) : null}
      </div>

      {error ? (
        <Alert tone="danger" title="Could not save set" className="mt-3">
          {error}
        </Alert>
      ) : null}
      {queued ? (
        <Alert tone="warning" title="Saved offline" className="mt-3">
          Will sync when you&apos;re back online.
        </Alert>
      ) : null}

      <Button
        type="button"
        size="lg"
        className="mt-4 min-h-14 w-full text-base"
        loading={pending}
        onClick={() => submit(true)}
      >
        {set.isComplete ? "Update & restart rest" : "Complete set"}
      </Button>
    </div>
  );
}

function LegacySetLogger(props: {
  sessionId: string;
  set: WorkoutSetView;
  units: MassUnit;
  load: string;
  setLoad: (v: string) => void;
  reps: string;
  setReps: (v: string) => void;
  rpe: string;
  setRpe: (v: string) => void;
  rir: string;
  setRir: (v: string) => void;
  notes: string;
  setNotes: (v: string) => void;
  error: string | null;
  queued: boolean;
  pending: boolean;
  onSubmit: (markComplete: boolean) => void;
}) {
  const { set, units } = props;
  return (
    <div
      className={cn(
        "rounded-[var(--radius-md)] border p-3 sm:p-4",
        set.isComplete
          ? "border-[var(--color-success)]/40 bg-[var(--color-score-excellent-muted)]"
          : "border-[var(--color-border)] bg-[var(--color-surface)]",
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-[var(--color-foreground)]">
          Set {set.setNumber}
        </p>
        {set.isComplete ? (
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-success)]">
            Done
          </span>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(
          [
            ["Load", props.load, props.setLoad, "decimal"],
            ["Reps", props.reps, props.setReps, "numeric"],
            ["RPE", props.rpe, props.setRpe, "decimal"],
            ["RIR", props.rir, props.setRir, "decimal"],
          ] as const
        ).map(([label, value, setter, mode]) => (
          <div key={label}>
            <label className="text-xs text-[var(--color-muted)]">
              {label}
              {label === "Load" ? ` (${units})` : ""}
            </label>
            <input
              inputMode={mode}
              className="mt-1 min-h-12 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-base"
              value={value}
              onChange={(e) => setter(e.target.value)}
            />
          </div>
        ))}
      </div>
      <textarea
        className="mt-3 min-h-[3rem] w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-base"
        rows={2}
        value={props.notes}
        onChange={(e) => props.setNotes(e.target.value)}
        placeholder="Notes…"
      />
      {props.error ? (
        <Alert tone="danger" title="Could not save set" className="mt-3">
          {props.error}
        </Alert>
      ) : null}
      {props.queued ? (
        <Alert tone="warning" title="Saved offline" className="mt-3">
          Will sync when online.
        </Alert>
      ) : null}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button
          type="button"
          size="lg"
          variant="secondary"
          className="min-h-12"
          loading={props.pending}
          onClick={() => props.onSubmit(false)}
        >
          Save
        </Button>
        <Button
          type="button"
          size="lg"
          className="min-h-12"
          loading={props.pending}
          onClick={() => props.onSubmit(true)}
        >
          Complete set
        </Button>
      </div>
    </div>
  );
}

/** Flush queued offline logs when connectivity returns (or SW sync message). */
export function useFlushOfflineSetLogs(
  sessionId: string,
  onFlushed?: () => void,
) {
  useEffect(() => {
    async function flush() {
      if (!isBrowserOnline()) return;
      const pending = listPendingSetLogs(sessionId);
      for (const item of pending) {
        const result = await logSessionSetAction({
          sessionSetId: item.sessionSetId,
          sessionId: item.sessionId,
          load: item.load,
          reps: item.reps,
          rpe: item.rpe,
          rir: item.rir,
          notes: item.notes,
          markComplete: item.markComplete,
        });
        if (result.ok) {
          removePendingSetLog(item.id);
        }
      }
      if (pending.length > 0) onFlushed?.();
    }

    function onMessage(event: MessageEvent) {
      if (event.data?.type === "tsm-workout-sync") {
        void flush();
      }
    }

    void flush();
    window.addEventListener("online", flush);
    navigator.serviceWorker?.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("online", flush);
      navigator.serviceWorker?.removeEventListener("message", onMessage);
    };
  }, [sessionId, onFlushed]);
}
