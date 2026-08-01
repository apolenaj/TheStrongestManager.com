"use client";

import { useMemo, useState, useEffect, type CSSProperties } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { cn } from "@/design-system/utils/cn";
import type { PublicProgramProduct } from "@/domain/program-catalog";
import { getProgramFamilyContent } from "@/domain/program-catalog/content";
import { ProgramCard, type ProgramCardModel } from "@/components/programs/ProgramCard";

const CATEGORY_IDS = [
  "all",
  "powerlifting",
  "bodybuilding",
  "strongman",
  "lift_specific",
  "transformation",
  "athletic",
  "weightlifting",
] as const;
const PRICE_IDS = ["all", "free", "paid"] as const;
const GOAL_IDS = [
  "all",
  "strength",
  "powerlifting",
  "hypertrophy",
  "competition_prep",
  "general_strength",
] as const;
const METHOD_IDS = [
  "all",
  "linear-periodization",
  "daily-undulating-periodization",
  "block-periodization",
  "conjugate",
  "high-frequency-training",
  "bundle",
] as const;
const DAYS_IDS = ["all", "3day", "4day", "5day", "6day"] as const;

type CategoryId = (typeof CATEGORY_IDS)[number];
type PriceId = (typeof PRICE_IDS)[number];
type GoalId = (typeof GOAL_IDS)[number];
type MethodId = (typeof METHOD_IDS)[number];
type DaysId = (typeof DAYS_IDS)[number];

