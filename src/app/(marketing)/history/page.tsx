import type { Metadata } from "next";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { ArchivePromoBanner } from "@/components/history/HistoricalArchive";
import { TrainingHistoryTimeline } from "@/components/history/TrainingHistoryTimeline";
import { PageIntro } from "@/components/ui/PageIntro";
import {
  HISTORY_TIMELINE_DESCRIPTION,
  HISTORY_TIMELINE_TITLE,
  listHistoryEras,
} from "@/domain/history";
import { featureFlags } from "@/config/feature-flags";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: HISTORY_TIMELINE_TITLE,
  description: HISTORY_TIMELINE_DESCRIPTION,
  alternates: { canonical: "/history" },
  openGraph: {
    title: HISTORY_TIMELINE_TITLE,
    description: HISTORY_TIMELINE_DESCRIPTION,
    url: "/history",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: HISTORY_TIMELINE_TITLE,
    description: HISTORY_TIMELINE_DESCRIPTION,
  },
  keywords: [
    "history of strength training",
    "physical culture",
    "bodybuilding history",
    "Soviet weightlifting",
    "HIT training",
    "conjugate method",
    "autoregulation",
    "evidence-informed programming",
  ],
};

function buildJsonLd(eras: ReturnType<typeof listHistoryEras>) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: HISTORY_TIMELINE_TITLE,
    description: HISTORY_TIMELINE_DESCRIPTION,
    url: `https://${siteConfig.domain}/history`,
    numberOfItems: eras.length,
    itemListElement: eras.map((era, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: era.title,
      url: `https://${siteConfig.domain}/history/${era.slug}`,
      description: era.teaser,
    })),
  };
}

export default function HistoryPage() {
  const eras = listHistoryEras();
  const jsonLd = buildJsonLd(eras);

  return (
    <MarketingContainer>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="relative overflow-hidden rounded-[var(--radius-lg)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_color-mix(in_srgb,var(--color-accent)_14%,transparent),_transparent_55%),linear-gradient(180deg,color-mix(in_srgb,var(--color-surface)_70%,transparent),transparent)]"
        />
        <PageIntro
          eyebrow="Educational timeline"
          title={HISTORY_TIMELINE_TITLE}
          description={HISTORY_TIMELINE_DESCRIPTION}
        />
      </div>
      <div className="mt-10 space-y-10">
        {featureFlags.historicalTrainingArchive ? <ArchivePromoBanner /> : null}
        <TrainingHistoryTimeline eras={eras} />
      </div>
    </MarketingContainer>
  );
}
