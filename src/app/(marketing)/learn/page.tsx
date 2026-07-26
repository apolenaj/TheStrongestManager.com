import type { Metadata } from "next";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { LearnHub } from "@/components/seo/LearnContent";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import {
  learnIndexJsonLd,
  listSeoClusters,
} from "@/domain/seo";
import { breadcrumbJsonLd } from "@/domain/seo";

export const metadata: Metadata = {
  title: "Learn",
  description:
    "Guides on exercise technique, training methods, programming, and strength sports — linked to tools in TheStrongestManager.",
  alternates: { canonical: "/learn" },
  openGraph: {
    title: "Learn · strength guides",
    description:
      "Technique, methods, programming, and strength-sport guides with links into the product.",
    url: "/learn",
    type: "website",
  },
};

export default function LearnPage() {
  const clusters = listSeoClusters();

  return (
    <MarketingContainer>
      <JsonLdScript
        data={[
          learnIndexJsonLd(clusters),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Learn", path: "/learn" },
          ]),
        ]}
      />
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
          Guides
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
          Learn strength topics
        </h1>
        <p className="mt-4 max-w-2xl text-base text-[var(--color-muted)]">
          Guides on technique, methods, programming, and strength sports — each
          linked to real exercises, tools, and academy courses in the product.
        </p>
      </div>
      <LearnHub clusters={clusters} />
    </MarketingContainer>
  );
}
