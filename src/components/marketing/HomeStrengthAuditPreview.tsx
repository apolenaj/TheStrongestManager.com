"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Mail } from "lucide-react";
import { cn } from "@/design-system/utils/cn";
import { STRENGTH_AUDIT_HREF } from "@/components/layout/site-nav";

const PRIMARY_GOALS = [
  { id: "strength", label: "Build strength" },
  { id: "technique", label: "Fix technique" },
  { id: "meet", label: "Prepare for a meet" },
  { id: "consistency", label: "Train more consistently" },
] as const;

const TRAINING_DAYS = [
  { id: "3", label: "3 days" },
  { id: "4", label: "4 days" },
  { id: "5", label: "5 days" },
  { id: "6", label: "6 days" },
] as const;

const WEAK_LIFTS = [
  { id: "squat", label: "Squat" },
  { id: "bench", label: "Bench press" },
  { id: "deadlift", label: "Deadlift" },
  { id: "overhead", label: "Overhead / accessory" },
] as const;

type GoalId = (typeof PRIMARY_GOALS)[number]["id"];
type DaysId = (typeof TRAINING_DAYS)[number]["id"];
type LiftId = (typeof WEAK_LIFTS)[number]["id"];

type PreviewResult = {
  title: string;
  summary: string;
  nextSteps: readonly string[];
  productHref: string;
  productLabel: string;
};

function buildPreviewResult(
  goal: GoalId,
  days: DaysId,
  weak: LiftId,
): PreviewResult {
  const dayCount = Number(days);
  const frequencyNote =
    dayCount <= 3
      ? "Protect recovery with full-body or upper/lower density — do not invent a sixth session."
      : dayCount >= 6
        ? "High frequency only works if intensity is managed — prioritize quality over junk volume."
        : "A 4–5 day structure gives room for a weak-lift emphasis without drowning recovery.";

  const liftFocus: Record<LiftId, string> = {
    squat: "Prioritize squat variation quality and depth standards before chasing load.",
    bench:
      "Emphasize pressing volume distribution and technique checkpoints — not max attempts.",
    deadlift:
      "Bias deadlift practice with controlled fatigue and clear lockout standards.",
    overhead:
      "Treat overhead/accessories as support work — they should not steal from the big three.",
  };

  if (goal === "technique") {
    return {
      title: "YOUR BEST STARTING POINT",
      summary:
        "Start with a technique check on your weak lift, then layer programming once movement quality is labeled.",
      nextSteps: [
        liftFocus[weak],
        "Use observed vs estimated labels — never treat estimates as medical certainty.",
        frequencyNote,
      ],
      productHref: "/technique-check",
      productLabel: "Open technique check",
    };
  }

  if (goal === "meet") {
    return {
      title: "YOUR BEST STARTING POINT",
      summary:
        "Anchor the next block to a meet timeline, then audit your current program before peaking.",
      nextSteps: [
        "Map peaking to a real competition date — not a vibes-based taper.",
        liftFocus[weak],
        frequencyNote,
      ],
      productHref: "/goals/powerlifting-program",
      productLabel: "Open competition prep",
    };
  }

  if (goal === "consistency") {
    return {
      title: "YOUR BEST STARTING POINT",
      summary:
        "Reduce friction first: a realistic weekly schedule beats an ambitious plan you skip.",
      nextSteps: [
        `Commit to ${days} training days you can protect for 8 weeks.`,
        liftFocus[weak],
        "Log sessions before changing the program — decisions need data.",
      ],
      productHref: "/athlete-assessment",
      productLabel: "Start athlete assessment",
    };
  }

  return {
    title: "YOUR BEST STARTING POINT",
    summary:
      "Run a free strength audit on your current block, then emphasize the weak lift inside a sustainable weekly structure.",
    nextSteps: [
      liftFocus[weak],
      frequencyNote,
      "Audit volume and intensity from the work you already planned — we do not invent PRs.",
    ],
    productHref: STRENGTH_AUDIT_HREF,
    productLabel: "Run full strength audit",
  };
}

