import type { Metadata } from "next";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { ResearchLibraryIndex } from "@/components/research-library/ResearchLibrary";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { PageIntro } from "@/components/ui/PageIntro";
import { Alert } from "@/design-system";
import { RESEARCH_LIBRARY_HONESTY } from "@/domain/research-library";
import { getResearchLibraryOverview } from "@/services/research-library";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Research Library",
  description:
    "Curated research architecture across hypertrophy, strength, programming, recovery, nutrition, and biomechanics. Real citations only — never invented studies.",
  alternates: { canonical: "/research" },
  openGraph: {
    title: "Research Library",
    description: RESEARCH_LIBRARY_HONESTY[0],
    url: "/research",
    type: "website",
  },
};

export default async function ResearchLibraryPage() {
  const result = await getResearchLibraryOverview();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Research Library",
    description: RESEARCH_LIBRARY_HONESTY[0],
    url: `https://${siteConfig.domain}/research`,
  };

  return (
    <FeatureGate
      flag="researchLibrary"
      title="Research Library"
      description="Research Library is behind a feature flag."
    >
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
            eyebrow="Evidence"
            title="Research Library"
            description="Curated study architecture: citation, summary, practical takeaway, and limitations — across hypertrophy, strength, programming, recovery, nutrition, and biomechanics."
          />
        </div>
        <div className="mt-10">
          {!result.ok ? (
            <Alert tone="warning" title="Unavailable">
              {result.error}
            </Alert>
          ) : (
            <ResearchLibraryIndex
              byCategory={result.byCategory}
              counts={result.counts}
            />
          )}
        </div>
      </MarketingContainer>
    </FeatureGate>
  );
}
