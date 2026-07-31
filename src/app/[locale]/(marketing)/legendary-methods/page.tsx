import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
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

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("LegendaryMethods");
  const title = t("meta.title");
  const description = t("meta.description");

  return {
    title,
    description,
    keywords: [
      "legendary training methods",
      "bodybuilding training systems",
      "powerlifting training systems",
      "strongman training methods",
      "training method analysis",
    ],
    alternates: { canonical: "/legendary-methods" },
    authors: [{ name: "Josef" }, { name: "The Strongest editorial team" }],
    openGraph: {
      title: `${title} | The Strongest`,
      description,
      url: "/legendary-methods",
      type: "website",
      images: [
        {
          url: absoluteUrl("/legendary-methods/opengraph-image"),
          width: 1200,
          height: 630,
          alt: t("meta.ogImageAlt"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | The Strongest`,
      description,
      images: [absoluteUrl("/legendary-methods/opengraph-image")],
    },
    robots: { index: true, follow: true },
  };
}

export default async function LegendaryMethodsPage() {
  const t = await getTranslations("LegendaryMethods");
  const locale = await getLocale();
  const published = getPublishedLegendaryMethods();
  const cards = listLegendaryMethodCards(published, locale);
  const dateModified = published
    .map((p) => p.lastReviewedAt ?? p.updatedAt ?? p.publishedAt)
    .filter(Boolean)
    .sort()
    .at(-1);
  const jsonLd = legendaryMethodsLibraryJsonLd({
    name: t("meta.title"),
    description: t("meta.description"),
    cards,
    dateModified,
  });

  return (
    <div className="bg-[var(--color-background)]">
      <JsonLdScript data={jsonLd} />

      <section className="relative overflow-hidden border-b border-white/10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_18%_0%,rgba(183,255,42,0.1),transparent_52%),linear-gradient(180deg,var(--color-surface)_0%,var(--color-background)_78%)]"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
            {t("index.eyebrow")}
          </p>
          <h1 className="mt-5 max-w-4xl font-[family-name:var(--font-display)] text-[clamp(2.5rem,6vw,4.25rem)] font-bold uppercase leading-[1.02] tracking-tight text-[var(--color-foreground)]">
            {t("index.title")}
          </h1>
          <p className="legendary-prose mt-6 text-base sm:text-lg">
            {t("meta.description")}
          </p>
          <div className="mt-8 max-w-2xl">
            <LegendaryMethodDisclaimer variant="index" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <LegendaryMethodsLibrary cards={cards} />
      </div>

      <div className="border-t border-white/10 bg-[var(--color-surface)]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <LegendaryMethodsLearnSections />
        </div>
      </div>
    </div>
  );
}
