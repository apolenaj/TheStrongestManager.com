import type { Metadata } from "next";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { DecisionTreeIndex } from "@/components/decision-trees/DecisionTreeIndex";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { PageIntro } from "@/components/ui/PageIntro";
import {
  DECISION_TREE_HONESTY,
  DECISION_TREE_INDEX_DESCRIPTION,
} from "@/domain/decision-trees";
import { getDecisionTreeOverview } from "@/services/decision-trees";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Decision Tree Coaching Tools",
  description: DECISION_TREE_INDEX_DESCRIPTION,
  alternates: { canonical: "/decision-trees" },
  openGraph: {
    title: "Decision Tree Coaching Tools",
    description: DECISION_TREE_HONESTY[0],
    url: "/decision-trees",
    type: "website",
  },
};

export default async function DecisionTreesIndexPage() {
  const overview = await getDecisionTreeOverview();
  const trees = overview.ok ? overview.trees : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Decision Tree Coaching Tools",
    description: DECISION_TREE_INDEX_DESCRIPTION,
    url: `https://${siteConfig.domain}/decision-trees`,
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
        <div className="relative overflow-hidden rounded-[var(--radius-lg)]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_color-mix(in_srgb,var(--color-accent)_14%,transparent),_transparent_55%),linear-gradient(180deg,color-mix(in_srgb,var(--color-surface)_70%,transparent),transparent)]"
          />
          <PageIntro
            eyebrow="Coaching tools"
            title="Decision Tree Coaching Tools"
            description={DECISION_TREE_INDEX_DESCRIPTION}
          />
        </div>
        <div className="mt-10">
          <DecisionTreeIndex trees={trees} />
        </div>
      </MarketingContainer>
    </FeatureGate>
  );
}
