import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { HistoryEraArticle } from "@/components/history/TrainingHistoryTimeline";
import { PageIntro } from "@/components/ui/PageIntro";
import { Alert } from "@/design-system";
import {
  HISTORY_HONESTY,
  allHistoryEraSlugs,
  getHistoryEraBySlug,
} from "@/domain/history";
import { siteConfig } from "@/config/site";

type HistoryEraPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return allHistoryEraSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: HistoryEraPageProps): Promise<Metadata> {
  const { slug } = await params;
  const era = getHistoryEraBySlug(slug);
  if (!era) {
    return {
      title: "Era not found",
      robots: { index: false, follow: false },
    };
  }
  const title = `${era.title} · Training history`;
  const description = `${era.periodLabel}. ${era.teaser}`;
  return {
    title,
    description,
    alternates: { canonical: `/history/${era.slug}` },
    openGraph: {
      title,
      description,
      url: `/history/${era.slug}`,
      type: "article",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function HistoryEraPage({ params }: HistoryEraPageProps) {
  const { slug } = await params;
  const era = getHistoryEraBySlug(slug);
  if (!era) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: era.title,
    description: era.teaser,
    datePublished: undefined,
    author: {
      "@type": "Organization",
      name: siteConfig.name,
    },
    mainEntityOfPage: `https://${siteConfig.domain}/history/${era.slug}`,
    about: era.themes,
  };

  return (
    <MarketingContainer>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageIntro
        eyebrow={era.periodLabel}
        title={era.title}
        description={era.teaser}
      />
      <div className="mx-auto mt-8 max-w-3xl space-y-6">
        <Alert tone="info" title="Original educational overview">
          {HISTORY_HONESTY[0]} {HISTORY_HONESTY[1]}
        </Alert>
        <HistoryEraArticle era={era} mode="detail" />
      </div>
    </MarketingContainer>
  );
}
