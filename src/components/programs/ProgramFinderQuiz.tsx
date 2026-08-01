"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/design-system/utils/cn";
import {
  familyHasFreeTrial,
  freeProductSlugForFamily,
  paidProductSlugForFamily,
  scoreProgramFinder,
  type ProgramFinderAnswers,
  type ProgramFinderFamilyId,
  type ProgramFinderReason,
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
          const selected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={cn(
                "min-h-14 border px-4 py-3 text-left transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]",
                selected
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-foreground)]"
                  : "border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-foreground)]",
              )}
            >
              <span className="block text-sm font-semibold uppercase tracking-[0.06em]">
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
  const locale = useLocale();
  const t = useTranslations("ProgramsPage.finderQuiz");
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

  const goalOptions = PROGRAM_FINDER_GOALS.map((id) => ({
    id,
    label: t(`goals.${id}.label`),
    hint: t(`goals.${id}.hint`),
  }));

  const expOptions = PROGRAM_FINDER_EXPERIENCE.map((id) => ({
    id,
    label: t(`exp.${id}.label`),
    hint: t(`exp.${id}.hint`),
  }));

  const daysOptions = PROGRAM_FINDER_DAYS.map((d) => ({
    id: d,
    label: t("daysPerWeek", { days: d }),
  }));

  const weakOptions = PROGRAM_FINDER_WEAKEST.map((id) => ({
    id,
    label: t(`weak.${id}`),
  }));

  const recoveryOptions = PROGRAM_FINDER_RECOVERY.map((id) => ({
    id,
    label: t(`recovery.${id}.label`),
    hint: t(`recovery.${id}.hint`),
  }));

  function familyLabel(familyId: ProgramFinderFamilyId): string {
    return t(`families.${familyId}`);
  }

  function formatReason(reason: ProgramFinderReason): string {
    const liftLabel = reason.lift ? t(`weak.${reason.lift}`) : undefined;
    return t(`reasons.${reason.key}` as Parameters<typeof t>[0], {
      lift: liftLabel ?? "",
    });
  }

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
            {t("questionProgress", { current: progress, total: 5 })}
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
          legend={t("goalLegend")}
          value={goal}
          options={goalOptions}
          onChange={(id) => {
            if ((PROGRAM_FINDER_GOALS as readonly string[]).includes(id)) {
              setGoal(id);
            }
          }}
        />
      ) : null}
      {step === "experience" ? (
        <ChoiceGrid
          legend={t("experienceLegend")}
          value={experience}
          options={expOptions}
          onChange={(id) => {
            if ((PROGRAM_FINDER_EXPERIENCE as readonly string[]).includes(id)) {
              setExperience(id);
            }
          }}
        />
      ) : null}
      {step === "days" ? (
        <ChoiceGrid
          legend={t("daysLegend")}
          value={days}
          options={daysOptions}
          onChange={setDays}
        />
      ) : null}
      {step === "weakest" ? (
        <ChoiceGrid
          legend={t("weakestLegend")}
          value={weakest}
          options={weakOptions}
          onChange={(id) => {
            if ((PROGRAM_FINDER_WEAKEST as readonly string[]).includes(id)) {
              setWeakest(id);
            }
          }}
        />
      ) : null}
      {step === "recovery" ? (
        <ChoiceGrid
          legend={t("recoveryLegend")}
          value={recovery}
          options={recoveryOptions}
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
              {t("recommendation")}
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)] sm:text-4xl">
              {familyLabel(result.primary.familyId)}
            </h2>
            <p className="mt-3 text-sm text-[var(--color-muted)]">
              {t("scoreLine", {
                score: result.primary.score,
                secondary: familyLabel(result.secondary.familyId),
                secondaryScore: result.secondary.score,
              })}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[var(--color-muted)]">
              {
                getProgramFamilyContent(result.primary.familyId, locale)
                  ?.tagline
              }
            </p>
            <p className="mt-4 border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-xs leading-relaxed text-[var(--color-subtle)]">
              {t("honesty")}
            </p>
          </div>

          <section>
            <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
              {t("whyTitle")}
            </h3>
            <ul className="mt-4 space-y-3">
              {result.primary.reasons.map((reason) => (
                <li
                  key={`${reason.key}-${reason.lift ?? ""}`}
                  className="border-l-2 border-[var(--color-accent)] pl-4 text-sm leading-relaxed text-[var(--color-muted)]"
                >
                  {formatReason(reason)}
                </li>
              ))}
            </ul>
          </section>

          <section className="border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--color-foreground)]">
              {t("secondaryTitle")}
            </h3>
            <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
              {familyLabel(result.secondary.familyId)}
            </p>
            <ul className="mt-3 space-y-2">
              {result.secondary.reasons.slice(0, 4).map((reason) => (
                <li
                  key={`${reason.key}-${reason.lift ?? ""}-sec`}
                  className="text-sm text-[var(--color-muted)]"
                >
                  · {formatReason(reason)}
                </li>
              ))}
            </ul>
            <Link
              href={`/programs/${paidProductSlugForFamily(result.secondary.familyId)}`}
              className="mt-4 inline-flex text-sm font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
            >
              {t("viewSecondary")}
            </Link>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row">
            {familyHasFreeTrial(result.primary.familyId) &&
            freeProductSlugForFamily(result.primary.familyId) ? (
              <Link
                href={`/programs/start/${freeProductSlugForFamily(result.primary.familyId)}${
                  weakest && weakest !== "none" ? `?weakest=${weakest}` : ""
                }`}
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-sm bg-[var(--color-accent)] px-5 text-sm font-bold uppercase tracking-[0.08em] text-[var(--color-accent-foreground)] transition-colors duration-200 hover:bg-[var(--color-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
              >
                {t("startFree")}
                <ArrowRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
              </Link>
            ) : null}
            <Link
              href={`/programs/${paidProductSlugForFamily(result.primary.familyId)}`}
              className={cn(
                "inline-flex min-h-12 flex-1 items-center justify-center gap-2 px-5 text-sm font-bold uppercase tracking-[0.08em] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]",
                familyHasFreeTrial(result.primary.familyId)
                  ? "border border-[var(--color-border-strong)] text-[var(--color-foreground)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                  : "rounded-sm bg-[var(--color-accent)] text-[var(--color-accent-foreground)] hover:bg-[var(--color-accent-hover)]",
              )}
            >
              {t("viewFull")}
              {!familyHasFreeTrial(result.primary.familyId) ? (
                <ArrowRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
              ) : null}
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
            {t("retake")}
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
            {t("back")}
          </button>
          <button
            type="button"
            onClick={next}
            disabled={!canAdvance()}
            className="inline-flex min-h-12 items-center gap-2 rounded-sm bg-[var(--color-accent)] px-5 text-sm font-bold uppercase tracking-[0.08em] text-[var(--color-accent-foreground)] transition-colors duration-200 hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
          >
            {step === "recovery" ? t("seeRecommendation") : t("continue")}
            <ArrowRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  );
}
