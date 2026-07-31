import type { Metadata } from "next";
import Link from "next/link";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { PageIntro } from "@/components/ui/PageIntro";
import { featureFlags } from "@/config/feature-flags";
import {
  evaluateProgrammaticSeoQuality,
  PROGRAMMATIC_SEO_PAGES,
} from "@/domain/programmatic-seo-safety";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Curated strength training guides — deadlift variations, exercise comparisons, and method comparisons. Quality-gated; no thin page factories.",
  alternates: { canonical: "/guides" },
};

export default function GuidesIndexPage() {
  const pages = featureFlags.programmaticSeoSafety
    ? PROGRAMMATIC_SEO_PAGES.filter(
        (p) => evaluateProgrammaticSeoQuality(p).passed,
      )
    : [];

  return (
    <MarketingContainer>
      <PageIntro
        eyebrow="Guides"
        title="Useful guides only"
        description="Allowlisted programmatic templates that passed unique value, structured data, internal link, and depth checks. We do not generate thousands of thin pages."
      />
      <ul className="mt-10 max-w-2xl space-y-6">
        {pages.map((page) => (
          <li key={page.slug}>
            <Link
              href={`/guides/${page.slug}`}
              className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-[var(--color-foreground)] underline-offset-4 hover:underline"
            >
              {page.title}
            </Link>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              {page.description}
            </p>
          </li>
        ))}
      </ul>
    </MarketingContainer>
  );
}
