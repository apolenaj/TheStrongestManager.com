import type { Metadata } from "next";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { LegendaryMethodDisclaimer } from "@/components/legendary-methods/LegendaryMethodDisclaimer";
import { LegendaryMethodsLibrary } from "@/components/legendary-methods/LegendaryMethodsLibrary";
import { LegendaryMethodsLearnSections } from "@/components/legendary-methods/LegendaryMethodsLearnSections";
import {
  getPublishedLegendaryMethods,
  listLegendaryMethodCards,
  legendaryMethodsLibraryJsonLd,
} from "@/domain/legendary-methods";
import { absoluteUrl } from "@/config/site";

const PAGE_TITLE = "Legendary Training Methods";
const PAGE_DESCRIPTION =
  "Explore the training systems behind bodybuilding, powerlifting and strongman legends. Learn what they did, why it worked, what most lifters misunderstand and how the underlying principles can be adapted to modern training.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "legendary training methods",
    "bodybuilding training systems",
    "powerlifting training systems",
    "strongman training methods",
    "training method analysis",
  ],
  alternates: { canonical: "/legendary-methods" },
  authors: [{ name: "Josef" }, { name: "The Strongest Manager editorial team" }],
  openGraph: {
    title: `${PAGE_TITLE} | The Strongest Manager`,
    description: PAGE_DESCRIPTION,
    url: "/legendary-methods",
    type: "website",
    images: [
      {
        url: absoluteUrl("/legendary-methods/opengraph-image"),
        width: 1200,
        height: 630,
        alt: "Legendary Training Methods — abstract barbell geometry graphic",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${PAGE_TITLE} | The Strongest Manager`,
    description: PAGE_DESCRIPTION,
    images: [absoluteUrl("/legendary-methods/opengraph-image")],
  },
  robots: { index: true, follow: true },
};

export default function LegendaryMethodsPage() {
  const published = getPublishedLegendaryMethods();
  const cards = listLegendaryMethodCards(published);
  const dateModified = published
    .map((p) => p.lastReviewedAt ?? p.updatedAt ?? p.publishedAt)
    .filter(Boolean)
    .sort()
    .at(-1);
  const jsonLd = legendaryMethodsLibraryJsonLd({
    name: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    cards,
    dateModified,
  });

  return (
    <div className="bg-[var(--color-background)]">
      <JsonLdScript data={jsonLd} />

      <section className="relative overflow-hidden border-b border-[var(--color-border)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_18%_0%,rgba(183,255,42,0.12),transparent_52%),linear-gradient(180deg,var(--color-surface)_0%,var(--color-background)_78%)]"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
            Educational library
          </p>
          <h1 className="mt-4 max-w-4xl font-[family-name:var(--font-display)] text-4xl font-semibold uppercase leading-[1.05] tracking-[0.03em] text-[var(--color-foreground)] sm:text-5xl md:text-6xl">
            Legendary Training Methods
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[var(--color-muted)] sm:text-lg">
            {PAGE_DESCRIPTION}
          </p>
          <div className="mt-6 max-w-2xl">
            <LegendaryMethodDisclaimer variant="index" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <LegendaryMethodsLibrary cards={cards} />
      </div>

      <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <LegendaryMethodsLearnSections />
        </div>
      </div>
    </div>
  );
}
