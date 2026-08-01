"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { cn } from "@/design-system/utils/cn";
import type { PublicProgramProduct } from "@/domain/program-catalog";
import { formatProgramPriceGbp } from "@/domain/program-catalog/format";

export type ProgramCardModel = {
  familyId: string;
  name: string;
  description: string;
  methodId: string | null;
  difficulty: string;
  recoveryDemand: string;
  availableSchedules: string[];
  category: string;
  paid: PublicProgramProduct | null;
  free: PublicProgramProduct | null;
};

type ProgramCardProps = {
  model: ProgramCardModel;
  className?: string;
  style?: CSSProperties;
};

function useProgramCardLabels() {
  const t = useTranslations("ProgramsPage.card");

  function methodLabel(methodId: string | null): string {
    if (!methodId) return t("methodMulti");
    const map: Record<string, string> = {
      "linear-periodization": t("methodLinear"),
      "daily-undulating-periodization": t("methodDup"),
      "block-periodization": t("methodBlock"),
      conjugate: t("methodConjugate"),
      "high-frequency-training": t("methodHighFreq"),
    };
    return map[methodId] ?? methodId;
  }

  function difficultyLabel(value: string): string {
    const map: Record<string, string> = {
      beginner: t("difficultyBeginner"),
      intermediate: t("difficultyIntermediate"),
      advanced: t("difficultyAdvanced"),
    };
    return map[value] ?? value;
  }

  function focusLabel(model: ProgramCardModel): string {
    if (model.familyId === "complete-method-collection") {
      return t("focusMulti");
    }
    const goals = [
      ...(model.paid?.goals ?? []),
      ...(model.free?.goals ?? []),
    ];
    if (goals.includes("competition_prep")) return t("focusCompetition");
    if (goals.includes("powerlifting")) return t("focusPowerlifting");
    if (goals.includes("hypertrophy")) return t("focusHypertrophy");
    if (goals.includes("strength") || goals.includes("general_strength")) {
      return t("focusMaximalStrength");
    }
    return t("focusGeneral");
  }

  function recoveryLabel(value: string): string {
    const map: Record<string, string> = {
      low: t("recoveryLow"),
      moderate: t("recoveryModerate"),
      high: t("recoveryHigh"),
    };
    return map[value] ?? value;
  }

  function scheduleLabel(value: string): string {
    const map: Record<string, string> = {
      "3day": t("schedule3"),
      "4day": t("schedule4"),
      "5day": t("schedule5"),
      "6day": t("schedule6"),
    };
    return map[value] ?? value;
  }

  return {
    t,
    methodLabel,
    difficultyLabel,
    focusLabel,
    recoveryLabel,
    scheduleLabel,
  };
}

export function ProgramCard({ model, className, style }: ProgramCardProps) {
  const locale = useLocale();
  const {
    t,
    methodLabel,
    difficultyLabel,
    focusLabel,
    recoveryLabel,
    scheduleLabel,
  } = useProgramCardLabels();
  const primary = model.paid ?? model.free;
  if (!primary) return null;

  const detailHref = `/programs/${primary.slug}`;
  const durationLabel = t("weeks", {
    weeks: model.paid ? model.paid.durationWeeks : model.free!.durationWeeks,
  });
  const priceLabel = model.paid
    ? formatProgramPriceGbp(
        model.paid.displayPrice,
        model.paid.defaultCurrency,
        locale,
      )
    : t("free");

  return (
    <article
      style={style}
      className={cn(
        "group relative flex h-full flex-col border border-white/10 bg-zinc-900 p-6 transition-[transform,box-shadow,border-color] duration-300 ease-[var(--easing-standard)]",
        "hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--color-accent)_45%,transparent)]",
        "hover:shadow-[0_20px_50px_-18px_rgba(183,255,42,0.45),0_0_0_1px_rgba(183,255,42,0.18)]",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="flex flex-wrap items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-zinc-400">
        <span>{methodLabel(model.methodId)}</span>
        <span aria-hidden className="text-white/20">
          /
        </span>
        <span className="text-zinc-100">{priceLabel}</span>
      </div>

      <h3 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-[0.03em] text-zinc-50">
        <Link
          href={detailHref}
          className="transition-colors duration-200 hover:text-[var(--color-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
        >
          {model.name}
        </Link>
      </h3>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-400">
        {model.description}
      </p>

      <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-5 text-sm">
        <div>
          <dt className="text-[0.65rem] uppercase tracking-[0.14em] text-zinc-500">
            {t("duration")}
          </dt>
          <dd className="mt-1.5 font-medium text-zinc-100">{durationLabel}</dd>
        </div>
        <div>
          <dt className="text-[0.65rem] uppercase tracking-[0.14em] text-zinc-500">
            {t("focus")}
          </dt>
          <dd className="mt-1.5 font-medium text-zinc-100">
            {focusLabel(model)}
          </dd>
        </div>
        <div>
          <dt className="text-[0.65rem] uppercase tracking-[0.14em] text-zinc-500">
            {t("difficulty")}
          </dt>
          <dd className="mt-1.5 font-medium text-zinc-100">
            {difficultyLabel(model.difficulty)}
          </dd>
        </div>
      </dl>

      <p className="mt-3 text-xs text-zinc-500">
        {recoveryLabel(model.recoveryDemand)}
        {" · "}
        {model.availableSchedules.map(scheduleLabel).join(" · ")}
      </p>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Link
          href={detailHref}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-sm bg-[var(--color-accent)] px-4 text-center text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-accent-foreground)] transition-[background-color,transform] duration-200 hover:bg-[var(--color-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
        >
          {t("getStarted")}
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
        </Link>
        {model.free ? (
          <Link
            href={`/programs/start/${model.free.slug}`}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-sm border border-white/15 px-4 text-center text-xs font-bold uppercase tracking-[0.08em] text-zinc-100 transition-colors duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
          >
            {t("tryFree")}
          </Link>
        ) : null}
      </div>
    </article>
  );
}
