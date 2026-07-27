"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/design-system/utils/cn";
import {
  freeProductSlugForFamily,
  paidProductSlugForFamily,
  programFinderFamilyLabel,
  scoreProgramFinder,
  type ProgramFinderAnswers,
  PROGRAM_FINDER_DAYS,
  PROGRAM_FINDER_EXPERIENCE,
  PROGRAM_FINDER_GOALS,
  PROGRAM_FINDER_RECOVERY,
  PROGRAM_FINDER_WEAKEST,
} from "@/domain/program-finder/scoring";
import { getProgramFamilyContent } from "@/domain/program-catalog/content";

const STEPS = [
  "goal",
  "experience",
  "days",
  "weakest",
  "recovery",
  "result",
] as const;

type Step = (typeof STEPS)[number];

const GOAL_OPTIONS = [
  { id: "strength", label: "Build strength", hint: "General strength progress" },
  { id: "powerlifting", label: "Powerlifting", hint: "Squat, bench, deadlift focus" },
  { id: "hypertrophy", label: "Strength + muscle", hint: "Powerbuilding bias" },
  { id: "competition_prep", label: "Competition prep", hint: "Meet or test date ahead" },
  { id: "general_strength", label: "General fitness strength", hint: "Stay strong without meet pressure" },
] as const;

const EXP_OPTIONS = [
  { id: "beginner", label: "Beginner", hint: "Still building consistent basics" },
  { id: "intermediate", label: "Intermediate", hint: "Progress needs structure" },
  { id: "advanced", label: "Advanced", hint: "High training literacy" },
] as const;

const DAYS_OPTIONS = PROGRAM_FINDER_DAYS.map((d) => ({
  id: d,
  label: `${d} days / week`,
}));

const WEAK_OPTIONS = [
  { id: "squat", label: "Squat" },
  { id: "bench", label: "Bench" },
  { id: "deadlift", label: "Deadlift" },
  { id: "none", label: "No clear weak lift" },
] as const;

const RECOVERY_OPTIONS = [
  { id: "poor", label: "Poor", hint: "Sleep/stress currently limited" },
  { id: "okay", label: "Okay", hint: "Manageable most weeks" },
  { id: "good", label: "Good", hint: "You recover reliably" },
] as const;

