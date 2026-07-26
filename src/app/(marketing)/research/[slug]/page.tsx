import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { ResearchLibraryEntryView } from "@/components/research-library/ResearchLibrary";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { PageIntro } from "@/components/ui/PageIntro";
import {
  allResearchLibrarySlugs,
  getResearchLibraryEntryBySlug,
  researchLibraryEntryPath,
} from "@/domain/research-library";
import { featureFlags } from "@/config/feature-flags";
import { siteConfig } from "@/config/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  if (!featureFlags.researchLibrary) return [];
  return allResearchLibrarySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = getResearchLibraryEntryBySlug(slug);
  if (!entry) {
    return { title: "Research entry", robots: { index: false, follow: false } };
  }
  return {
    title: `${entry.citationLabel.slice(0, 60)} · Research Library`,
    description: entry.summary,
    alternates: { canonical: researchLibraryEntryPath(entry.slug) },
  };
}

export default async function ResearchLibraryEntryPage({ params }: Props) {
  const { slug } = await params;
  const entry = getResearchLibraryEntryBySlug(slug);
  if (!entry) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: entry.citationLabel,
    description: entry.summary,
    url: `https://${siteConfig.domain}${researchLibraryEntryPath(entry.slug)}`,
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
        <PageIntro
          eyebrow="Research entry"
          title={entry.citationLabel}
          description={entry.summary}
        />
        <div className="mx-auto mt-8 max-w-3xl">
          <ResearchLibraryEntryView entry={entry} />
        </div>
      </MarketingContainer>
    </FeatureGate>
  );
}
