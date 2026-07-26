import type { Metadata } from "next";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { FitExperience } from "@/components/fit/FitExperience";
import { PageIntro } from "@/components/ui/PageIntro";
import {
  isCompleteFitQuery,
  parseFitSearchParams,
  recommendApproach,
} from "@/domain/fit";

type FitPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "What training approach fits me?",
  description:
    "Rule-based training-approach suggestions from transparent inputs — primary and alternative, with why it fits, tradeoffs, and an illustrative structure. Not one perfect method or a custom program.",
  alternates: { canonical: "/fit" },
  openGraph: {
    title: "What training approach fits me?",
    description:
      "Rule-based recommendations for goal, experience, schedule, recovery, equipment, sport, and preferences.",
    url: "/fit",
  },
};

export default async function FitPage({ searchParams }: FitPageProps) {
  const params = await searchParams;
  const hasQuery = isCompleteFitQuery(params);
  const inputs = parseFitSearchParams(params);
  const result = hasQuery ? recommendApproach(inputs) : null;

  return (
    <MarketingContainer>
      <PageIntro
        eyebrow="Find a fit"
        title="What training approach fits me?"
        description="Answer a few questions about goal, experience, schedule, and equipment. Get a primary approach and an alternative, with tradeoffs and a sample structure."
      />
      <div className="mt-8">
        <FitExperience
          initialInputs={inputs}
          initialResult={result}
          hasQuery={hasQuery}
        />
      </div>
    </MarketingContainer>
  );
}