function OptionGrid<T extends string>({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: readonly { id: T; label: string }[];
  value: T | null;
  onChange: (id: T) => void;
}) {
  return (
    <fieldset>
      <legend className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-[var(--color-subtle)]">
        {legend}
      </legend>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {options.map((option) => {
          const selected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={cn(
                "min-h-11 rounded-sm border px-3 py-2.5 text-sm font-medium transition-all duration-300",
                selected
                  ? "border-[var(--color-accent)] bg-[var(--color-accent-muted)] text-[var(--color-foreground)]"
                  : "border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-foreground)]",
              )}
              aria-pressed={selected}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function HomeStrengthAuditPreview() {
  const [goal, setGoal] = useState<GoalId | null>(null);
  const [days, setDays] = useState<DaysId | null>(null);
  const [weak, setWeak] = useState<LiftId | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSaved, setEmailSaved] = useState(false);

  const canGenerate = Boolean(goal && days && weak);

  const result = useMemo(() => {
    if (!goal || !days || !weak || !showResult) return null;
    return buildPreviewResult(goal, days, weak);
  }, [goal, days, weak, showResult]);

  function handleGenerate() {
    if (!canGenerate) return;
    setShowResult(true);
    setEmailSaved(false);
  }

  function handleEmailSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim() || !email.includes("@")) return;
    // Preview-only capture — no invented CRM integration.
    setEmailSaved(true);
  }

  return (
    <section
      id="strength-audit-preview"
      aria-labelledby="home-audit-preview-heading"
      className="relative border-b border-[var(--color-border)] bg-[var(--color-background)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,rgba(183,255,42,0.07),transparent_45%)]"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="max-w-2xl">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
            Free strength audit preview
          </p>
          <h2
            id="home-audit-preview-heading"
            className="mt-4 font-[family-name:var(--font-display)] text-[clamp(1.85rem,3.8vw,3rem)] font-semibold uppercase leading-[1.08] tracking-[0.02em] text-[var(--color-foreground)]"
          >
            Get a starting point in under a minute
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--color-muted)]">
            Answer three questions. See a recommended starting path immediately —
            no account required. Email is optional and only asked after the
            result.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-12">
          <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8 lg:col-span-7">
            <div className="space-y-8">
              <OptionGrid
                legend="Primary goal"
                options={PRIMARY_GOALS}
                value={goal}
                onChange={(id) => {
                  setGoal(id);
                  setShowResult(false);
                  setEmailSaved(false);
                }}
              />
              <OptionGrid
                legend="Training days per week"
                options={TRAINING_DAYS}
                value={days}
                onChange={(id) => {
                  setDays(id);
                  setShowResult(false);
                  setEmailSaved(false);
                }}
              />
              <OptionGrid
                legend="Weak lift"
                options={WEAK_LIFTS}
                value={weak}
                onChange={(id) => {
                  setWeak(id);
                  setShowResult(false);
                  setEmailSaved(false);
                }}
              />
            </div>

            <button
              type="button"
              disabled={!canGenerate}
              onClick={handleGenerate}
              className="mt-10 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-sm bg-[var(--color-accent)] px-6 text-sm font-bold uppercase tracking-[0.08em] text-[var(--color-accent-foreground)] transition-all duration-300 hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
            >
              Show my starting point
              <ArrowRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
            </button>
          </div>

          <div className="border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 sm:p-8 lg:col-span-5">
            {!result ? (
              <div className="flex h-full min-h-[18rem] flex-col justify-center">
                <p className="font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-[0.04em] text-[var(--color-foreground)]">
                  Result preview
                </p>
                <p className="mt-4 text-sm leading-relaxed text-[var(--color-muted)]">
                  Select a goal, weekly frequency, and weak lift. Your starting
                  recommendation appears here first — signup is never the gate.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
                  Preview · not a diagnosis
                </p>
                <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-[0.04em] text-[var(--color-foreground)]">
                  {result.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-[var(--color-muted)]">
                  {result.summary}
                </p>
                <ul className="mt-6 space-y-3">
                  {result.nextSteps.map((step) => (
                    <li
                      key={step}
                      className="flex gap-3 text-sm leading-relaxed text-[var(--color-foreground)]"
                    >
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={result.productHref}
                  className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--color-accent)] transition-colors duration-300 hover:text-[var(--color-accent-hover)]"
                >
                  {result.productLabel}
                  <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
                </Link>

                <div className="mt-8 border-t border-[var(--color-border)] pt-6">
                  {emailSaved ? (
                    <p className="flex items-start gap-2 text-sm text-[var(--color-muted)]">
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                      Saved locally in this preview. Full audit delivery wiring
                      ships with the live capture path — we do not pretend it
                      emailed yet.
                    </p>
                  ) : (
                    <form onSubmit={handleEmailSubmit} className="space-y-3">
                      <label
                        htmlFor="audit-preview-email"
                        className="block text-[0.7rem] font-medium uppercase tracking-[0.18em] text-[var(--color-subtle)]"
                      >
                        Optional — send me the full audit checklist
                      </label>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <div className="relative flex-1">
                          <Mail
                            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-subtle)]"
                            strokeWidth={1.5}
                            aria-hidden
                          />
                          <input
                            id="audit-preview-email"
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="you@example.com"
                            className="min-h-11 w-full rounded-sm border border-[var(--color-border)] bg-[var(--color-background)] py-2 pl-10 pr-3 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-subtle)] transition-colors focus-visible:border-[var(--color-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
                          />
                        </div>
                        <button
                          type="submit"
                          className="inline-flex min-h-11 items-center justify-center rounded-sm border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-foreground)] transition-all duration-300 hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-muted)]"
                        >
                          Save email
                        </button>
                      </div>
                      <p className="text-xs leading-relaxed text-[var(--color-subtle)]">
                        Shown only after your result. No fake lead sync — this
                        preview stores the address in-session for UX testing.
                      </p>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
