import {
  getPublishedLegendaryMethods,
  listFeaturedLegendaryMethodCards,
} from "@/domain/legendary-methods";
import { LegendaryAnalyticsLink } from "@/components/legendary-methods/LegendaryAnalytics";
import { LegendaryMethodEditorialCard } from "@/components/legendary-methods/LegendaryMethodEditorialCard";

const SECTION_TITLE = "Learn From the Strongest";
const SECTION_COPY =
  "Explore the training systems behind legendary performances in bodybuilding, powerlifting and strongman. Discover what worked, what most lifters misunderstand and how the underlying principles can be adapted to your own training.";

/**
 * Homepage education section — does not redesign the rest of the funnel.
 * Featured cards only appear for published profiles (no empty/coming-soon cards).
 */
export function HomeLegendaryMethods() {
  const featured = listFeaturedLegendaryMethodCards(
    getPublishedLegendaryMethods(),
    6,
  );

  return (
    <section
      id="learn-from-the-strongest"
      aria-labelledby="home-legendary-methods-heading"
      className="relative border-b border-[var(--color-border)] bg-[var(--color-background)]"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
              Legendary Training Methods
            </p>
            <h2
              id="home-legendary-methods-heading"
              className="mt-4 font-[family-name:var(--font-display)] text-[clamp(1.85rem,3.8vw,3.1rem)] font-semibold uppercase leading-[1.08] tracking-[0.02em] text-[var(--color-foreground)]"
            >
              {SECTION_TITLE}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--color-muted)]">
              {SECTION_COPY}
            </p>
          </div>
          <LegendaryAnalyticsLink
            href="/legendary-methods"
            event="legendary_methods_homepage_click"
            eventProps={{ target: "cta" }}
            className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-sm bg-[var(--color-accent)] px-5 text-sm font-bold uppercase tracking-[0.08em] text-[var(--color-accent-foreground)] transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
          >
            Explore Legendary Methods
          </LegendaryAnalyticsLink>
        </div>

        {featured.length > 0 ? (
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {featured.map((card) => (
              <li key={card.slug} className="min-w-0">
                <LegendaryMethodEditorialCard card={card} />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
