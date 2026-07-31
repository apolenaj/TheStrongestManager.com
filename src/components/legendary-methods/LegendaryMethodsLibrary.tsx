"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import {
  LIBRARY_CATEGORY_FILTERS,
  filterLegendaryMethodCards,
  groupLegendaryMethodCards,
  type LegendaryMethodCardModel,
  type LibraryCategoryFilterId,
} from "@/domain/legendary-methods/cards";
import { LegendaryMethodCardArt } from "@/components/legendary-methods/LegendaryMethodCardArt";
import { trackLegendaryAnalytics } from "@/components/legendary-methods/LegendaryAnalytics";
import { cn } from "@/design-system/utils/cn";

function formatScore(value: number | null): string {
  return value == null ? "—" : String(value);
}

function LegendaryMethodCard({ card }: { card: LegendaryMethodCardModel }) {
  const t = useTranslations("LegendaryMethods.library");
  const categoryLabel = t(`filters.${card.category}`);

  return (
    <article className="legendary-card legendary-surface group flex h-full flex-col overflow-hidden">
      <LegendaryMethodCardArt
        category={card.category}
        title={card.methodFocus || card.athleteName}
      />
      <div className="flex flex-1 flex-col gap-5 p-6">
        <div className="space-y-2">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
            {categoryLabel}
          </p>
          <h3 className="font-[family-name:var(--font-display)] text-xl font-bold uppercase tracking-tight text-[var(--color-foreground)] sm:text-2xl">
            {card.athleteName}
          </h3>
          <p className="text-sm font-medium leading-snug text-[var(--color-foreground)]/90">
            {card.profileTitle}
          </p>
        </div>

        {card.shortDescription ? (
          <p className="text-sm leading-relaxed text-[var(--color-muted)]">
            {card.shortDescription}
          </p>
        ) : null}

        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/10 pt-5 text-xs">
          <div>
            <dt className="uppercase tracking-[0.12em] text-[var(--color-subtle)]">
              {t("methodFocus")}
            </dt>
            <dd className="mt-1.5 text-[var(--color-foreground)]">
              {card.methodFocus}
            </dd>
          </div>
          <div>
            <dt className="uppercase tracking-[0.12em] text-[var(--color-subtle)]">
              {t("evidence")}
            </dt>
            <dd className="mt-1.5 capitalize text-[var(--color-foreground)]">
              {card.evidenceQuality}
            </dd>
          </div>
          <div>
            <dt className="uppercase tracking-[0.12em] text-[var(--color-subtle)]">
              {t("recoveryDemand")}
            </dt>
            <dd className="mt-1.5 text-[var(--color-foreground)]">
              {formatScore(card.recoveryDemand)}
              <span className="text-[var(--color-subtle)]">
                {" "}
                {t("scoreSuffix")}
              </span>
            </dd>
          </div>
          <div>
            <dt className="uppercase tracking-[0.12em] text-[var(--color-subtle)]">
              {t("beginnerSuitability")}
            </dt>
            <dd className="mt-1.5 text-[var(--color-foreground)]">
              {formatScore(card.beginnerSuitability)}
              <span className="text-[var(--color-subtle)]">
                {" "}
                {t("scoreSuffix")}
              </span>
            </dd>
          </div>
        </dl>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-1">
          <p className="text-xs text-[var(--color-subtle)]">
            {t("minRead", { minutes: card.readingTimeMinutes })}
          </p>
          <Link
            href={card.href}
            className="inline-flex min-h-11 items-center gap-2 rounded-sm bg-[var(--color-accent)] px-4 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-accent-foreground)] transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
          >
            {t("readAnalysis")}
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function LegendaryMethodsLibrary({
  cards,
}: {
  cards: LegendaryMethodCardModel[];
}) {
  const t = useTranslations("LegendaryMethods.library");
  const labelId = useId();
  const [filter, setFilter] = useState<LibraryCategoryFilterId>("all");

  const filtered = useMemo(
    () => filterLegendaryMethodCards(cards, filter),
    [cards, filter],
  );
  const groups = useMemo(
    () => groupLegendaryMethodCards(filtered),
    [filtered],
  );

  return (
    <div className="space-y-12 sm:space-y-16">
      <div>
        <p
          id={labelId}
          className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-subtle)]"
        >
          {t("filterLegend")}
        </p>
        <div
          role="radiogroup"
          aria-labelledby={labelId}
          className="mt-4 flex flex-wrap gap-3"
        >
          {LIBRARY_CATEGORY_FILTERS.map((item) => {
            const selected = filter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                id={`legendary-filter-${item.id}`}
                aria-checked={selected}
                tabIndex={selected ? 0 : -1}
                onClick={() => {
                  setFilter(item.id);
                  trackLegendaryAnalytics("legendary_methods_filter_used", {
                    filter: item.id,
                  });
                }}
                onKeyDown={(event) => {
                  const ids = LIBRARY_CATEGORY_FILTERS.map((f) => f.id);
                  const index = ids.indexOf(filter);
                  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                    event.preventDefault();
                    const next = ids[(index + 1) % ids.length]!;
                    setFilter(next);
                    trackLegendaryAnalytics("legendary_methods_filter_used", {
                      filter: next,
                    });
                    document
                      .getElementById(`legendary-filter-${next}`)
                      ?.focus();
                  }
                  if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                    event.preventDefault();
                    const prev = ids[(index - 1 + ids.length) % ids.length]!;
                    setFilter(prev);
                    trackLegendaryAnalytics("legendary_methods_filter_used", {
                      filter: prev,
                    });
                    document
                      .getElementById(`legendary-filter-${prev}`)
                      ?.focus();
                  }
                  if (event.key === "Home") {
                    event.preventDefault();
                    setFilter("all");
                    trackLegendaryAnalytics("legendary_methods_filter_used", {
                      filter: "all",
                    });
                    document.getElementById("legendary-filter-all")?.focus();
                  }
                  if (event.key === "End") {
                    event.preventDefault();
                    setFilter("training-system");
                    trackLegendaryAnalytics("legendary_methods_filter_used", {
                      filter: "training-system",
                    });
                    document
                      .getElementById("legendary-filter-training-system")
                      ?.focus();
                  }
                }}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-sm border px-4 text-xs font-bold uppercase tracking-[0.08em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]",
                  selected
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-accent-foreground)]"
                    : "border-white/10 bg-[var(--color-surface)] text-[var(--color-muted)] hover:border-white/20 hover:text-[var(--color-foreground)]",
                )}
              >
                {t(`filters.${item.id}`)}
              </button>
            );
          })}
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="legendary-surface px-6 py-10 sm:px-8 sm:py-12">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold uppercase tracking-tight text-[var(--color-foreground)]">
            {t("emptyTitle")}
          </h2>
          <p className="legendary-prose mt-4 text-sm sm:text-base">
            {t("emptyBody")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/programs"
              className="inline-flex min-h-11 items-center rounded-sm bg-[var(--color-accent)] px-4 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-accent-foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
            >
              {t("browsePrograms")}
            </Link>
            <Link
              href="/programs/find-my-program"
              className="inline-flex min-h-11 items-center border border-white/10 px-4 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
            >
              {t("findProgram")}
            </Link>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm leading-relaxed text-[var(--color-muted)]" role="status">
          {t("emptyFilter")}
        </p>
      ) : filter === "all" ? (
        <div className="space-y-16 sm:space-y-20">
          {groups.map((group) => (
            <section
              key={group.category}
              aria-labelledby={`legendary-group-${group.category}`}
            >
              <h2
                id={`legendary-group-${group.category}`}
                className="font-[family-name:var(--font-display)] text-2xl font-bold uppercase tracking-tight text-[var(--color-foreground)] sm:text-3xl"
              >
                {t(`filters.${group.category}`)}
              </h2>
              <ul className="mt-8 grid gap-6 sm:grid-cols-2 sm:gap-8 xl:grid-cols-3">
                {group.cards.map((card) => (
                  <li key={card.slug} className="min-w-0">
                    <LegendaryMethodCard card={card} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold uppercase tracking-tight text-[var(--color-foreground)] sm:text-3xl">
            {t(`filters.${filter}`)}
          </h2>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 sm:gap-8 xl:grid-cols-3">
            {filtered.map((card) => (
              <li key={card.slug} className="min-w-0">
                <LegendaryMethodCard card={card} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