function ChoiceGrid<T extends string>({
  legend,
  value,
  options,
  onChange,
}: {
  legend: string;
  value: T | null;
  options: readonly { id: T; label: string; hint?: string }[];
  onChange: (id: T) => void;
}) {
  return (
    <fieldset>
      <legend className="font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
        {legend}
      </legend>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const active = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.id)}
              className={cn(
                "min-h-14 border px-4 py-4 text-left transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]",
                active
                  ? "border-[var(--color-accent)] bg-[var(--color-accent-muted)]"
                  : "border-[var(--color-border)] bg-[var(--color-surface-elevated)] hover:border-[var(--color-border-strong)]",
              )}
            >
              <span className="block text-sm font-semibold text-[var(--color-foreground)]">
                {option.label}
              </span>
              {option.hint ? (
                <span className="mt-1 block text-xs text-[var(--color-muted)]">
                  {option.hint}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function ProgramFinderQuiz() {
  const [stepIndex, setStepIndex] = useState(0);
  const [goal, setGoal] = useState<ProgramFinderAnswers["goal"] | null>(null);
  const [experience, setExperience] = useState<
    ProgramFinderAnswers["experience"] | null
  >(null);
  const [days, setDays] = useState<ProgramFinderAnswers["days"] | null>(null);
  const [weakest, setWeakest] = useState<ProgramFinderAnswers["weakest"] | null>(
    null,
  );
  const [recovery, setRecovery] = useState<
    ProgramFinderAnswers["recovery"] | null
  >(null);

  const step: Step = STEPS[stepIndex] ?? "goal";
  const progress = Math.min(stepIndex + 1, 5);

  const result = useMemo(() => {
    if (!goal || !experience || !days || !weakest || !recovery) return null;
    return scoreProgramFinder({ goal, experience, days, weakest, recovery });
  }, [goal, experience, days, weakest, recovery]);

  function canAdvance(): boolean {
    if (step === "goal") return goal != null;
    if (step === "experience") return experience != null;
    if (step === "days") return days != null;
    if (step === "weakest") return weakest != null;
    if (step === "recovery") return recovery != null;
    return true;
  }

  function next() {
    if (step === "recovery" && canAdvance()) {
      setStepIndex(STEPS.indexOf("result"));
      return;
    }
    if (!canAdvance()) return;
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }

  function back() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  return (
    <div className="mx-auto max-w-3xl">
      {step !== "result" ? (
        <div className="mb-8">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
            Question {progress} of 5
          </p>
          <div
            className="mt-3 h-1 overflow-hidden bg-[var(--color-surface-elevated)]"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={1}
            aria-valuemax={5}
          >
            <div
              className="h-full bg-[var(--color-accent)] transition-[width] duration-300 ease-[var(--easing-standard)]"
              style={{ width: `${(progress / 5) * 100}%` }}
            />
          </div>
        </div>
      ) : null}

      {step === "goal" ? (
        <ChoiceGrid
          legend="What is your primary goal?"
          value={goal}
          options={GOAL_OPTIONS}
          onChange={(id) => {
            if ((PROGRAM_FINDER_GOALS as readonly string[]).includes(id)) {
              setGoal(id);
            }
          }}
        />
      ) : null}
      {step === "experience" ? (
        <ChoiceGrid
          legend="What is your experience level?"
          value={experience}
          options={EXP_OPTIONS}
          onChange={(id) => {
            if ((PROGRAM_FINDER_EXPERIENCE as readonly string[]).includes(id)) {
              setExperience(id);
            }
          }}
        />
      ) : null}
      {step === "days" ? (
        <ChoiceGrid
          legend="How many days can you train?"
          value={days}
          options={DAYS_OPTIONS}
          onChange={setDays}
        />
      ) : null}
      {step === "weakest" ? (
        <ChoiceGrid
          legend="What is your weakest lift?"
          value={weakest}
          options={WEAK_OPTIONS}
          onChange={(id) => {
            if ((PROGRAM_FINDER_WEAKEST as readonly string[]).includes(id)) {
              setWeakest(id);
            }
          }}
        />
      ) : null}
      {step === "recovery" ? (
        <ChoiceGrid
          legend="How is your recovery right now?"
          value={recovery}
          options={RECOVERY_OPTIONS}
          onChange={(id) => {
            if ((PROGRAM_FINDER_RECOVERY as readonly string[]).includes(id)) {
              setRecovery(id);
            }
          }}
        />
      ) : null}

      {step === "result" && result ? (
        <div className="space-y-10 animate-[fade-up_0.45s_var(--easing-standard)_both]">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
              Recommendation
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)] sm:text-4xl">
              {programFinderFamilyLabel(result.primary.familyId)}
            </h2>
            <p className="mt-3 text-sm text-[var(--color-muted)]">
              Score {result.primary.score} · Secondary:{" "}
              {programFinderFamilyLabel(result.secondary.familyId)} (score{" "}
              {result.secondary.score})
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[var(--color-muted)]">
              {getProgramFamilyContent(result.primary.familyId)?.tagline}
            </p>
            <p className="mt-4 border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-xs leading-relaxed text-[var(--color-subtle)]">
              {result.honesty}
            </p>
          </div>

          <section>
            <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
              Why this was recommended
            </h3>
            <ul className="mt-4 space-y-3">
              {result.primary.reasons.map((reason) => (
                <li
                  key={reason}
                  className="border-l-2 border-[var(--color-accent)] pl-4 text-sm leading-relaxed text-[var(--color-muted)]"
                >
                  {reason}
                </li>
              ))}
            </ul>
          </section>

          <section className="border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--color-foreground)]">
              Secondary option
            </h3>
            <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
              {programFinderFamilyLabel(result.secondary.familyId)}
            </p>
            <ul className="mt-3 space-y-2">
              {result.secondary.reasons.slice(0, 4).map((reason) => (
                <li key={reason} className="text-sm text-[var(--color-muted)]">
                  · {reason}
                </li>
              ))}
            </ul>
            <Link
              href={`/programs/${paidProductSlugForFamily(result.secondary.familyId)}`}
              className="mt-4 inline-flex text-sm font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
            >
              View secondary program
            </Link>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/programs/start/${freeProductSlugForFamily(result.primary.familyId)}${
                weakest && weakest !== "none" ? `?weakest=${weakest}` : ""
              }`}
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-sm bg-[var(--color-accent)] px-5 text-sm font-bold uppercase tracking-[0.08em] text-[var(--color-accent-foreground)] transition-colors duration-200 hover:bg-[var(--color-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
            >
              Start 4 weeks free
              <ArrowRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
            </Link>
            <Link
              href={`/programs/${paidProductSlugForFamily(result.primary.familyId)}`}
              className="inline-flex min-h-12 flex-1 items-center justify-center border border-[var(--color-border-strong)] px-5 text-sm font-bold uppercase tracking-[0.08em] text-[var(--color-foreground)] transition-colors duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
            >
              View full program
            </Link>
          </div>

          <button
            type="button"
            onClick={() => {
              setStepIndex(0);
              setGoal(null);
              setExperience(null);
              setDays(null);
              setWeakest(null);
              setRecovery(null);
            }}
            className="text-sm text-[var(--color-muted)] underline-offset-4 hover:text-[var(--color-foreground)] hover:underline"
          >
            Retake quiz
          </button>
        </div>
      ) : null}

      {step !== "result" ? (
        <div className="mt-10 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={back}
            disabled={stepIndex === 0}
            className="inline-flex min-h-11 items-center gap-2 px-3 text-sm text-[var(--color-muted)] transition-colors disabled:opacity-40 hover:text-[var(--color-foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            Back
          </button>
          <button
            type="button"
            onClick={next}
            disabled={!canAdvance()}
            className="inline-flex min-h-12 items-center gap-2 rounded-sm bg-[var(--color-accent)] px-5 text-sm font-bold uppercase tracking-[0.08em] text-[var(--color-accent-foreground)] transition-colors duration-200 hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
          >
            {step === "recovery" ? "See recommendation" : "Continue"}
            <ArrowRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  );
}
