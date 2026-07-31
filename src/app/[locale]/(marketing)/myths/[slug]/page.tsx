import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { MythVsRealityEntryView } from "@/components/myth-vs-reality/MythVsReality";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { PageIntro } from "@/components/ui/PageIntro";
import {
  allMythVsRealitySlugs,
  getMythVsRealityEntryBySlug,
  mythVsRealityEntryPath,
} from "@/domain/myth-vs-reality";
import { featureFlags } from "@/config/feature-flags";
import { siteConfig } from "@/config/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  if (!featureFlags.mythVsRealityEngine) return [];
  return allMythVsRealitySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = getMythVsRealityEntryBySlug(slug);
  if (!entry) {
    return { title: "Myth vs Reality", robots: { index: false, follow: false } };
  }
  return {
    title: entry.seoTitle,
    description: entry.seoDescription,
    alternates: { canonical: mythVsRealityEntryPath(entry.slug) },
    openGraph: {
      title: entry.seoTitle,
      description: entry.seoDescription,
      url: mythVsRealityEntryPath(entry.slug),
      type: "article",
    },
  };
}

export default async function MythVsRealityEntryPage({ params }: Props) {
  const { slug } = await params;
  const entry = getMythVsRealityEntryBySlug(slug);
  if (!entry) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: entry.claim,
    description: entry.seoDescription,
    url: `https://${siteConfig.domain}${mythVsRealityEntryPath(entry.slug)}`,
  };

  return (
    <FeatureGate
      flag="mythVsRealityEngine"
      title="Myth vs Reality"
      description="Myth vs Reality is behind a feature flag."
    >
      <MarketingContainer>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <PageIntro
          eyebrow="Myth vs Reality"
          title={entry.claim}
          description="Claim · what people say · what evidence suggests · practical answer · nuance"
        />
        <div className="mx-auto mt-8 max-w-3xl">
          <MythVsRealityEntryView entry={entry} />
        </div>
      </MarketingContainer>
    </FeatureGate>
  );
}
