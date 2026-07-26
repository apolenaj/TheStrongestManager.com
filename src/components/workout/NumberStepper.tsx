"use client";

/**
 * Large +/- stepper for one-hand set logging (minimal typing).
 */
export function NumberStepper({
  id,
  label,
  value,
  display,
  onDecrement,
  onIncrement,
  onChange,
  inputMode = "decimal",
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  /** Optional formatted display; falls back to value. */
  display?: string;
  onDecrement: () => void;
  onIncrement: () => void;
  onChange: (next: string) => void;
  inputMode?: "decimal" | "numeric";
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-muted)]"
      >
        {label}
      </label>
      <div className="flex items-stretch gap-2">
        <button
          type="button"
          disabled={disabled}
          aria-label={`Decrease ${label}`}
          className="min-h-12 min-w-12 shrink-0 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-2xl font-medium text-[var(--color-foreground)] transition-colors hover:border-[var(--color-accent)] disabled:opacity-40"
          onClick={onDecrement}
        >
          −
        </button>
        <input
          id={id}
          inputMode={inputMode}
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className="min-h-12 w-full min-w-0 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] text-center font-[family-name:var(--font-display)] text-2xl tabular-nums text-[var(--color-foreground)] outline-none focus-visible:border-[var(--color-accent)]"
        />
        <button
          type="button"
          disabled={disabled}
          aria-label={`Increase ${label}`}
          className="min-h-12 min-w-12 shrink-0 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-2xl font-medium text-[var(--color-foreground)] transition-colors hover:border-[var(--color-accent)] disabled:opacity-40"
          onClick={onIncrement}
        >
          +
        </button>
      </div>
      {display && display !== value ? (
        <p className="text-center text-xs text-[var(--color-subtle)]">{display}</p>
      ) : null}
    </div>
  );
}
