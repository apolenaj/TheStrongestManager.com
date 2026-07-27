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
  title: "Learn Powerlifting & Strength Training",
  description:
    "Free guides on powerlifting technique, training methods, and programming — linked to real tools inside The Strongest Manager.",
  keywords: [
    "powerlifting guide",
    "strength training education",
    "powerlifting technique",
  ],
  alternates: { canonical: "/learn" },
  openGraph: {
    title: "Learn Powerlifting & Strength Training",
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
