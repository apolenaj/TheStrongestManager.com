"use client";

import { ArrowRight, Clock3 } from "lucide-react";
import {
  type LegendaryMethodCardModel,
} from "@/domain/legendary-methods";
import { LegendaryMethodCardArt } from "@/components/legendary-methods/LegendaryMethodCardArt";
import { LegendaryAnalyticsLink } from "@/components/legendary-methods/LegendaryAnalytics";

/**
 * Compact editorial card for homepage featured Legendary Methods.
 * No celebrity portraits — abstract method artwork only.
 */
export function LegendaryMethodEditorialCard({
  card,
}: {
  card: LegendaryMethodCardModel;
}) {
  const insight = card.shortDescription;

  return (
    <article className="flex h-full flex-col border border-[var(--color-border)] bg-[var(--color-surface-elevated)] transition-[border-color] duration-200 hover:border-[color-mix(in_srgb,var(--color-accent)_40%,var(--color-border))]">
      <LegendaryMethodCardArt
        category={card.category}
        title={card.methodFocus || card.profileTitle}
        compact
      />
      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
          {card.categoryLabel}
        </p>
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
            {card.athleteName}
          </h3>
          <p className="mt-1 text-sm font-medium leading-snug text-[var(--color-foreground)]">
            {card.profileTitle}
          </p>
        </div>
        {insight ? (
          <p className="flex-1 text-sm leading-relaxed text-[var(--color-muted)]">
            {insight}
          </p>
        ) : null}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] pt-3">
          <p className="inline-flex items-center gap-1.5 text-xs text-[var(--color-subtle)]">
            <Clock3 className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />~
            {card.readingTimeMinutes} min read
          </p>
          <LegendaryAnalyticsLink
            href={card.href}
            event="legendary_methods_homepage_click"
            eventProps={{ target: "card", slug: card.slug }}
            className="inline-flex min-h-11 items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
          >
            Read Analysis
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
          </LegendaryAnalyticsLink>
        </div>
      </div>
    </article>
  );
}
