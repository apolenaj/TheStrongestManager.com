"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  startFreeProgramAction,
  type StartFreeProgramActionState,
} from "@/services/program-catalog/actions";
import { cn } from "@/design-system/utils/cn";

type FreeProgramOnboardingFormProps = {
  productSlug: string;
  productName: string;
  availableSchedules: string[];
  isAuthenticated: boolean;
  loginHref: string;
  weakestLift?: "squat" | "bench" | "deadlift" | "none";
};

const initialState: StartFreeProgramActionState = { ok: false };

export function FreeProgramOnboardingForm({
  productSlug,
  productName,
  availableSchedules,
  isAuthenticated,
  loginHref,
  weakestLift = "none",
}: FreeProgramOnboardingFormProps) {
  const [state, formAction, pending] = useActionState(
    startFreeProgramAction,
    initialState,
  );

  if (!isAuthenticated) {
    return (
      <div className="border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 sm:p-8">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
          Sign in to start free
        </h2>
        <p className="mt-3 text-sm text-[var(--color-muted)]">
          Create or log into your account to save schedule preferences, training
          maxes, and your first week for{" "}
          <span className="text-[var(--color-foreground)]">{productName}</span>.
        </p>
        <Link
          href={loginHref}
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-sm bg-[var(--color-accent)] px-5 text-sm font-bold uppercase tracking-[0.08em] text-[var(--color-accent-foreground)] transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
        >
          Log in to continue
        </Link>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="space-y-8 border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 sm:p-8"
    >
      <input type="hidden" name="productSlug" value={productSlug} />
      <input type="hidden" name="weakestLift" value={weakestLift} />

      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
          Free program setup
        </h2>
        <p className="mt-3 text-sm text-[var(--color-muted)]">
          We will generate week 1 from your schedule and optional 1RMs. Unrealistic
          maxes are rejected — no invented loads.
        </p>
      </div>

      <fieldset>
        <legend className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
          Schedule preference
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {availableSchedules.map((schedule, index) => (
            <label
              key={schedule}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 border border-[var(--color-border)] px-3 has-[:checked]:border-[var(--color-accent)] has-[:checked]:bg-[var(--color-accent-muted)]"
            >
              <input
                type="radio"
                name="scheduleVariant"
                value={schedule}
                defaultChecked={index === 0}
                required
                className="accent-[var(--color-accent)]"
              />
              <span className="text-sm text-[var(--color-foreground)]">
                {schedule.replace("day", " days / week")}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
          Units
        </legend>
        <div className="mt-3 flex gap-2">
          {(
            [
              { id: "kg", label: "Kilograms" },
              { id: "lb", label: "Pounds" },
            ] as const
          ).map((unit, index) => (
            <label
              key={unit.id}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 border border-[var(--color-border)] px-3 has-[:checked]:border-[var(--color-accent)] has-[:checked]:bg-[var(--color-accent-muted)]"
            >
              <input
                type="radio"
                name="unitSystem"
                value={unit.id}
                defaultChecked={index === 0}
                required
                className="accent-[var(--color-accent)]"
              />
              <span className="text-sm text-[var(--color-foreground)]">
                {unit.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
          Current 1RMs (optional)
        </legend>
        <p className="mt-2 text-xs text-[var(--color-subtle)]">
          Leave blank if unknown. Values must be realistic for the selected unit.
          Training maxes are set to ~90% of entered 1RMs.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {(
            [
              { name: "squat1rm", label: "Squat" },
              { name: "bench1rm", label: "Bench" },
              { name: "deadlift1rm", label: "Deadlift" },
            ] as const
          ).map((field) => (
            <label key={field.name} className="block text-sm">
              <span className="text-[var(--color-muted)]">{field.label}</span>
              <input
                type="number"
                name={field.name}
                inputMode="decimal"
                step="0.5"
                min="0"
                className="mt-2 w-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-[var(--color-foreground)] outline-none focus:border-[var(--color-accent)]"
              />
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block text-sm">
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
          Competition / test date (optional)
        </span>
        <input
          type="date"
          name="competitionDate"
          className="mt-2 w-full max-w-xs border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-[var(--color-foreground)] outline-none focus:border-[var(--color-accent)]"
        />
      </label>

      {state.error ? (
        <p
          role="alert"
          className="border border-[color-mix(in_srgb,var(--color-danger)_50%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_12%,transparent)] px-4 py-3 text-sm text-[var(--color-foreground)]"
        >
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className={cn(
          "inline-flex min-h-12 w-full items-center justify-center rounded-sm bg-[var(--color-accent)] px-5 text-sm font-bold uppercase tracking-[0.08em] text-[var(--color-accent-foreground)] transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)] sm:w-auto",
          pending && "opacity-60",
        )}
      >
        {pending ? "Generating week 1…" : "Generate week 1 & start"}
      </button>
    </form>
  );
}
