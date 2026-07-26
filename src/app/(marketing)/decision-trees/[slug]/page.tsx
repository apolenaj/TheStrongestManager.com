import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { DecisionTreeExperience } from "@/components/decision-trees/DecisionTreeExperience";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { PageIntro } from "@/components/ui/PageIntro";
import { Alert } from "@/design-system";
import {
  DECISION_TREE_HONESTY,
  allDecisionTreeSlugs,
  decisionTreePath,
  getDecisionTreeBySlug,
} from "@/domain/decision-trees";
import { getDecisionTreeSession } from "@/services/decision-trees";
import { featureFlags } from "@/config/feature-flags";
import { siteConfig } from "@/config/site";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export function generateStaticParams() {
  if (!featureFlags.decisionTreeCoaching) return [];
  return allDecisionTreeSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tree = getDecisionTreeBySlug(slug);
  if (!tree) {
    return {
      title: "Decision tree",
      robots: { index: false, follow: false },
    };
  }
  return {
    title: tree.question,
    description: tree.description,
    alternates: { canonical: decisionTreePath(tree.slug) },
    openGraph: {
      title: tree.question,
      description: tree.description,
      url: decisionTreePath(tree.slug),
      type: "website",
    },
  };
}

export default async function DecisionTreePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = await searchParams;
  const session = await getDecisionTreeSession({
    slug,
    pathParam: query.path,
  });

  if (!session.ok) notFound();

  const { tree, optionIds, result, pathError } = session;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tree.title,
    description: tree.description,
    url: `https://${siteConfig.domain}${decisionTreePath(tree.slug)}`,
    applicationCategory: "HealthApplication",
  };

  return (
    <FeatureGate
      flag="decisionTreeCoaching"
      title="Decision Tree Coaching Tools"
      description="Decision Tree Coaching Tools are behind a feature flag."
    >
      <MarketingContainer>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <PageIntro
          eyebrow="Decision tree"
          title={tree.question}
          description={tree.description}
        />
        <p className="mx-auto mt-4 max-w-3xl text-sm text-[var(--color-muted)]">
          {DECISION_TREE_HONESTY[0]}
        </p>
        <div className="mx-auto mt-8 max-w-3xl space-y-6">
          {pathError ? (
            <Alert tone="danger" title="Invalid share path">
              {pathError} Starting fresh.
            </Alert>
          ) : null}
          <DecisionTreeExperience
            tree={tree}
            initialOptionIds={optionIds}
            initialResult={result}
          />
        </div>
      </MarketingContainer>
    </FeatureGate>
  );
}
