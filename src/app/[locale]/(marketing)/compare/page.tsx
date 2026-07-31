import type { Metadata } from "next";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { MethodCompareExperience } from "@/components/methods/MethodCompareExperience";
import { PageIntro } from "@/components/ui/PageIntro";
import {
  buildMethodComparison,
  listComparableMethods,
  parseMethodCompareParam,
} from "@/domain/methods/compare";

type ComparePageProps = {
  searchParams: Promise<{ methods?: string | string[]; m?: string | string[] }>;
};

export async function generateMetadata({
  searchParams,
}: ComparePageProps): Promise<Metadata> {
  const params = await searchParams;
  const slugs = parseMethodCompareParam(params.methods ?? params.m);
  const view = buildMethodComparison(slugs);
  // Always canonicalize to /compare — never mint unique index entries per query combo (Prompt 165).
  if (view.methods.length >= 2) {
    return {
      title: view.title,
      description: `Qualitative comparison: ${view.title}. No invented numeric scores.`,
      alternates: { canonical: "/compare" },
      robots: { index: false, follow: true },
    };
  }
  return {
    title: "Compare training methods",
    description:
      "Compare 2–3 training methods side by side with qualitative dimensions and shareable URLs.",
    alternates: { canonical: "/compare" },
  };
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const params = await searchParams;
  const slugs = parseMethodCompareParam(params.methods ?? params.m);
  const view = buildMethodComparison(slugs);
  const options = listComparableMethods();

  return (
    <MarketingContainer>
      <PageIntro
        eyebrow="Compare"
        title="Compare methods"
        description="Side-by-side comparison of purpose, complexity, frequency, volume, intensity, fatigue, skill demand, fit, and limitations. Qualitative only — no invented ranking scores."
      />
      <div className="mt-8">
        <MethodCompareExperience
          options={options}
          initialSlugs={
            slugs.length > 0
              ? slugs
              : ["daily-undulating-periodization", "block-periodization"]
          }
          view={
            slugs.length > 0
              ? view
              : buildMethodComparison([
                  "daily-undulating-periodization",
                  "block-periodization",
                ])
          }
        />
      </div>
    </MarketingContainer>
  );
}
