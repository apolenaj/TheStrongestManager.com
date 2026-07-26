"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/design-system";
import { cn } from "@/design-system/utils/cn";
import { MOBILE_WORKOUT_REST_PRESETS_SEC } from "@/domain/mobile-workout";

type RestTimerProps = {
  defaultSeconds: number | null;
  className?: string;
  /** Compact sticky thumb-zone layout. */
  compact?: boolean;
  /** When true, auto-start when defaultSeconds / key changes. */
  autoStart?: boolean;
};

export function RestTimer({
  defaultSeconds,
  className,
  compact = false,
  autoStart = false,
}: RestTimerProps) {
  const initial = defaultSeconds && defaultSeconds > 0 ? defaultSeconds : 90;
  const [secondsLeft, setSecondsLeft] = useState(initial);
  const [running, setRunning] = useState(false);
  const [custom, setCustom] = useState(initial);
  const endAt = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    const tick = () => {
      if (endAt.current == null) return;
      const left = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left <= 0) {
        setRunning(false);
        endAt.current = null;
      }
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [running]);

  const start = useCallback((secs: number) => {
    const safe = Math.max(1, Math.round(secs));
    setCustom(safe);
    setSecondsLeft(safe);
    endAt.current = Date.now() + safe * 1000;
    setRunning(true);
  }, []);

  // Restart when seed changes (new set completed).
  useEffect(() => {
    const next = defaultSeconds && defaultSeconds > 0 ? defaultSeconds : 90;
    setCustom(next);
    setSecondsLeft(next);
    if (autoStart) {
      endAt.current = Date.now() + next * 1000;
      setRunning(true);
    } else {
      setRunning(false);
      endAt.current = null;
    }
  }, [defaultSeconds, autoStart]);

  const pause = () => {
    if (!running) return;
    setRunning(false);
    endAt.current = null;
  };

  const reset = () => {
    setRunning(false);
    endAt.current = null;
    setSecondsLeft(custom);
  };

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  if (compact) {
    return (
      <div
        className={cn(
          "rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-3",
          className,
        )}
      >
        <div className="flex items-center gap-3">
          <p
            className={cn(
              "font-[family-name:var(--font-display)] text-3xl tabular-nums tracking-tight",
              running && secondsLeft <= 10
                ? "text-[var(--color-accent)]"
                : "text-[var(--color-foreground)]",
            )}
            aria-live="polite"
          >
            {mm}:{ss}
          </p>
          <div className="ml-auto flex gap-2">
            <Button
              type="button"
              size="lg"
              variant={running ? "secondary" : "primary"}
              className="min-h-12 min-w-[4.5rem]"
              onClick={() => (running ? pause() : start(secondsLeft || custom))}
            >
              {running ? "Pause" : "Rest"}
            </Button>
            <Button
              type="button"
              size="lg"
              variant="ghost"
              className="min-h-12"
              onClick={reset}
            >
              Reset
            </Button>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {MOBILE_WORKOUT_REST_PRESETS_SEC.map((secs) => (
            <button
              key={secs}
              type="button"
              className="min-h-11 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] text-sm font-medium text-[var(--color-muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-foreground)]"
              onClick={() => start(secs)}
            >
              {secs}s
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-subtle)]">
          Rest timer
        </p>
        <p className="font-display text-3xl tabular-nums tracking-tight text-[var(--color-foreground)]">
          {mm}:{ss}
        </p>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Button
          type="button"
          size="lg"
          variant={running ? "secondary" : "primary"}
          className="min-h-12"
          onClick={() => (running ? pause() : start(secondsLeft || custom))}
        >
          {running ? "Pause" : "Start"}
        </Button>
        <Button
          type="button"
          size="lg"
          variant="secondary"
          className="min-h-12"
          onClick={reset}
        >
          Reset
        </Button>
        <Button
          type="button"
          size="lg"
          variant="ghost"
          className="min-h-12"
          onClick={() => start(custom)}
          disabled={running}
        >
          Restart
        </Button>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {MOBILE_WORKOUT_REST_PRESETS_SEC.map((secs) => (
          <button
            key={secs}
            type="button"
            className="min-h-11 rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] text-sm text-[var(--color-muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
            onClick={() => start(secs)}
          >
            {secs}s
          </button>
        ))}
      </div>
    </div>
  );
}
