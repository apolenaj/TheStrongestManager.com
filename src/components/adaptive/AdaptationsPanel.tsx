"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Badge,
  Button,
  Input,
  Label,
} from "@/design-system";
import {
  acceptAdaptationAction,
  declineAdaptationAction,
  modifyAdaptationAction,
  refreshAdaptationsAction,
} from "@/services/adaptive/actions";
import type { AdaptationView } from "@/services/adaptive/adaptation-service";
import { formatMass, type MassUnit } from "@/services/units/convert";
import { AthleteAiFeedbackControls } from "@/components/ai/AthleteAiFeedbackControls";
import { fromAdaptation } from "@/domain/explainable-ai";
import { WhyAmISeeingThis } from "@/components/explainable-ai/WhyAmISeeingThis";
import { ConfidenceBadge } from "@/components/confidence/ConfidenceBadge";

function ParamsSummary({
  params,
}: {
  params: AdaptationView["proposedParams"];
}) {
  const parts: string[] = [];
  if (params.deltaKg != null) {
    parts.push(`${params.deltaKg > 0 ? "+" : ""}${params.deltaKg} kg`);
  }
  if (params.loadMultiplier != null) {
    parts.push(`×${params.loadMultiplier}`);
  }
  if (params.setsDelta != null) {
    parts.push(`${params.setsDelta > 0 ? "+" : ""}${params.setsDelta} sets`);
  }
  if (parts.length === 0) return <span className="text-[var(--color-subtle)]">No numeric change</span>;
  return <span>{parts.join(" · ")}</span>;
}

