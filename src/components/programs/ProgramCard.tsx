"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useTranslations } from "next-intl";
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

  return { t, methodLabel, recoveryLabel, scheduleLabel };
}

export function ProgramCard({ model, className, style }: ProgramCardProps) {
  const { t, methodLabel, recoveryLabel, scheduleLabel } = useProgramCardLabels();
  const primary = model.paid ?? model.free;
  if (!primary) return null;

  const durationLabel = t("weeks", {
    weeks: model.paid ? model.paid.durationWeeks : model.free!.durationWeeks,
  });
  const priceLabel = model.paid
    ? formatProgramPriceGbp(model.paid.displayPrice, model.paid.defaultCurrency)
    : t("free");

  return (
    <article
      style={style}
      className={cn(
        "group flex h-full flex-col border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 transition-[border-color,transform,background-color] duration-[var(--duration-normal)] ease-[var(--easing-standard)] hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--color-accent)_35%,var(--color-border))] hover:bg-[var(--color-surface-overlay)]",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
        <span>{methodLabel(model.methodId)}</span>
        <span aria-hidden className="text-[var(--color-border-strong)]">
          /
        </span>
        <span className="text-[var(--color-foreground)]">{model.difficulty}</span>
      </div>

      <h3 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
        <Link
          href={`/programs/${primary.slug}`}
          className="transition-colors duration-200 hover:text-[var(--color-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
        >
          {model.name}
        </Link>
      </h3>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--color-muted)]">
        {model.description}
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-[var(--color-border)] pt-5 text-sm">
        <div>
          <dt className="text-[0.65rem] uppercase tracking-[0.14em] text-[var(--color-subtle)]">
            {t("duration")}
          </dt>
          <dd className="mt-1 text-[var(--color-foreground)]">{durationLabel}</dd>
        </div>
        <div>
          <dt className="text-[0.65rem] uppercase tracking-[0.14em] text-[var(--color-subtle)]">
            {t("price")}
          </dt>
          <dd className="mt-1 text-[var(--color-foreground)]">{priceLabel}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-[0.65rem] uppercase tracking-[0.14em] text-[var(--color-subtle)]">
            {t("recovery")}
          </dt>
          <dd className="mt-1 text-[var(--color-foreground)]">
            {recoveryLabel(model.recoveryDemand)}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-[0.65rem] uppercase tracking-[0.14em] text-[var(--color-subtle)]">
            {t("schedules")}
          </dt>
          <dd className="mt-1 text-[var(--color-muted)]">
            {model.availableSchedules.map(scheduleLabel).join(" · ")}
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        {model.free ? (
          <Link
            href={`/programs/start/${model.free.slug}`}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-sm bg-[var(--color-accent)] px-4 text-center text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-accent-foreground)] transition-colors duration-200 hover:bg-[var(--color-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
          >
            {t("tryFree")}
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
          </Link>
        ) : null}
        {model.paid ? (
          <Link
            href={`/programs/${model.paid.slug}`}
            className={cn(
              "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-sm border border-[var(--color-border-strong)] px-4 text-center text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-foreground)] transition-colors duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]",
              !model.free &&
                "border-transparent bg-[var(--color-accent)] text-[var(--color-accent-foreground)] hover:bg-[var(--color-accent-hover)] hover:text-[var(--color-accent-foreground)]",
            )}
          >
            {t("view")}
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
          </Link>
        ) : null}
      </div>
    </article>
  );
}
