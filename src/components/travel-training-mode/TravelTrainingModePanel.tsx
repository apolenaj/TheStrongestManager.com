"use client";

import { useState } from "react";
import { Alert, Badge, Button } from "@/design-system";
import type { TravelModeView } from "@/services/travel-training-mode";
import {
  endTravelModeAction,
  startTravelModeAction,
} from "@/services/travel-training-mode/actions";
import { EQUIPMENT_OPTIONS } from "@/services/onboarding/options";
import type { TravelPresetId } from "@/domain/travel-training-mode";

export function TravelTrainingModePanel({ view }: { view: TravelModeView }) {
  const [preset, setPreset] = useState<TravelPresetId>("hotel_gym");

  return (
    <div className="grid gap-8">
      <Alert tone="info" title="Temporary by design">
        {view.honesty[0]} {view.honesty[1]}
      </Alert>
      <Alert tone="info" title="Home profile stays intact">
        {view.honesty[2]} {view.honesty[3]}
      </Alert>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Status
        </h2>
        <div className="flex flex-wrap gap-2">
          <Badge variant={view.active ? "warning" : "success"}>
            {view.active ? "Travel Mode on" : "Travel Mode off"}
          </Badge>
          {view.current ? (
            <Badge variant="accent">{view.current.label}</Badge>
          ) : null}
        </div>

        {view.current ? (
          <div className="grid gap-3">
            <p className="text-sm text-[var(--color-muted)]">
              Started {new Date(view.current.startedAt).toLocaleString()}. Fit
              mode: {view.current.fitEquipment.replace(/_/g, " ")}.
            </p>
            <p className="text-sm text-[var(--color-muted)]">
              Travel gear:{" "}
              {view.current.catalogKeys.length > 0
                ? view.current.catalogKeys.join(", ")
                : "none"}
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
              {view.current.adaptationLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            {view.current.programId &&
            view.current.preTravelVersionNumber != null ? (
              <Badge variant="neutral">
                Program checkpoint v{view.current.preTravelVersionNumber}
              </Badge>
            ) : (
              <p className="text-sm text-[var(--color-muted)]">
                No program version checkpoint — ending travel still restores
                your home equipment list.
              </p>
            )}
            <form action={endTravelModeAction}>
              <Button type="submit" variant="primary">
                End travel — return to normal program
              </Button>
            </form>
          </div>
        ) : (
          <p className="text-sm text-[var(--color-muted)]">
            Select hotel gym, no gym, or limited equipment. Programming and
            suggestions adapt until you end travel.
          </p>
        )}
      </section>

      {!view.active ? (
        <section className="grid gap-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
            Start travel
          </h2>
          <form action={startTravelModeAction} className="grid gap-4">
            <ul className="grid gap-3">
              {view.presets.map((p) => (
                <li
                  key={p.id}
                  className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4"
                >
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="radio"
                      name="preset"
                      value={p.id}
                      checked={preset === p.id}
                      onChange={() => setPreset(p.id)}
                      className="mt-1"
                    />
                    <span>
                      <span className="font-medium">{p.label}</span>
                      <span className="mt-1 block text-sm text-[var(--color-muted)]">
                        {p.description}
                      </span>
                      <span className="mt-1 block text-sm text-[var(--color-muted)]">
                        {p.adaptationSummary}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>

            {preset === "limited" ? (
              <div className="grid gap-2">
                <p className="text-sm font-medium">Trip checklist</p>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {EQUIPMENT_OPTIONS.map((opt) => (
                    <li key={opt.id}>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          name="equipment"
                          value={opt.id}
                          defaultChecked={
                            opt.id === "dumbbells" || opt.id === "bodyweight"
                          }
                        />
                        {opt.label}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <label className="grid gap-1 text-sm max-w-md">
              <span className="font-medium">Notes (optional)</span>
              <input
                name="notes"
                type="text"
                placeholder="e.g. 5 nights in Lisbon"
                className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-transparent px-3 py-2"
              />
            </label>

            <Button type="submit">Start Travel Mode</Button>
          </form>
        </section>
      ) : null}

      {view.recentEnded.length > 0 ? (
        <section className="grid gap-3">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
            Recent trips
          </h2>
          <ul className="grid gap-2 text-sm text-[var(--color-muted)]">
            {view.recentEnded.map((t) => (
              <li key={t.id}>
                {t.label} — started{" "}
                {new Date(t.startedAt).toLocaleDateString()}
                {t.endedAt
                  ? `, ended ${new Date(t.endedAt).toLocaleDateString()}`
                  : ""}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