function buildFamilyCards(
  programs: PublicProgramProduct[],
  locale: string,
): ProgramCardModel[] {
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
    const content = getProgramFamilyContent(familyId, locale);
    cards.push({
      familyId,
      name: content?.displayName ?? primary.name.replace(/ \(Free 4-Week\)$/i, ""),
      description: content?.tagline ?? primary.description,
      methodId: primary.methodId,
      difficulty: primary.difficulty,
      recoveryDemand: primary.recoveryDemand,
      availableSchedules: primary.availableSchedules,
      category: primary.category,
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

const FINDER_GOAL_IDS = [
  "strength",
  "powerlifting",
  "hypertrophy",
  "competition_prep",
] as const;
const FINDER_EXP_IDS = ["beginner", "intermediate", "advanced"] as const;
const FINDER_DAY_IDS = ["3day", "4day", "5day"] as const;

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
  const t = useTranslations("ProgramsPage");
  const [goal, setGoal] = useState<(typeof FINDER_GOAL_IDS)[number]>("strength");
  const [experience, setExperience] =
    useState<(typeof FINDER_EXP_IDS)[number]>("intermediate");
  const [days, setDays] = useState<(typeof FINDER_DAY_IDS)[number]>("4day");

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
        {t("finder.eyebrow")}
      </p>
      <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
        {t("finder.title")}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-muted)]">
        {t("finder.lead")}
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <FilterChipGroup
          legend={t("finder.goal")}
          value={goal}
          options={FINDER_GOAL_IDS.map((id) => ({
            id,
            label: t(`finder.goals.${id}`),
          }))}
          onChange={setGoal}
        />
        <FilterChipGroup
          legend={t("finder.experience")}
          value={experience}
          options={FINDER_EXP_IDS.map((id) => ({
            id,
            label: t(`finder.exp.${id}`),
          }))}
          onChange={setExperience}
        />
        <FilterChipGroup
          legend={t("finder.days")}
          value={days}
          options={FINDER_DAY_IDS.map((id) => ({
            id,
            label: t(`finder.dayOptions.${id}`),
          }))}
          onChange={setDays}
        />
      </div>

      {recommendation ? (
        <div className="mt-8 flex flex-col gap-4 border-t border-[var(--color-border)] pt-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.16em] text-[var(--color-muted)]">
              {t("finder.recommended")}
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
            {t("finder.openQuiz")}
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
  const t = useTranslations("ProgramsPage");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const allCards = useMemo(
    () => buildFamilyCards(programs, locale),
    [programs, locale],
  );

  const goalFromUrl = searchParams.get("goal");
  const initialGoalId = (
    GOAL_IDS.includes(goalFromUrl as GoalId) ? goalFromUrl : "all"
  ) as GoalId;

  const categoryFromUrl = searchParams.get("category");
  const initialCategoryId = (
    CATEGORY_IDS.includes(categoryFromUrl as CategoryId)
      ? categoryFromUrl
      : "all"
  ) as CategoryId;

  const [category, setCategory] = useState<CategoryId>(initialCategoryId);
  const [price, setPrice] = useState<PriceId>("all");
  const [goal, setGoal] = useState<GoalId>(initialGoalId);
  const [method, setMethod] = useState<MethodId>("all");
  const [days, setDays] = useState<DaysId>("all");

  useEffect(() => {
    setGoal(initialGoalId);
  }, [initialGoalId]);

  useEffect(() => {
    setCategory(initialCategoryId);
  }, [initialCategoryId]);

  const filtered = useMemo(() => {
    return allCards.filter((card) => {
      if (category !== "all" && card.category !== category) return false;

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
  }, [allCards, category, price, goal, method, days]);

  const categoryOptions = CATEGORY_IDS.map((id) => ({
    id,
    label:
      id === "all"
        ? t("filters.cat_all")
        : id === "powerlifting"
          ? t("filters.cat_powerlifting")
          : id === "bodybuilding"
            ? t("filters.cat_bodybuilding")
            : id === "strongman"
              ? t("filters.cat_strongman")
              : id === "lift_specific"
                ? t("filters.cat_lift_specific")
                : id === "transformation"
                  ? t("filters.cat_transformation")
                  : id === "athletic"
                    ? t("filters.cat_athletic")
                    : t("filters.cat_weightlifting"),
  }));

  const priceOptions = PRICE_IDS.map((id) => ({
    id,
    label:
      id === "all"
        ? t("filters.priceAll")
        : id === "free"
          ? t("filters.priceFree")
          : t("filters.pricePaid"),
  }));

  const goalOptions = GOAL_IDS.map((id) => ({
    id,
    label:
      id === "all"
        ? t("filters.goalAll")
        : id === "strength"
          ? t("filters.goalStrength")
          : id === "powerlifting"
            ? t("filters.goalPowerlifting")
            : id === "hypertrophy"
              ? t("filters.goalHypertrophy")
              : id === "competition_prep"
                ? t("filters.goalCompetition")
                : t("filters.goalGeneral"),
  }));

  const methodOptions = METHOD_IDS.map((id) => ({
    id,
    label:
      id === "all"
        ? t("filters.methodAll")
        : id === "linear-periodization"
          ? t("filters.methodLinear")
          : id === "daily-undulating-periodization"
            ? t("filters.methodDup")
            : id === "block-periodization"
              ? t("filters.methodBlock")
              : id === "conjugate"
                ? t("filters.methodConjugate")
                : id === "high-frequency-training"
                  ? t("filters.methodHighFreq")
                  : t("filters.methodBundle"),
  }));

  const daysOptions = DAYS_IDS.map((id) => ({
    id,
    label:
      id === "all"
        ? t("filters.daysAny")
        : id === "3day"
          ? t("filters.days3")
          : id === "4day"
            ? t("filters.days4")
            : id === "5day"
              ? t("filters.days5")
              : t("filters.days6"),
  }));

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
              {t("catalog.title")}
            </h2>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              {t("catalog.lead")}
            </p>
          </div>
          <p className="text-sm text-[var(--color-muted)]" aria-live="polite">
            {t("catalog.count", { count: filtered.length })}
          </p>
        </div>

        <div className="mt-6 space-y-6 border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5">
          <FilterChipGroup
            legend={t("filters.category")}
            value={category}
            options={categoryOptions}
            onChange={setCategory}
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <FilterChipGroup
              legend={t("filters.price")}
              value={price}
              options={priceOptions}
              onChange={setPrice}
            />
            <FilterChipGroup
              legend={t("filters.goal")}
              value={goal}
              options={goalOptions}
              onChange={setGoal}
            />
            <FilterChipGroup
              legend={t("filters.method")}
              value={method}
              options={methodOptions}
              onChange={setMethod}
            />
            <FilterChipGroup
              legend={t("filters.days")}
              value={days}
              options={daysOptions}
              onChange={setDays}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="mt-10 text-sm text-[var(--color-muted)]">
            {t("catalog.empty")}
          </p>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
