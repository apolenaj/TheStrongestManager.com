"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Alert } from "@/design-system";
import {
  PREMIUM_COACHING_AVAILABILITY,
  PREMIUM_COACHING_AVAILABILITY_LABELS,
  PREMIUM_COACHING_BUDGET_LABELS,
  PREMIUM_COACHING_BUDGET_RANGES,
  PREMIUM_COACHING_EXPERIENCE_LABELS,
  PREMIUM_COACHING_EXPERIENCE_LEVELS,
  PREMIUM_COACHING_GOAL_LABELS,
  PREMIUM_COACHING_GOALS,
  PREMIUM_COACHING_HONESTY,
  PREMIUM_COACHING_NO_ACCEPTANCE_PROMISE,
} from "@/domain/premium-coaching-sales";
import { submitPremiumCoachingApplicationAction } from "@/services/premium-coaching-sales/actions";
import { cn } from "@/design-system/utils/cn";
import {
  buildPremiumCoachingSubmitFormData,
  COACHING_APPLICATION_STEPS,
  EMPTY_COACHING_APPLICATION,
  validateCoachingApplicationStep,
  type CoachingApplicationDraft,
  type CoachingApplicationFieldErrors,
  type CoachingApplicationStepId,
} from "@/components/premium-coaching-sales/coaching-application-boundary";

const inputClass =
  "min-h-12 w-full rounded-sm border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 text-base text-[var(--color-foreground)] placeholder:text-[var(--color-subtle)] transition-all duration-300 focus-visible:border-[var(--color-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]";

const selectClass = `${inputClass} appearance-none`;

const COACH_STATUS_OPTIONS = [
  { id: "none", label: "No coach currently" },
  { id: "previous", label: "Had a coach before" },
  { id: "current", label: "Currently coached" },
] as const;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-sm text-[var(--color-danger)]" role="alert">
      {message}
    </p>
  );
}

function FieldShell({
  id,
  label,
  optional,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
      >
        {label}
        {optional ? (
          <span className="ml-1 font-normal text-[var(--color-subtle)]">
            (optional)
          </span>
        ) : null}
      </label>
      {children}
      <FieldError message={error} />
    </div>
  );
}

function ProgressIndicator({
  step,
}: {
  step: CoachingApplicationStepId;
}) {
  return (
    <nav aria-label="Application progress" className="w-full">
      <ol className="grid grid-cols-5 gap-2">
        {COACHING_APPLICATION_STEPS.map((item) => {
          const complete = item.id < step;
          const current = item.id === step;
          return (
            <li key={item.id} className="min-w-0">
              <div
                className={cn(
                  "flex min-h-11 flex-col justify-center gap-2 border px-2 py-2 transition-all duration-300 sm:px-3",
                  current
                    ? "border-[var(--color-accent)] bg-[var(--color-accent-muted)]"
                    : complete
                      ? "border-[color-mix(in_srgb,var(--color-accent)_40%,transparent)] bg-[var(--color-surface-elevated)]"
                      : "border-[var(--color-border)] bg-[var(--color-surface)]",
                )}
              >
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em]",
                    current || complete
                      ? "text-[var(--color-accent)]"
                      : "text-[var(--color-subtle)]",
                  )}
                >
                  {complete ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                  ) : (
                    <span>0{item.id}</span>
                  )}
                  <span className="hidden truncate sm:inline">{item.label}</span>
                </span>
                <span
                  className={cn(
                    "h-1 w-full rounded-sm",
                    current || complete
                      ? "bg-[var(--color-accent)]"
                      : "bg-[var(--color-border)]",
                  )}
                />
              </div>
              <span className="mt-1 block text-center text-[0.65rem] text-[var(--color-subtle)] sm:hidden">
                {item.label}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-sm text-[var(--color-muted)]">
        Step {step} of {COACHING_APPLICATION_STEPS.length}
      </p>
    </nav>
  );
}

