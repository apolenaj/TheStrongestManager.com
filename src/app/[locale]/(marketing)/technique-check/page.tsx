import type { Metadata } from "next";
import { TechniqueCheckFunnel } from "@/components/technique-check/TechniqueCheckFunnel";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { PageIntro } from "@/components/ui/PageIntro";
import { featureFlags } from "@/config/feature-flags";
import {
  TECHNIQUE_CHECK_HONESTY,
  evaluateTechniqueCheckQuality,
} from "@/domain/technique-check";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Free technique check",
  description:
    "Upload one lift for a basic in-browser analysis and limited insight — then create an account to save the full private report. Video is not uploaded for the free check.",
  alternates: { canonical: "/technique-check" },
  openGraph: {
    title: "Free technique check",
    description:
      "Get limited technique insight before signup. Guest video stays in your browser.",
    url: "/technique-check",
  },
};

export default function TechniqueCheckPage() {
  if (!featureFlags.techniqueCheck) {
    return (
      <MarketingContainer>
        <ComingSoon
          title="Free technique check"
          description="This acquisition funnel is not enabled yet."
          reason="Ships behind NEXT_PUBLIC_FF_TECHNIQUE_CHECK."
        />
      </MarketingContainer>
    );
  }

  if (!evaluateTechniqueCheckQuality().passed) {
    notFound();
  }

  return (
    <MarketingContainer>
      <PageIntro
        eyebrow="Free check"
        title="Upload one lift. Get limited insight."
        description="Basic deadlift analysis runs in your browser — no account required to see value. Create an account only when you want to save the full private report."
      />
      <div className="mt-10">
        <TechniqueCheckFunnel />
      </div>
      <section className="mt-14 max-w-2xl">
        <h2 className="font-[family-name:var(--font-display)] text-lg">
          How we keep this honest
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--color-muted)]">
          {TECHNIQUE_CHECK_HONESTY.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>
    </MarketingContainer>
  );
}
