"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Workflow } from "lucide-react";
import { cn } from "@/design-system/utils/cn";

const EXPERIENCE = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
] as const;

const MEET = [
  { id: "yes", label: "Meet on calendar" },
  { id: "no", label: "No meet date" },
] as const;

const PREFERENCE = [
  { id: "simple", label: "Simple progression" },
  { id: "variety", label: "High variety" },
  { id: "blocks", label: "Focused blocks" },
] as const;

type ExpId = (typeof EXPERIENCE)[number]["id"];
type MeetId = (typeof MEET)[number]["id"];
type PrefId = (typeof PREFERENCE)[number]["id"];

type MethodRec = {
  slug: string;
  name: string;
  why: string;
};

function recommendMethod(
  experience: ExpId,
  meet: MeetId,
  preference: PrefId,
): MethodRec {
  if (preference === "variety" || (experience === "advanced" && preference !== "simple")) {
    return {
      slug: "conjugate",
      name: "Conjugate method",
      why: "High variation and rotating max / dynamic emphasis fit advanced lifters who tolerate complexity.",
    };
  }

  if (preference === "blocks" || (meet === "yes" && experience !== "beginner")) {
    return {
      slug: "block-periodization",
      name: "Block periodization",
      why: "Concentrated blocks suit meet prep windows and athletes who need clear phase emphasis.",
    };
  }

  if (meet === "yes") {
    return {
      slug: "linear-periodization",
      name: "Linear periodization",
      why: "A classic volume-to-intensity path toward a date — useful when you want an understandable peak story.",
    };
  }

  if (experience === "beginner" || preference === "simple") {
    return {
      slug: "linear-periodization",
      name: "Linear periodization",
      why: "Beginners and simple progressors benefit from clear phase themes before adding undulation complexity.",
    };
  }

  return {
    slug: "daily-undulating-periodization",
    name: "Daily undulating periodization",
    why: "Undulating intensity across the week supports intermediates without a hard meet peak.",
  };
}

function ChoiceRow<T extends string>({
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
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.id)}
              className={cn(
                "min-h-11 rounded-sm border px-4 text-sm font-medium transition-all duration-300",
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
    </fieldset>
  );
}

export function HomeMethodFinder() {
  const [experience, setExperience] = useState<ExpId | null>(null);
  const [meet, setMeet] = useState<MeetId | null>(null);
  const [preference, setPreference] = useState<PrefId | null>(null);

  const ready = Boolean(experience && meet && preference);
  const recommendation = useMemo(() => {
    if (!experience || !meet || !preference) return null;
    return recommendMethod(experience, meet, preference);
  }, [experience, meet, preference]);

  return (
    <section
      id="method-finder"
      aria-labelledby="home-method-finder-heading"
      className="relative border-b border-[var(--color-border)] bg-[var(--color-background)]"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5">
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
              Training method finder
            </p>
            <h2
              id="home-method-finder-heading"
              className="mt-4 font-[family-name:var(--font-display)] text-[clamp(1.85rem,3.8vw,3rem)] font-semibold uppercase leading-[1.08] tracking-[0.02em] text-[var(--color-foreground)]"
            >
              Find a method that matches your constraints
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[var(--color-muted)]">
              A quick coaching heuristic — not a scientific ranking. Read the
              method page for limitations and honesty notes before you adopt it.
            </p>
          </div>

          <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8 lg:col-span-7">
            <div className="space-y-7">
              <ChoiceRow
                legend="Experience"
                options={EXPERIENCE}
                value={experience}
                onChange={setExperience}
              />
              <ChoiceRow
                legend="Competition timing"
                options={MEET}
                value={meet}
                onChange={setMeet}
              />
              <ChoiceRow
                legend="Training preference"
                options={PREFERENCE}
                value={preference}
                onChange={setPreference}
              />
            </div>

            <div className="mt-8 border-t border-[var(--color-border)] pt-6">
              {!ready || !recommendation ? (
                <p className="text-sm text-[var(--color-muted)]">
                  Answer all three prompts to see a recommended starting method.
                </p>
              ) : (
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--color-border)] text-[var(--color-accent)]">
                    <Workflow className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                  </span>
                  <div>
                    <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[var(--color-subtle)]">
                      Recommended starting point
                    </p>
                    <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
                      {recommendation.name}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
                      {recommendation.why}
                    </p>
                    <Link
                      href={`/methods/${recommendation.slug}`}
                      className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--color-accent)] transition-colors duration-200 hover:text-[var(--color-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
                    >
                      Open method page
                      <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
