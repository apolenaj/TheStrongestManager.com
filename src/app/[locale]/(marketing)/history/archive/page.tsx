import type { Metadata } from "next";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { HistoricalArchiveIndex } from "@/components/history/HistoricalArchive";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { PageIntro } from "@/components/ui/PageIntro";
import {
  HISTORICAL_ARCHIVE_DESCRIPTION,
  HISTORICAL_ARCHIVE_TITLE,
  listArchiveProfilesByKind,
} from "@/domain/history";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: HISTORICAL_ARCHIVE_TITLE,
  description: HISTORICAL_ARCHIVE_DESCRIPTION,
  alternates: { canonical: "/history/archive" },
  openGraph: {
    title: HISTORICAL_ARCHIVE_TITLE,
    description: HISTORICAL_ARCHIVE_DESCRIPTION,
    url: "/history/archive",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: HISTORICAL_ARCHIVE_TITLE,
    description: HISTORICAL_ARCHIVE_DESCRIPTION,
  },
  keywords: [
    "historical training archive",
    "strength training history",
    "Louie Simmons",
    "Arthur Jones",
    "conjugate method history",
    "HIT training history",
    "Soviet periodization",
  ],
};

export default function HistoricalArchivePage() {
  const byKind = listArchiveProfilesByKind();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: HISTORICAL_ARCHIVE_TITLE,
    description: HISTORICAL_ARCHIVE_DESCRIPTION,
    url: `https://${siteConfig.domain}/history/archive`,
  };

  return (
    <FeatureGate
      flag="historicalTrainingArchive"
      title="Historical Training Archive"
      description="Historical Training Archive is behind a feature flag."
    >
      <MarketingContainer>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="relative overflow-hidden rounded-[var(--radius-lg)]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_color-mix(in_srgb,var(--color-accent)_16%,transparent),_transparent_55%),linear-gradient(180deg,color-mix(in_srgb,var(--color-surface)_75%,transparent),transparent)]"
          />
          <PageIntro
            eyebrow="Premium history"
            title={HISTORICAL_ARCHIVE_TITLE}
            description={HISTORICAL_ARCHIVE_DESCRIPTION}
          />
        </div>
        <div className="mt-10">
          <HistoricalArchiveIndex byKind={byKind} />
        </div>
      </MarketingContainer>
    </FeatureGate>
  );
}
