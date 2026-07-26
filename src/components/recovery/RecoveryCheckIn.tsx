"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Alert, Badge, Button, Input, Label } from "@/design-system";
import { saveRecoveryCheckInAction } from "@/services/recovery/actions";
import type { RecoveryEntryView } from "@/services/recovery/recovery-service";

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
          className="text-xs text-[var(--color-subtle)] underline-offset-2 hover:underline"
          onClick={() => onChange("skip")}
        >
          Skip
        </button>
      </div>
      <p className="text-xs text-[var(--color-subtle)]">{hint}</p>
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

export function RecoveryCheckIn({
  todayEntry,
}: {
  todayEntry: RecoveryEntryView | null;
}) {
  const router = useRouter();
  const [sleepHours, setSleepHours] = useState(
    todayEntry?.sleepHours != null ? String(todayEntry.sleepHours) : "",
  );
  const [sleepQuality, setSleepQuality] = useState(
    todayEntry?.sleepQuality != null ? String(todayEntry.sleepQuality) : "skip",
  );
  const [stress, setStress] = useState(
    todayEntry?.stress != null ? String(todayEntry.stress) : "skip",
  );
  const [soreness, setSoreness] = useState(
    todayEntry?.soreness != null ? String(todayEntry.soreness) : "skip",
  );
  const [motivation, setMotivation] = useState(
    todayEntry?.motivation != null ? String(todayEntry.motivation) : "skip",
  );
  const [fatigue, setFatigue] = useState(
    todayEntry?.fatigue != null ? String(todayEntry.fatigue) : "skip",
  );
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await saveRecoveryCheckInAction(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage(
        result.readiness != null
          ? `Saved. Recovery Readiness estimate: ${result.readiness}/100.`
          : "Saved. Not enough signals for a readiness estimate.",
      );
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="accent">Daily check-in</Badge>
        <Badge variant="neutral">Under ~30 seconds</Badge>
        {todayEntry ? <Badge variant="success">Updated today</Badge> : null}
      </div>
      <p className="text-sm text-[var(--color-muted)]">
        All fields optional. Skip anything you don&apos;t want to log — sleep is
        never invented.
      </p>

      <div>
        <Label htmlFor="sleepHours" optional>
          Sleep duration (hours)
        </Label>
        <Input
          id="sleepHours"
          name="sleepHours"
          inputMode="decimal"
          className="min-h-12 max-w-[10rem] text-base"
          placeholder="e.g. 7.5"
          value={sleepHours}
          onChange={(e) => setSleepHours(e.target.value)}
        />
      </div>

      <QuickScale
        name="sleepQuality"
        label="Sleep quality"
        value={sleepQuality}
        onChange={setSleepQuality}
        hint="1 poor · 10 great"
      />
      <QuickScale
        name="stress"
        label="Stress"
        value={stress}
        onChange={setStress}
        hint="1 low · 10 high"
      />
      <QuickScale
        name="soreness"
        label="Soreness"
        value={soreness}
        onChange={setSoreness}
        hint="1 none · 10 very sore"
      />
      <QuickScale
        name="motivation"
        label="Motivation"
        value={motivation}
        onChange={setMotivation}
        hint="1 low · 10 high"
      />
      <QuickScale
        name="fatigue"
        label="Fatigue"
        value={fatigue}
        onChange={setFatigue}
        hint="1 fresh · 10 exhausted"
      />

      {error ? (
        <Alert tone="danger" title="Could not save check-in">
          {error}
        </Alert>
      ) : null}
      {message ? (
        <Alert tone="success" title="Check-in saved">
          {message}
        </Alert>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="min-h-14 w-full text-base"
        loading={pending}
      >
        {todayEntry ? "Update today’s check-in" : "Save check-in"}
      </Button>
    </form>
  );
}
