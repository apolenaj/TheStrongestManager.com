import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AthleteAssessmentFunnel } from "@/components/athlete-assessment/AthleteAssessmentFunnel";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { PageIntro } from "@/components/ui/PageIntro";
import { featureFlags } from "@/config/feature-flags";
import {
  ATHLETE_ASSESSMENT_HONESTY,
  ATHLETE_ASSESSMENT_NOT_FULL_LABEL,
  ATHLETE_ASSESSMENT_SELF_LABEL,
  evaluateAthleteAssessmentQuality,
} from "@/domain/athlete-assessment";

export const metadata: Metadata = {
  title: "Free athlete assessment",
  description:
    "Answer limited questions for a Self-assessment estimate — Not full Athlete Score. Create an account for a real data-driven Athlete Score from logged training.",
  alternates: { canonical: "/athlete-assessment" },
  openGraph: {
    title: "Free athlete assessment",
    description:
      "Partial profile from self-report. Not full Athlete Score — unlock the real score with an account.",
    url: "/athlete-assessment",
  },
};

export default function AthleteAssessmentPage() {
  if (!featureFlags.athleteAssessment) {
    return (
      <MarketingContainer>
        <ComingSoon
          title="Free athlete assessment"
          description="This acquisition tool is not enabled yet."
          reason="Ships behind NEXT_PUBLIC_FF_ATHLETE_ASSESSMENT."
        />
      </MarketingContainer>
    );
  }

  if (!evaluateAthleteAssessmentQuality().passed) {
    notFound();
  }

  return (
    <MarketingContainer>
      <PageIntro
        eyebrow="Free assessment"
        title="Answer a few questions. Get a partial profile."
        description={`${ATHLETE_ASSESSMENT_SELF_LABEL}. ${ATHLETE_ASSESSMENT_NOT_FULL_LABEL}. Create an account for a real data-driven Athlete Score from logged training.`}
      />
      <div className="mt-10">
        <AthleteAssessmentFunnel />
      </div>
      <section className="mt-14 max-w-2xl">
        <h2 className="font-[family-name:var(--font-display)] text-lg">
          Honesty
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--color-muted)]">
          {ATHLETE_ASSESSMENT_HONESTY.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>
    </MarketingContainer>
  );
}
