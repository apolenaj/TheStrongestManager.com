"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
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
  return (
    <article className="flex h-full flex-col border border-[var(--color-border)] bg-[var(--color-surface-elevated)] transition-[border-color] duration-200 motion-safe:transition-[border-color,transform] motion-safe:duration-200 hover:border-[color-mix(in_srgb,var(--color-accent)_40%,var(--color-border))] focus-within:border-[color-mix(in_srgb,var(--color-accent)_40%,var(--color-border))]">
      <LegendaryMethodCardArt
        category={card.category}
        title={card.methodFocus || card.athleteName}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
            {card.categoryLabel}
          </p>
          <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
            {card.athleteName}
          </h3>
          <p className="mt-2 text-sm font-medium leading-snug text-[var(--color-foreground)]">
            {card.profileTitle}
          </p>
        </div>

        {card.shortDescription ? (
          <p className="text-sm leading-relaxed text-[var(--color-muted)]">
            {card.shortDescription}
          </p>
        ) : null}

        <dl className="grid grid-cols-2 gap-3 border-t border-[var(--color-border)] pt-4 text-xs">
          <div>
            <dt className="uppercase tracking-[0.12em] text-[var(--color-subtle)]">
              Method focus
            </dt>
            <dd className="mt-1 text-[var(--color-foreground)]">
              {card.methodFocus}
            </dd>
          </div>
          <div>
            <dt className="uppercase tracking-[0.12em] text-[var(--color-subtle)]">
              Evidence
            </dt>
            <dd className="mt-1 capitalize text-[var(--color-foreground)]">
              {card.evidenceQuality}
            </dd>
          </div>
          <div>
            <dt className="uppercase tracking-[0.12em] text-[var(--color-subtle)]">
              Recovery demand
            </dt>
            <dd className="mt-1 text-[var(--color-foreground)]">
              {formatScore(card.recoveryDemand)}
              <span className="text-[var(--color-subtle)]"> / 10</span>
            </dd>
          </div>
          <div>
            <dt className="uppercase tracking-[0.12em] text-[var(--color-subtle)]">
              Beginner suitability
            </dt>
            <dd className="mt-1 text-[var(--color-foreground)]">
              {formatScore(card.beginnerSuitability)}
              <span className="text-[var(--color-subtle)]"> / 10</span>
            </dd>
          </div>
        </dl>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-1">
          <p className="text-xs text-[var(--color-subtle)]">
            ~{card.readingTimeMinutes} min read
          </p>
          <Link
            href={card.href}
            className="inline-flex min-h-11 items-center gap-2 rounded-sm bg-[var(--color-accent)] px-4 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-accent-foreground)] transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
          >
            Read Analysis
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
    <div className="space-y-8">
      <div>
        <p
          id={labelId}
          className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]"
        >
          Filter by category
        </p>
        <div
          role="radiogroup"
          aria-labelledby={labelId}
          className="mt-3 flex flex-wrap gap-2"
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
                    : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] hover:border-[color-mix(in_srgb,var(--color-accent)_35%,var(--color-border))] hover:text-[var(--color-foreground)]",
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-8">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
            Analyses publish when sources are ready
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-muted)]">
            We only list completed, sourced educational profiles. There are no
            placeholder athlete cards and no fabricated “coming soon” roster.
            Explore original programmes while profiles move from draft to
            published.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/programs"
              className="inline-flex min-h-11 items-center rounded-sm bg-[var(--color-accent)] px-4 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-accent-foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
            >
              Browse programmes
            </Link>
            <Link
              href="/programs/find-my-program"
              className="inline-flex min-h-11 items-center border border-[var(--color-border)] px-4 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
            >
              Find my programme
            </Link>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]" role="status">
          No published analyses in this category yet.
        </p>
      ) : filter === "all" ? (
        <div className="space-y-12">
          {groups.map((group) => (
            <section
              key={group.category}
              aria-labelledby={`legendary-group-${group.category}`}
            >
              <h2
                id={`legendary-group-${group.category}`}
                className="font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]"
              >
                {group.label}
              </h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
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
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
            {LIBRARY_CATEGORY_FILTERS.find((item) => item.id === filter)?.label ??
              "Filtered analyses"}
          </h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
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
