"use client";

import { useMemo, useState, useEffect, type CSSProperties } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { cn } from "@/design-system/utils/cn";
import type { PublicProgramProduct } from "@/domain/program-catalog";
import { getProgramFamilyContent } from "@/domain/program-catalog/content";
import { ProgramCard, type ProgramCardModel } from "@/components/programs/ProgramCard";

const PRICE_FILTERS = [
  { id: "all", label: "All" },
  { id: "free", label: "Free" },
  { id: "paid", label: "Paid" },
] as const;

const GOAL_FILTERS = [
  { id: "all", label: "All goals" },
  { id: "strength", label: "Strength" },
  { id: "powerlifting", label: "Powerlifting" },
  { id: "hypertrophy", label: "Hypertrophy" },
  { id: "competition_prep", label: "Competition prep" },
  { id: "general_strength", label: "General strength" },
] as const;

const METHOD_FILTERS = [
  { id: "all", label: "All methods" },
  { id: "linear-periodization", label: "Linear" },
  { id: "daily-undulating-periodization", label: "DUP" },
  { id: "block-periodization", label: "Block" },
  { id: "conjugate", label: "Conjugate" },
  { id: "high-frequency-training", label: "High frequency" },
  { id: "bundle", label: "Bundle" },
] as const;

const DAYS_FILTERS = [
  { id: "all", label: "Any days" },
  { id: "3day", label: "3 days" },
  { id: "4day", label: "4 days" },
  { id: "5day", label: "5 days" },
  { id: "6day", label: "6 days" },
] as const;

type PriceId = (typeof PRICE_FILTERS)[number]["id"];
type GoalId = (typeof GOAL_FILTERS)[number]["id"];
type MethodId = (typeof METHOD_FILTERS)[number]["id"];
type DaysId = (typeof DAYS_FILTERS)[number]["id"];

function buildFamilyCards(programs: PublicProgramProduct[]): ProgramCardModel[] {
  const byFamily = new Map<string, PublicProgramProduct[]>();
  for (const program of programs) {
    const familyId = program.familyId ?? program.slug;
    const list = byFamily.get(familyId) ?? [];
    list.push(program);
    byFamily.set(familyId, list);
  }

  const cards: ProgramCardModel[] = [];
  for (const [familyId, items] of byFamily) {
    const paid =
      items.find((p) => p.variant === "paid" || p.variant === "bundle") ??
      items.find((p) => !p.isFree) ??
      null;
    const free = items.find((p) => p.isFree || p.variant === "free") ?? null;
    const primary = paid ?? free;
    if (!primary) continue;
    const content = getProgramFamilyContent(familyId);
    cards.push({
      familyId,
      name: content?.displayName ?? primary.name.replace(/ \(Free 4-Week\)$/i, ""),
      description: content?.tagline ?? primary.description,
      methodId: primary.methodId,
      difficulty: primary.difficulty,
      recoveryDemand: primary.recoveryDemand,
      availableSchedules: primary.availableSchedules,
      paid,
      free: free && free.slug !== paid?.slug ? free : null,
    });
  }

  return cards.sort((a, b) => {
    if (a.familyId === "complete-method-collection") return 1;
    if (b.familyId === "complete-method-collection") return -1;
    return a.name.localeCompare(b.name);
  });
}

