"use client";

import { useActionState } from "react";
import {
  Badge,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
} from "@/design-system";
import { ATHLETE_LEVEL_IDS, LEVEL_LABELS } from "@/domain/athlete-level";
import type { AthleteLevelPageView } from "@/services/athlete-level";
import {
  saveAthleteLevelOptInAction,
  type AthleteLevelActionState,
} from "@/services/athlete-level/actions";

const initial: AthleteLevelActionState = { ok: false };

function levelVariant(
  level: string,
): "neutral" | "info" | "accent" | "success" | "warning" {
  if (level === "elite") return "success";
  if (level === "competitive") return "accent";
  if (level === "advanced") return "info";
  if (level === "developing") return "warning";
  return "neutral";
}

export function AthleteLevelPanel({ view }: { view: AthleteLevelPageView }) {
  const [state, action, pending] = useActionState(
    saveAthleteLevelOptInAction,
    initial,
  );

  return (
    <div className="grid gap-8">
      <Card>
        <CardHeader>
          <Badge variant={view.optedIn ? "accent" : "neutral"}>
            {view.optedIn ? "Opted in" : "Optional — off by default"}
          </Badge>
          <CardTitle className="mt-2 text-lg tracking-tight">
            Athlete Level preferences
          </CardTitle>
          <CardDescription>
            Multi-factor level from consistency, knowledge, technique, training
            history, and progress — not absolute strength alone.
          </CardDescription>
        </CardHeader>

        <form action={action} className="grid max-w-xl gap-4">
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              name="optedIn"
              defaultChecked={view.optedIn}
              className="mt-1 accent-[var(--color-accent)]"
            />
            <span>
              <span className="font-medium">Show my Athlete Level</span>
              <span className="mt-0.5 block text-xs text-[var(--color-muted)]">
                Elite never comes from app opens or clicks alone.
              </span>
            </span>
          </label>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save preference"}
          </Button>
          {state.error ? (
            <p className="text-sm text-[var(--color-score-critical)]">
              {state.error}
            </p>
          ) : null}
          {state.message ? (
            <p className="text-sm text-[var(--color-score-excellent)]">
              {state.message}
            </p>
          ) : null}
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How leveling works</CardTitle>
          <CardDescription>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {view.honesty.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </CardDescription>
        </CardHeader>
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
          Separate from sport strength classes
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
          {view.sportStrengthBoundary.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </Card>

      {!view.optedIn ? (
        <EmptyState
          title="Athlete Level is off"
          description="Opt in above to compute your level from real training behaviors."
        />
      ) : !view.result ? (
        <EmptyState
          title="No level yet"
          description="We could not compute a level from available data."
        />
      ) : (
        <div className="grid gap-6">
          <Card elevated>
            <CardHeader>
              <div className="flex flex-wrap gap-2">
                {ATHLETE_LEVEL_IDS.map((id) => (
                  <Badge
                    key={id}
                    variant={
                      id === view.result!.level
                        ? levelVariant(id)
                        : "neutral"
                    }
                  >
                    {LEVEL_LABELS[id]}
                  </Badge>
                ))}
              </div>
              <CardTitle className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-tight">
                {view.result.label}
              </CardTitle>
              <CardDescription>
                {view.levelDescriptions[view.result.level]}
              </CardDescription>
            </CardHeader>
            <p className="text-sm text-[var(--color-muted)]">
              {view.result.summary}
            </p>
            <p className="mt-2 text-sm">
              Composite:{" "}
              <span className="font-medium">{view.result.composite}/100</span>
            </p>
            {view.result.eliteBlockedReason &&
            view.result.level !== "elite" ? (
              <p className="mt-2 text-xs text-[var(--color-muted)]">
                Elite gate: {view.result.eliteBlockedReason}
              </p>
            ) : null}
          </Card>

          <ul className="grid gap-3 sm:grid-cols-2">
            {view.result.factors.map((f) => (
              <li key={f.id}>
                <Card>
                  <CardHeader>
                    <Badge variant="info">
                      {view.factorLabels[f.id]} · {f.score}
                    </Badge>
                    <CardDescription className="mt-2">{f.detail}</CardDescription>
                  </CardHeader>
                  <div
                    className="h-2 overflow-hidden rounded-full bg-[var(--color-surface-elevated)]"
                    role="progressbar"
                    aria-valuenow={f.score}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="h-full bg-[var(--color-accent)]"
                      style={{ width: `${f.score}%` }}
                    />
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