function AdaptationCard({
  item,
  units,
}: {
  item: AdaptationView;
  units: MassUnit;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [modifying, setModifying] = useState(false);
  const [deltaKg, setDeltaKg] = useState(
    String(item.proposedParams.deltaKg ?? ""),
  );
  const [setsDelta, setSetsDelta] = useState(
    String(item.proposedParams.setsDelta ?? ""),
  );
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  function refresh() {
    router.refresh();
  }

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      setModifying(false);
      refresh();
    });
  }

  const pendingStatus = item.status === "pending";

  return (
    <article className="space-y-3 border-t border-[var(--color-border)] pt-5 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-center gap-2">
        <ConfidenceBadge confidence={item.confidence} />
        <Badge variant="neutral">{item.status}</Badge>
        <Badge variant="accent">{item.changeKind.replaceAll("_", " ")}</Badge>
        {item.source === "heuristic" ? (
          <Badge variant="warning">Heuristic</Badge>
        ) : null}
      </div>

      <h3 className="font-display text-xl text-[var(--color-foreground)]">
        {item.recommendedChange}
      </h3>
      {item.exerciseName || item.programName ? (
        <p className="text-sm text-[var(--color-subtle)]">
          {[item.exerciseName, item.programName].filter(Boolean).join(" · ")}
        </p>
      ) : null}

      <div className="space-y-1 text-sm">
        <WhyAmISeeingThis
          view={fromAdaptation({
            reason: item.reason,
            confidence: item.confidence,
          })}
        />
        <p className="text-[var(--color-muted)]">
          <span className="font-medium text-[var(--color-foreground)]">
            Proposed ·{" "}
          </span>
          <ParamsSummary params={item.proposedParams} />
        </p>
        {item.preview ? (
          <p className="text-[var(--color-muted)]">
            <span className="font-medium text-[var(--color-foreground)]">
              Preview ·{" "}
            </span>
            {item.currentLoadKg != null
              ? `${formatMass(item.currentLoadKg, units)} → ${
                  item.preview.loadKg != null
                    ? formatMass(item.preview.loadKg, units)
                    : "—"
                }`
              : "Load not prescribed"}
            {item.currentSets != null
              ? ` · ${item.currentSets} → ${item.preview.sets ?? "—"} sets`
              : ""}
          </p>
        ) : null}
        {item.appliedAt ? (
          <p className="text-xs text-[var(--color-subtle)]">
            Applied {new Date(item.appliedAt).toLocaleString()} · audit{" "}
            {item.events.length} event{item.events.length === 1 ? "" : "s"}
          </p>
        ) : (
          <p className="text-xs text-[var(--color-subtle)]">
            Engine {item.engineVersion} · not applied until you decide ·{" "}
            {item.events.length} audit event
            {item.events.length === 1 ? "" : "s"}
          </p>
        )}
      </div>

      {error ? (
        <Alert tone="danger" title="Could not update adaptation">
          {error}
        </Alert>
      ) : null}

      {pendingStatus && modifying ? (
        <div className="space-y-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor={`delta-${item.id}`} optional>
                Δ load (kg)
              </Label>
              <Input
                id={`delta-${item.id}`}
                inputMode="decimal"
                className="min-h-12"
                value={deltaKg}
                onChange={(e) => setDeltaKg(e.target.value)}
                placeholder="e.g. 2.5 or -2.5"
              />
            </div>
            <div>
              <Label htmlFor={`sets-${item.id}`} optional>
                Δ sets
              </Label>
              <Input
                id={`sets-${item.id}`}
                inputMode="numeric"
                className="min-h-12"
                value={setsDelta}
                onChange={(e) => setSetsDelta(e.target.value)}
                placeholder="e.g. 1 or -1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor={`note-${item.id}`} optional>
              Note
            </Label>
            <Input
              id={`note-${item.id}`}
              className="min-h-12"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Why you’re changing this"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              size="lg"
              variant="secondary"
              className="min-h-12"
              onClick={() => setModifying(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="lg"
              className="min-h-12"
              loading={pending}
              onClick={() =>
                run(() =>
                  modifyAdaptationAction({
                    adaptationId: item.id,
                    deltaKg: deltaKg.trim() ? Number(deltaKg) : undefined,
                    setsDelta: setsDelta.trim()
                      ? Number(setsDelta)
                      : undefined,
                    loadMultiplier: item.proposedParams.loadMultiplier,
                    decisionNote: note || undefined,
                  }),
                )
              }
            >
              Apply modified
            </Button>
          </div>
        </div>
      ) : null}

      {pendingStatus && !modifying ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Button
            type="button"
            size="lg"
            className="min-h-12"
            loading={pending}
            onClick={() => run(() => acceptAdaptationAction(item.id))}
          >
            Accept
          </Button>
          <Button
            type="button"
            size="lg"
            variant="secondary"
            className="min-h-12"
            onClick={() => setModifying(true)}
          >
            Modify
          </Button>
          <Button
            type="button"
            size="lg"
            variant="ghost"
            className="min-h-12"
            loading={pending}
            onClick={() =>
              run(() =>
                declineAdaptationAction({
                  adaptationId: item.id,
                  decisionNote: note || undefined,
                }),
              )
            }
          >
            Decline
          </Button>
        </div>
      ) : null}

      {!pendingStatus && item.events.length > 0 ? (
        <details className="text-sm text-[var(--color-muted)]">
          <summary className="cursor-pointer text-[var(--color-foreground)]">
            Audit trail
          </summary>
          <ul className="mt-2 space-y-1 pl-1">
            {item.events.map((event) => (
              <li key={event.id}>
                {event.eventType} ·{" "}
                {new Date(event.createdAt).toLocaleString()}
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      <AthleteAiFeedbackControls
        relatedType="program_adaptation"
        relatedId={item.id}
      />
    </article>
  );
}

export function AdaptationsPanel({
  items,
  units,
}: {
  items: AdaptationView[];
  units: MassUnit;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const pendingItems = items.filter((i) => i.status === "pending");
  const history = items.filter((i) => i.status !== "pending");

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-[var(--color-muted)]">
          Suggestions only — nothing changes your program until you Accept or
          Apply modified.
        </p>
        <Button
          type="button"
          size="lg"
          variant="secondary"
          className="min-h-12"
          loading={pending}
          onClick={() => {
            setError(null);
            setMessage(null);
            startTransition(async () => {
              const result = await refreshAdaptationsAction();
              if (!result.ok) {
                setError(result.error);
                return;
              }
              setMessage(
                result.createdCount
                  ? `Created ${result.createdCount} suggestion${result.createdCount === 1 ? "" : "s"}.`
                  : result.skippedReason ??
                      "No new suggestions from current signals.",
              );
              router.refresh();
            });
          }}
        >
          Refresh suggestions
        </Button>
      </div>

      {error ? (
        <Alert tone="danger" title="Could not refresh">
          {error}
        </Alert>
      ) : null}
      {message ? (
        <Alert tone="info" title="Suggestions updated">
          {message}
        </Alert>
      ) : null}

      <section className="space-y-4">
        <h2 className="font-display text-2xl text-[var(--color-foreground)]">
          Pending
        </h2>
        {pendingItems.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">
            No pending adaptations. Complete a workout or refresh suggestions
            when you have logged sets.
          </p>
        ) : (
          pendingItems.map((item) => (
            <AdaptationCard key={item.id} item={item} units={units} />
          ))
        )}
      </section>

      {history.length > 0 ? (
        <section className="space-y-4">
          <h2 className="font-display text-2xl text-[var(--color-foreground)]">
            History
          </h2>
          {history.map((item) => (
            <AdaptationCard key={item.id} item={item} units={units} />
          ))}
        </section>
      ) : null}
    </div>
  );
}
