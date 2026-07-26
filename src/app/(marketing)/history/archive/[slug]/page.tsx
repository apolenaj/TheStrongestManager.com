import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { HistoricalArchiveProfileView } from "@/components/history/HistoricalArchive";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { PageIntro } from "@/components/ui/PageIntro";
import {
  allArchiveProfileSlugs,
  archiveProfilePath,
  getArchiveProfileBySlug,
} from "@/domain/history";
import { featureFlags } from "@/config/feature-flags";
import { siteConfig } from "@/config/site";

type ArchiveProfilePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  if (!featureFlags.historicalTrainingArchive) return [];
  return allArchiveProfileSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ArchiveProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = getArchiveProfileBySlug(slug);
  if (!profile) {
    return {
      title: "Archive profile not found",
      robots: { index: false, follow: false },
    };
  }
  const title = `${profile.title} · Historical Training Archive`;
  const description = `${profile.periodLabel}. ${profile.teaser}`;
  return {
    title,
    description,
    alternates: { canonical: archiveProfilePath(profile.slug) },
    openGraph: {
      title,
      description,
      url: archiveProfilePath(profile.slug),
      type: "article",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function ArchiveProfilePage({
  params,
}: ArchiveProfilePageProps) {
  const { slug } = await params;
  const profile = getArchiveProfileBySlug(slug);
  if (!profile) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: profile.title,
    description: profile.teaser,
    author: {
      "@type": "Organization",
      name: siteConfig.name,
    },
    mainEntityOfPage: `https://${siteConfig.domain}${archiveProfilePath(profile.slug)}`,
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
        <PageIntro
          eyebrow={profile.subtitle}
          title={profile.title}
          description={profile.teaser}
        />
        <div className="mx-auto mt-8 max-w-3xl">
          <HistoricalArchiveProfileView profile={profile} />
        </div>
      </MarketingContainer>
    </FeatureGate>
  );
}
