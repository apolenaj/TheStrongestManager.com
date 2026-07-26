"use client";

import { useActionState } from "react";
import { Button, Input, Label, Select } from "@/design-system";
import {
  saveCompetitionPrepAction,
  type CompetitionActionState,
} from "@/services/competition-mode/actions";
import type { CompetitionModePageView } from "@/services/competition-mode";

const initial: CompetitionActionState = { ok: false };

export function CompetitionSetupForm({
  prep,
}: {
  prep: CompetitionModePageView["prep"];
}) {
  const [state, action, pending] = useActionState(
    saveCompetitionPrepAction,
    initial,
  );

  const dateValue = prep?.competitionDate
    ? prep.competitionDate.slice(0, 10)
    : "";

  return (
    <form action={action} className="grid max-w-xl gap-4">
      <div className="grid gap-2">
        <Label htmlFor="sport">Sport</Label>
        <Select
          id="sport"
          name="sport"
          defaultValue={prep?.sport ?? "powerlifting"}
          required
        >
          <option value="powerlifting">Powerlifting</option>
          <option value="deadlift_only">Deadlift-only</option>
          <option value="strongman">Strongman (later)</option>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="name">Meet name (optional)</Label>
        <Input
          id="name"
          name="name"
          defaultValue={prep?.name ?? ""}
          placeholder="Local open"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="competitionDate">Competition date</Label>
        <Input
          id="competitionDate"
          name="competitionDate"
          type="date"
          defaultValue={dateValue}
          required
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
        <div className="grid gap-2">
          <Label htmlFor="weightClassLabel">Weight class label</Label>
          <Input
            id="weightClassLabel"
            name="weightClassLabel"
            defaultValue={prep?.weightClassLabel ?? ""}
            placeholder="83 kg"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="weightClassLimitKg">Class limit (kg)</Label>
          <Input
            id="weightClassLimitKg"
            name="weightClassLimitKg"
            type="number"
            step="0.1"
            min="0"
            defaultValue={prep?.weightClassLimitKg ?? ""}
            placeholder="83"
          />
        </div>
      </div>

      <fieldset className="grid gap-3">
        <legend className="text-sm font-medium text-[var(--color-fg)]">
          Target lifts (kg)
        </legend>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="squatKg">Squat</Label>
            <Input
              id="squatKg"
              name="squatKg"
              type="number"
              step="0.5"
              min="0"
              defaultValue={prep?.targets.squatKg ?? ""}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="benchKg">Bench</Label>
            <Input
              id="benchKg"
              name="benchKg"
              type="number"
              step="0.5"
              min="0"
              defaultValue={prep?.targets.benchKg ?? ""}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="deadliftKg">Deadlift</Label>
            <Input
              id="deadliftKg"
              name="deadliftKg"
              type="number"
              step="0.5"
              min="0"
              defaultValue={prep?.targets.deadliftKg ?? ""}
            />
          </div>
        </div>
      </fieldset>

      <div className="grid gap-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Input
          id="notes"
          name="notes"
          defaultValue={prep?.targets.notes ?? ""}
          placeholder="Opener confidence, federation, etc."
        />
      </div>

      {state.error ? (
        <p className="text-sm text-[var(--color-danger)]">{state.error}</p>
      ) : null}
      {state.ok && state.message ? (
        <p className="text-sm text-[var(--color-muted)]">{state.message}</p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : prep ? "Update Competition Mode" : "Start Competition Mode"}
      </Button>
    </form>
  );
}
