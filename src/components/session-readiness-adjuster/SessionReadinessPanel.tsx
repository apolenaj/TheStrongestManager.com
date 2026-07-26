"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Badge,
  Button,
  ButtonLink,
  Label,
} from "@/design-system";
import {
  adjustSessionReadiness,
  type SessionReadinessCheckIn,
} from "@/domain/session-readiness-adjuster";
import { saveSessionReadinessCheckInAction } from "@/services/session-readiness-adjuster/actions";
import type { SessionReadinessPageData } from "@/services/session-readiness-adjuster";

const SCALE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

function QuickScale({
  name,
  label,
  value,
  onChange,
  hint,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
  hint: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={name}>{label}</Label>
        <button
          type="button"
          className="text-xs text-[var(--color-muted)] underline-offset-2 hover:underline"
          onClick={() => onChange("skip")}
        >
          Skip
        </button>
      </div>
      <p className="text-xs text-[var(--color-muted)]">{hint}</p>
      <div className="flex flex-wrap gap-1.5">
        {SCALE.map((n) => {
          const selected = value === String(n);
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(String(n))}
              className={
                selected
                  ? "min-h-11 min-w-11 rounded-[var(--radius-sm)] bg-[var(--color-accent)] text-sm font-medium text-[var(--color-accent-foreground)]"
                  : "min-h-11 min-w-11 rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] text-sm text-[var(--color-muted)] hover:border-[var(--color-accent)]"
              }
              aria-pressed={selected}
            >
              {n}
            </button>
          );
        })}
      </div>
      <input type="hidden" name={name} value={value === "skip" ? "" : value} />
    </div>
  );
}

function toScaleState(n: number | null): string {
  return n != null ? String(n) : "skip";
}

export function SessionReadinessPanel({
  data,
}: {
  data: SessionReadinessPageData;
}) {
  const router = useRouter();
  const [sleepHours, setSleepHours] = useState(
    data.prefill.sleepHours != null ? String(data.prefill.sleepHours) : "",
  );
  const [fatigue, setFatigue] = useState(toScaleState(data.prefill.fatigue));
  const [soreness, setSoreness] = useState(
    toScaleState(data.prefill.soreness),
  );
  const [motivation, setMotivation] = useState(
    toScaleState(data.prefill.motivation),
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const liveCheckIn: SessionReadinessCheckIn = useMemo(() => {
    const sleep = sleepHours.trim() === "" ? null : Number(sleepHours);
    return {
      sleepHours:
        sleep != null && Number.isFinite(sleep) ? sleep : null,
      fatigue: fatigue === "skip" || fatigue === "" ? null : Number(fatigue),
      soreness:
        soreness === "skip" || soreness === "" ? null : Number(soreness),
      motivation:
        motivation === "skip" || motivation === ""
          ? null
          : Number(motivation),
    };
  }, [sleepHours, fatigue, soreness, motivation]);

  const adjustment = useMemo(
    () => adjustSessionReadiness(liveCheckIn),
    [liveCheckIn],
  );

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await saveSessionReadinessCheckInAction(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  const tone =
    adjustment.recommendation === "proceed"
      ? "success"
      : adjustment.recommendation === "minor_adjustment"
        ? "warning"
        : "info";

  return (
    <div className="grid gap-8">
      <p className="text-sm text-[var(--color-muted)]">
        Quick pre-workout check-in. The system may suggest proceed, a minor
        adjustment, or reviewing load — it never cancels your workout from one
        metric.
      </p>

      <Alert tone={tone} title={adjustment.headline}>
        <p>{adjustment.detail}</p>
        {adjustment.singleMetricEscalationBlocked ? (
          <p className="mt-2 text-sm">
            Single-signal escalation capped — workout stays available.
          </p>
        ) : null}
        <p className="mt-2 text-xs">
          Cancels workout: {adjustment.cancelsWorkout ? "yes" : "never"}
        </p>
      </Alert>

      {adjustment.concerns.length > 0 ? (
        <ul className="space-y-2">
          {adjustment.concerns.map((c) => (
            <li key={c.field} className="text-sm">
              <Badge variant="neutral">{c.label}</Badge>
              <span className="ml-2 text-[var(--color-muted)]">{c.detail}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <form onSubmit={submit} className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="sleepHours">Sleep (hours)</Label>
          <p className="text-xs text-[var(--color-muted)]">
            Last night — leave blank to skip.
          </p>
          <input
            id="sleepHours"
            name="sleepHours"
            type="number"
            min={0}
            max={24}
            step={0.5}
            value={sleepHours}
            onChange={(e) => setSleepHours(e.target.value)}
            className="max-w-xs rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
          />
        </div>

        <QuickScale
          name="fatigue"
          label="Fatigue"
          value={fatigue}
          onChange={setFatigue}
          hint="1 = fresh · 10 = exhausted"
        />
        <QuickScale
          name="soreness"
          label="Soreness"
          value={soreness}
          onChange={setSoreness}
          hint="1 = none · 10 = very sore"
        />
        <QuickScale
          name="motivation"
          label="Motivation"
          value={motivation}
          onChange={setMotivation}
          hint="1 = low · 10 = high"
        />

        {error ? (
          <Alert tone="danger" title="Could not save">
            {error}
          </Alert>
        ) : null}
        {saved ? (
          <Alert tone="success" title="Saved">
            Check-in stored with recovery. Recommendation above stays a planning
            aid — not a cancel.
          </Alert>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save check-in"}
          </Button>
          <ButtonLink href={data.todayHref} variant="secondary">
            Today’s workout
          </ButtonLink>
          <ButtonLink href={data.recoveryHref} variant="secondary">
            Full recovery
          </ButtonLink>
        </div>
      </form>

      <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
        {adjustment.notes.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
      <ul className="list-disc space-y-1 pl-5 text-xs text-[var(--color-muted)]">
        {adjustment.honesty.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>
    </div>
  );
}
