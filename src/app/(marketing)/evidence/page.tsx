import type { Metadata } from "next";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { EvidenceQualitySystemPanel } from "@/components/evidence-quality/EvidenceQualitySystemPanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { PageIntro } from "@/components/ui/PageIntro";
import { EVIDENCE_QUALITY_HONESTY } from "@/domain/evidence-quality";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Evidence Quality System",
  description:
    "How TheStrongestManager labels content evidence: strong, moderate, and limited research — plus coaching consensus, historical method, and heuristic. Research evidence stays separate from expert practice.",
  alternates: { canonical: "/evidence" },
  openGraph: {
    title: "Evidence Quality System",
    description: EVIDENCE_QUALITY_HONESTY[0],
    url: "/evidence",
    type: "website",
  },
};

export default function EvidenceQualityPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Evidence Quality System",
    description: EVIDENCE_QUALITY_HONESTY[0],
    url: `https://${siteConfig.domain}/evidence`,
  };

  return (
    <FeatureGate
      flag="evidenceQualitySystem"
      title="Evidence Quality System"
      description="Evidence Quality System is behind a feature flag."
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
            eyebrow="Content honesty"
            title="Evidence Quality System"
            description="Labels that separate research evidence from expert practice — without faking scientific certainty. Real citations link when they exist."
          />
        </div>
        <div className="mt-10">
          <EvidenceQualitySystemPanel />
        </div>
      </MarketingContainer>
    </FeatureGate>
  );
}
