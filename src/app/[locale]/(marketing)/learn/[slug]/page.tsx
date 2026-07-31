import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { LearnPillar } from "@/components/seo/LearnContent";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import {
  allSeoClusterSlugs,
  getSeoClusterBySlug,
  pillarPageJsonLd,
} from "@/domain/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return allSeoClusterSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cluster = getSeoClusterBySlug(slug);
  if (!cluster) {
    return { title: "Topic not found", robots: { index: false, follow: false } };
  }
  return {
    title: cluster.title,
    description: cluster.description,
    alternates: { canonical: `/learn/${cluster.slug}` },
    openGraph: {
      title: cluster.title,
      description: cluster.description,
      url: `/learn/${cluster.slug}`,
      type: "article",
    },
  };
}

export default async function LearnClusterPage({ params }: PageProps) {
  const { slug } = await params;
  const cluster = getSeoClusterBySlug(slug);
  if (!cluster) notFound();

  return (
    <MarketingContainer>
      <JsonLdScript data={pillarPageJsonLd(cluster)} />
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
          Topic pillar
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
          {cluster.title}
        </h1>
        <p className="mt-4 max-w-2xl text-base text-[var(--color-muted)]">
          {cluster.description}
        </p>
      </div>
      <LearnPillar cluster={cluster} />
    </MarketingContainer>
  );
}