function FilterChipGroup<T extends string>({
  legend,
  value,
  options,
  onChange,
}: {
  legend: string;
  value: T;
  options: readonly { id: T; label: string }[];
  onChange: (next: T) => void;
}) {
  return (
    <fieldset>
      <legend className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
        {legend}
      </legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const active = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.id)}
              className={cn(
                "min-h-10 border px-3 text-xs font-medium tracking-wide transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]",
                active
                  ? "border-[var(--color-accent)] bg-[var(--color-accent-muted)] text-[var(--color-accent)]"
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

const FINDER_GOALS = [
  { id: "strength", label: "General strength" },
  { id: "powerlifting", label: "Powerlifting" },
  { id: "hypertrophy", label: "Strength + muscle" },
  { id: "competition_prep", label: "Meet prep" },
] as const;

const FINDER_EXP = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
] as const;

const FINDER_DAYS = [
  { id: "3day", label: "3 days" },
  { id: "4day", label: "4 days" },
  { id: "5day", label: "5+ days" },
] as const;

function recommendFamily(input: {
  goal: string;
  experience: string;
  days: string;
}): string {
  if (input.experience === "advanced" && input.goal === "powerlifting") {
    return input.days === "4day" ? "conjugate-strength-system" : "high-frequency-sbd";
  }
  if (input.goal === "hypertrophy") return "powerbuilding-hybrid";
  if (input.goal === "competition_prep") {
    return input.experience === "beginner"
      ? "linear-strength-builder"
      : "block-periodisation";
  }
  if (input.goal === "powerlifting") {
    return input.experience === "beginner"
      ? "linear-strength-builder"
      : "dup-powerlifting-system";
  }
  return input.experience === "beginner"
    ? "linear-strength-builder"
    : "dup-powerlifting-system";
}

function FindMyProgram({ cards }: { cards: ProgramCardModel[] }) {
  const [goal, setGoal] = useState<(typeof FINDER_GOALS)[number]["id"]>("strength");
  const [experience, setExperience] =
    useState<(typeof FINDER_EXP)[number]["id"]>("intermediate");
  const [days, setDays] = useState<(typeof FINDER_DAYS)[number]["id"]>("4day");

  const recommendation = useMemo(() => {
    const familyId = recommendFamily({ goal, experience, days });
    return cards.find((c) => c.familyId === familyId) ?? cards[0] ?? null;
  }, [goal, experience, days, cards]);

  return (
    <section
      id="find-my-program"
      className="scroll-mt-28 border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8"
    >
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
        Find my program
      </p>
      <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
        Match a system to your constraints
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-muted)]">
        A recommendation based on goal, experience, and days available — not a
        guarantee, and not a countdown offer.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <FilterChipGroup
          legend="Goal"
          value={goal}
          options={FINDER_GOALS}
          onChange={setGoal}
        />
        <FilterChipGroup
          legend="Experience"
          value={experience}
          options={FINDER_EXP}
          onChange={setExperience}
        />
        <FilterChipGroup
          legend="Days per week"
          value={days}
          options={FINDER_DAYS}
          onChange={setDays}
        />
      </div>

      {recommendation ? (
        <div className="mt-8 flex flex-col gap-4 border-t border-[var(--color-border)] pt-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.16em] text-[var(--color-muted)]">
              Recommended
            </p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
              {recommendation.name}
            </p>
            <p className="mt-2 max-w-xl text-sm text-[var(--color-muted)]">
              {recommendation.description}
            </p>
          </div>
          <Link
            href="/programs/find-my-program"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-[var(--color-accent)] px-5 text-sm font-bold uppercase tracking-[0.08em] text-[var(--color-accent-foreground)] transition-colors duration-200 hover:bg-[var(--color-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
          >
            Open full finder quiz
            <ArrowRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
          </Link>
        </div>
      ) : null}
    </section>
  );
}

type ProgramsCatalogExperienceProps = {
  programs: PublicProgramProduct[];
};

export function ProgramsCatalogExperience({
  programs,
}: ProgramsCatalogExperienceProps) {
  const searchParams = useSearchParams();
  const allCards = useMemo(() => buildFamilyCards(programs), [programs]);

  const goalFromUrl = searchParams.get("goal");
  const initialGoalId = (
    GOAL_FILTERS.some((g) => g.id === goalFromUrl) ? goalFromUrl : "all"
  ) as GoalId;

  const [price, setPrice] = useState<PriceId>("all");
  const [goal, setGoal] = useState<GoalId>(initialGoalId);
  const [method, setMethod] = useState<MethodId>("all");
  const [days, setDays] = useState<DaysId>("all");

  useEffect(() => {
    setGoal(initialGoalId);
  }, [initialGoalId]);

  const filtered = useMemo(() => {
    return allCards.filter((card) => {
      if (price === "free" && !card.free) return false;
      if (price === "paid" && !card.paid) return false;

      if (goal !== "all") {
        const goals = [
          ...(card.paid?.goals ?? []),
          ...(card.free?.goals ?? []),
        ];
        if (!goals.includes(goal)) return false;
      }

      if (method !== "all") {
        if (method === "bundle") {
          if (card.familyId !== "complete-method-collection") return false;
        } else if (card.methodId !== method) {
          return false;
        }
      }

      if (days !== "all") {
        if (!card.availableSchedules.includes(days)) return false;
      }

      return true;
    });
  }, [allCards, price, goal, method, days]);

  return (
    <div className="space-y-14">
      <FindMyProgram cards={allCards} />

      <section aria-labelledby="catalog-filters-heading">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="catalog-filters-heading"
              className="font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]"
            >
              Catalog
            </h2>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Filter locally — prices stay published; no urgency theater.
            </p>
          </div>
          <p className="text-sm text-[var(--color-muted)]" aria-live="polite">
            {filtered.length} system{filtered.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="mt-6 grid gap-6 border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5 sm:grid-cols-2 lg:grid-cols-4">
          <FilterChipGroup
            legend="Free / Paid"
            value={price}
            options={PRICE_FILTERS}
            onChange={setPrice}
          />
          <FilterChipGroup
            legend="Goal"
            value={goal}
            options={GOAL_FILTERS}
            onChange={setGoal}
          />
          <FilterChipGroup
            legend="Method"
            value={method}
            options={METHOD_FILTERS}
            onChange={setMethod}
          />
          <FilterChipGroup
            legend="Days per week"
            value={days}
            options={DAYS_FILTERS}
            onChange={setDays}
          />
        </div>

        {filtered.length === 0 ? (
          <p className="mt-10 text-sm text-[var(--color-muted)]">
            No programs match these filters. Clear a filter to widen the set —
            we do not invent listings to fill the grid.
          </p>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {filtered.map((card, index) => (
              <ProgramCard
                key={card.familyId}
                model={card}
                className="animate-[fade-up_0.45s_var(--easing-standard)_both]"
                style={
                  {
                    animationDelay: `${Math.min(index, 6) * 40}ms`,
                  } as CSSProperties
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