export function CoachingApplicationForm() {
  const router = useRouter();
  const [step, setStep] = useState<CoachingApplicationStepId>(1);
  const [draft, setDraft] = useState<CoachingApplicationDraft>(
    EMPTY_COACHING_APPLICATION,
  );
  const [errors, setErrors] = useState<CoachingApplicationFieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const summaryRows = useMemo(
    () => [
      ["Name", draft.name],
      ["Email", draft.email],
      ["Country", draft.country],
      ["Age", draft.age],
      ["Bodyweight", `${draft.bodyweightKg} kg`],
      ["Weight class", draft.weightClass],
      [
        "Experience",
        draft.experienceLevel
          ? PREMIUM_COACHING_EXPERIENCE_LABELS[draft.experienceLevel]
          : "—",
      ],
      [
        "S / B / D",
        `${draft.squatKg} / ${draft.benchKg} / ${draft.deadliftKg} kg`,
      ],
      [
        "Primary goal",
        draft.goal ? PREMIUM_COACHING_GOAL_LABELS[draft.goal] : "—",
      ],
      ["Competition date", draft.competitionDate || "Not set"],
      [
        "Availability",
        draft.availability
          ? PREMIUM_COACHING_AVAILABILITY_LABELS[draft.availability]
          : "—",
      ],
      ["Biggest problem", draft.biggestProblem],
      ["Injuries", draft.injuryNotes || "None noted"],
      ["Coach status", draft.currentCoachStatus || "—"],
      ["Expected support", draft.expectedSupport],
      [
        "Budget",
        draft.budgetRange
          ? PREMIUM_COACHING_BUDGET_LABELS[draft.budgetRange]
          : "—",
      ],
    ],
    [draft],
  );

  function update<K extends keyof CoachingApplicationDraft>(
    key: K,
    value: CoachingApplicationDraft[K],
  ) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function goNext() {
    const stepErrors = validateCoachingApplicationStep(step, draft);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;
    setStep((current) => Math.min(5, current + 1) as CoachingApplicationStepId);
  }

  function goBack() {
    setErrors({});
    setStep((current) => Math.max(1, current - 1) as CoachingApplicationStepId);
  }

  function handleSubmit() {
    const allErrors = {
      ...validateCoachingApplicationStep(1, draft),
      ...validateCoachingApplicationStep(2, draft),
      ...validateCoachingApplicationStep(3, draft),
      ...validateCoachingApplicationStep(4, draft),
    };
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setSubmitError("Fix the highlighted fields before submitting.");
      return;
    }

    const fd = buildPremiumCoachingSubmitFormData(draft);
    startTransition(async () => {
      const result = await submitPremiumCoachingApplicationAction(fd);
      if (!result.ok) {
        setSubmitError(result.error);
        return;
      }
      setSubmitError(null);
      router.push("/app/premium-coaching");
      router.refresh();
    });
  }

  return (
    <div className="grid gap-8">
      <Alert tone="warning" title="Before you apply">
        {PREMIUM_COACHING_NO_ACCEPTANCE_PROMISE} {PREMIUM_COACHING_HONESTY[1]}
      </Alert>

      <ProgressIndicator step={step} />

      {submitError ? (
        <Alert tone="danger" title="Could not submit">
          {submitError}
        </Alert>
      ) : null}

      <div className="border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5 sm:p-8">
        {step === 1 ? (
          <fieldset className="grid gap-5">
            <legend className="font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-[0.04em] text-[var(--color-foreground)]">
              Profile
            </legend>
            <FieldShell id="name" label="Full name" error={errors.name}>
              <input
                id="name"
                className={inputClass}
                autoComplete="name"
                value={draft.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </FieldShell>
            <FieldShell id="email" label="Email" error={errors.email}>
              <input
                id="email"
                type="email"
                className={inputClass}
                autoComplete="email"
                value={draft.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </FieldShell>
            <div className="grid gap-5 sm:grid-cols-2">
              <FieldShell id="country" label="Country" error={errors.country}>
                <input
                  id="country"
                  className={inputClass}
                  autoComplete="country-name"
                  value={draft.country}
                  onChange={(e) => update("country", e.target.value)}
                />
              </FieldShell>
              <FieldShell id="age" label="Age" error={errors.age}>
                <input
                  id="age"
                  inputMode="numeric"
                  className={inputClass}
                  value={draft.age}
                  onChange={(e) => update("age", e.target.value)}
                />
              </FieldShell>
            </div>
          </fieldset>
        ) : null}

        {step === 2 ? (
          <fieldset className="grid gap-5">
            <legend className="font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-[0.04em] text-[var(--color-foreground)]">
              Bodyweight & lifts
            </legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <FieldShell
                id="bodyweightKg"
                label="Bodyweight (kg)"
                error={errors.bodyweightKg}
              >
                <input
                  id="bodyweightKg"
                  inputMode="decimal"
                  className={inputClass}
                  value={draft.bodyweightKg}
                  onChange={(e) => update("bodyweightKg", e.target.value)}
                />
              </FieldShell>
              <FieldShell
                id="weightClass"
                label="Weight class"
                error={errors.weightClass}
              >
                <input
                  id="weightClass"
                  className={inputClass}
                  placeholder="e.g. 83 kg"
                  value={draft.weightClass}
                  onChange={(e) => update("weightClass", e.target.value)}
                />
              </FieldShell>
            </div>
            <FieldShell
              id="experienceLevel"
              label="Experience"
              error={errors.experienceLevel}
            >
              <select
                id="experienceLevel"
                className={selectClass}
                value={draft.experienceLevel}
                onChange={(e) =>
                  update(
                    "experienceLevel",
                    e.target.value as CoachingApplicationDraft["experienceLevel"],
                  )
                }
              >
                <option value="">Select experience</option>
                {PREMIUM_COACHING_EXPERIENCE_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {PREMIUM_COACHING_EXPERIENCE_LABELS[level]}
                  </option>
                ))}
              </select>
            </FieldShell>
            <div className="grid gap-5 sm:grid-cols-3">
              <FieldShell id="squatKg" label="Squat (kg)" error={errors.squatKg}>
                <input
                  id="squatKg"
                  inputMode="decimal"
                  className={inputClass}
                  value={draft.squatKg}
                  onChange={(e) => update("squatKg", e.target.value)}
                />
              </FieldShell>
              <FieldShell id="benchKg" label="Bench (kg)" error={errors.benchKg}>
                <input
                  id="benchKg"
                  inputMode="decimal"
                  className={inputClass}
                  value={draft.benchKg}
                  onChange={(e) => update("benchKg", e.target.value)}
                />
              </FieldShell>
              <FieldShell
                id="deadliftKg"
                label="Deadlift (kg)"
                error={errors.deadliftKg}
              >
                <input
                  id="deadliftKg"
                  inputMode="decimal"
                  className={inputClass}
                  value={draft.deadliftKg}
                  onChange={(e) => update("deadliftKg", e.target.value)}
                />
              </FieldShell>
            </div>
            <p className="text-xs text-[var(--color-subtle)]">
              Enter current best working or competition lifts — athlete-reported,
              not verified.
            </p>
          </fieldset>
        ) : null}

        {step === 3 ? (
          <fieldset className="grid gap-5">
            <legend className="font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-[0.04em] text-[var(--color-foreground)]">
              Goals & schedule
            </legend>
            <FieldShell id="goal" label="Primary goal" error={errors.goal}>
              <select
                id="goal"
                className={selectClass}
                value={draft.goal}
                onChange={(e) =>
                  update("goal", e.target.value as CoachingApplicationDraft["goal"])
                }
              >
                <option value="">Select a goal</option>
                {PREMIUM_COACHING_GOALS.map((goal) => (
                  <option key={goal} value={goal}>
                    {PREMIUM_COACHING_GOAL_LABELS[goal]}
                  </option>
                ))}
              </select>
            </FieldShell>
            <FieldShell
              id="competitionDate"
              label="Competition date"
              optional
              error={errors.competitionDate}
            >
              <input
                id="competitionDate"
                type="date"
                className={inputClass}
                value={draft.competitionDate}
                onChange={(e) => update("competitionDate", e.target.value)}
              />
            </FieldShell>
            <FieldShell
              id="availability"
              label="Training availability"
              error={errors.availability}
            >
              <select
                id="availability"
                className={selectClass}
                value={draft.availability}
                onChange={(e) =>
                  update(
                    "availability",
                    e.target.value as CoachingApplicationDraft["availability"],
                  )
                }
              >
                <option value="">Select availability</option>
                {PREMIUM_COACHING_AVAILABILITY.map((item) => (
                  <option key={item} value={item}>
                    {PREMIUM_COACHING_AVAILABILITY_LABELS[item]}
                  </option>
                ))}
              </select>
            </FieldShell>
            <FieldShell
              id="biggestProblem"
              label="Biggest problem right now"
              error={errors.biggestProblem}
            >
              <textarea
                id="biggestProblem"
                rows={4}
                maxLength={500}
                className={cn(inputClass, "min-h-[7rem] py-3")}
                value={draft.biggestProblem}
                onChange={(e) => update("biggestProblem", e.target.value)}
                placeholder="e.g. missed reps under fatigue, peaking confusion, technique stalls…"
              />
            </FieldShell>
          </fieldset>
        ) : null}

        {step === 4 ? (
          <fieldset className="grid gap-5">
            <legend className="font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-[0.04em] text-[var(--color-foreground)]">
              Support context
            </legend>
            <FieldShell
              id="injuryNotes"
              label="Injury considerations"
              optional
              error={errors.injuryNotes}
            >
              <textarea
                id="injuryNotes"
                rows={3}
                maxLength={500}
                className={cn(inputClass, "min-h-[6rem] py-3")}
                value={draft.injuryNotes}
                onChange={(e) => update("injuryNotes", e.target.value)}
                placeholder="Training-relevant context only — not a medical record."
              />
            </FieldShell>
            <FieldShell
              id="currentCoachStatus"
              label="Current coach status"
              error={errors.currentCoachStatus}
            >
              <div className="grid gap-2 sm:grid-cols-3">
                {COACH_STATUS_OPTIONS.map((option) => {
                  const selected = draft.currentCoachStatus === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => update("currentCoachStatus", option.id)}
                      className={cn(
                        "min-h-12 rounded-sm border px-3 text-sm font-medium transition-all duration-300",
                        selected
                          ? "border-[var(--color-accent)] bg-[var(--color-accent-muted)] text-[var(--color-foreground)]"
                          : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-foreground)]",
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </FieldShell>
            <FieldShell
              id="expectedSupport"
              label="Expected support"
              error={errors.expectedSupport}
            >
              <textarea
                id="expectedSupport"
                rows={3}
                maxLength={500}
                className={cn(inputClass, "min-h-[6rem] py-3")}
                value={draft.expectedSupport}
                onChange={(e) => update("expectedSupport", e.target.value)}
                placeholder="Weekly programming, technique review, meet prep check-ins…"
              />
            </FieldShell>
            <FieldShell
              id="budgetRange"
              label="Budget range"
              error={errors.budgetRange}
            >
              <select
                id="budgetRange"
                className={selectClass}
                value={draft.budgetRange}
                onChange={(e) =>
                  update(
                    "budgetRange",
                    e.target.value as CoachingApplicationDraft["budgetRange"],
                  )
                }
              >
                <option value="">Select a budget range</option>
                {PREMIUM_COACHING_BUDGET_RANGES.map((range) => (
                  <option key={range} value={range}>
                    {PREMIUM_COACHING_BUDGET_LABELS[range]}
                  </option>
                ))}
              </select>
            </FieldShell>
          </fieldset>
        ) : null}

        {step === 5 ? (
          <div className="grid gap-6">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-[0.04em] text-[var(--color-foreground)]">
              Review & submit
            </h2>
            <p className="text-sm leading-relaxed text-[var(--color-muted)]">
              Confirm your details. Submission starts review only — it does not
              promise acceptance, a coach match, or a coaching spot.
            </p>
            <dl className="grid gap-3 border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5">
              {summaryRows.map(([label, value]) => (
                <div
                  key={label}
                  className="grid gap-1 border-b border-[var(--color-border)] pb-3 last:border-b-0 last:pb-0 sm:grid-cols-[10rem_1fr] sm:gap-4"
                >
                  <dt className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-subtle)]">
                    {label}
                  </dt>
                  <dd className="text-sm text-[var(--color-foreground)]">
                    {value || "—"}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[var(--color-border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 1 || pending}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm border border-[var(--color-border)] px-5 text-sm font-semibold text-[var(--color-foreground)] transition-all duration-300 hover:border-[var(--color-border-strong)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
            Back
          </button>

          {step < 5 ? (
            <button
              type="button"
              onClick={goNext}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-[var(--color-accent)] px-6 text-sm font-bold uppercase tracking-[0.08em] text-[var(--color-accent-foreground)] transition-all duration-300 hover:bg-[var(--color-accent-hover)]"
            >
              Continue
              <ArrowRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={pending}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-[var(--color-accent)] px-6 text-sm font-bold uppercase tracking-[0.08em] text-[var(--color-accent-foreground)] transition-all duration-300 hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? "Submitting…" : "Submit application"}
              <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Backward-compatible export for existing imports. */
export function PremiumCoachingApplyForm() {
  return <CoachingApplicationForm />;
}
