"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Select,
} from "@/design-system";
import {
  WARMUP_MAX_SETS,
  addWarmupSet,
  applyWarmupSetEdits,
  generateWarmupPlan,
  removeWarmupSet,
  type WarmupExerciseId,
  type WarmupPlan,
} from "@/domain/warmup-generator";
import type { WarmupGeneratorPageData } from "@/services/warmup-generator";

export function WarmupGeneratorPanel({
  data,
}: {
  data: WarmupGeneratorPageData;
}) {
  const [exerciseId, setExerciseId] = useState<WarmupExerciseId>(
    data.defaultExerciseId,
  );
  const exercise =
    data.exercises.find((e) => e.id === exerciseId) ?? data.exercises[0]!;

  const [targetInput, setTargetInput] = useState(
    exercise.suggestedTargetKg != null
      ? String(exercise.suggestedTargetKg)
      : "100",
  );
  const [preferFewer, setPreferFewer] = useState(false);
  const [plan, setPlan] = useState<WarmupPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const targetKg = useMemo(() => {
    const n = Number(targetInput);
    return Number.isFinite(n) ? n : NaN;
  }, [targetInput]);

  function regenerate() {
    const result = generateWarmupPlan({
      targetWorkingWeightKg: targetKg,
      exerciseId: exercise.id,
      exerciseLabel: exercise.label,
      history: exercise.history.sessionCount > 0 ? exercise.history : null,
      preferFewerSets: preferFewer,
    });
    if (!result.ok) {
      setPlan(null);
      setError(result.reason);
      return;
    }
    setError(null);
    setPlan(result.plan);
  }

  function onExerciseChange(id: WarmupExerciseId) {
    setExerciseId(id);
    const next = data.exercises.find((e) => e.id === id);
    if (next?.suggestedTargetKg != null) {
      setTargetInput(String(next.suggestedTargetKg));
    }
    setPlan(null);
    setError(null);
  }

  return (
    <div className="grid gap-6">
      <p className="text-sm text-[var(--color-muted)]">
        Enter a target working weight and exercise. Defaults are conservative
        and capped to limit warm-up fatigue — edit any set before you use them.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="wu-exercise">Exercise</Label>
          <Select
            id="wu-exercise"
            value={exerciseId}
            onChange={(e) =>
              onExerciseChange(e.target.value as WarmupExerciseId)
            }
          >
            {data.exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="wu-target">Target working weight (kg)</Label>
          <input
            id="wu-target"
            type="number"
            min={20}
            step={2.5}
            value={targetInput}
            onChange={(e) => setTargetInput(e.target.value)}
            className="rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
          />
        </div>
      </div>

      <label className="flex gap-3 text-sm">
        <input
          type="checkbox"
          checked={preferFewer}
          onChange={(e) => setPreferFewer(e.target.checked)}
          className="mt-1"
        />
        <span>
          <span className="font-medium">Prefer fewer warm-up sets</span>
          <span className="mt-0.5 block text-[var(--color-muted)]">
            Forces the shorter ladder even when recent volume is low.
          </span>
        </span>
      </label>

      <div>
        <Button type="button" onClick={regenerate}>
          Generate warm-ups
        </Button>
      </div>

      {error ? (
        <Alert tone="danger" title="Could not generate">
          {error}
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent history</CardTitle>
          <CardDescription>
            {exercise.history.sessionCount === 0
              ? "No working sets for this exercise in the lookback window — plan uses conservative defaults only."
              : `${exercise.history.sessionCount} session(s) · volume ≈ ${Math.round(exercise.history.volumeKgReps)} kg·reps${exercise.history.heaviestLoadKg != null ? ` · heaviest ≈ ${exercise.history.heaviestLoadKg} kg` : ""}.`}
          </CardDescription>
        </CardHeader>
      </Card>

      {plan ? (
        <div className="grid gap-4">
          {plan.usedFatigueLadder ? (
            <Alert tone="info" title="Shorter ladder">
              Using fewer warm-up sets to avoid stacking fatigue on top of recent
              volume.
            </Alert>
          ) : null}

          <ul className="divide-y divide-[var(--color-border)]">
            {plan.sets.map((s) => (
              <li key={s.id} className="grid gap-3 py-4 sm:grid-cols-[1fr_6rem_5rem_auto] sm:items-end">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                    Set {s.order}
                    {s.userModified ? " · edited" : ""}
                  </p>
                  <input
                    aria-label={`Label for set ${s.order}`}
                    value={s.label}
                    onChange={(e) =>
                      setPlan(
                        applyWarmupSetEdits(plan, [
                          { id: s.id, label: e.target.value },
                        ]),
                      )
                    }
                    className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-sm font-medium"
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor={`load-${s.id}`}>kg</Label>
                  <input
                    id={`load-${s.id}`}
                    type="number"
                    step={2.5}
                    min={2.5}
                    value={s.loadKg}
                    onChange={(e) =>
                      setPlan(
                        applyWarmupSetEdits(plan, [
                          { id: s.id, loadKg: Number(e.target.value) },
                        ]),
                      )
                    }
                    className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-sm"
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor={`reps-${s.id}`}>Reps</Label>
                  <input
                    id={`reps-${s.id}`}
                    type="number"
                    min={1}
                    max={20}
                    value={s.reps}
                    onChange={(e) =>
                      setPlan(
                        applyWarmupSetEdits(plan, [
                          { id: s.id, reps: Number(e.target.value) },
                        ]),
                      )
                    }
                    className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-sm"
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setPlan(removeWarmupSet(plan, s.id))}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="secondary"
              disabled={plan.sets.length >= WARMUP_MAX_SETS}
              onClick={() => setPlan(addWarmupSet(plan))}
            >
              Add set
            </Button>
            <Button type="button" variant="secondary" onClick={regenerate}>
              Reset to defaults
            </Button>
          </div>

          <p className="text-sm text-[var(--color-muted)]">
            Working weight: {plan.targetWorkingWeightKg} kg ·{" "}
            {plan.historySummary}
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
            {plan.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <ul className="list-disc space-y-1 pl-5 text-xs text-[var(--color-muted)]">
            {plan.honesty.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
