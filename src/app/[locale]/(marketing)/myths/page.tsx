import type { Metadata } from "next";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { MythVsRealityIndex } from "@/components/myth-vs-reality/MythVsReality";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { PageIntro } from "@/components/ui/PageIntro";
import {
  MYTH_VS_REALITY_HONESTY,
  MYTH_VS_REALITY_INDEX_DESCRIPTION,
} from "@/domain/myth-vs-reality";
import { getMythVsRealityOverview } from "@/services/myth-vs-reality";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Myth vs Reality",
  description: MYTH_VS_REALITY_INDEX_DESCRIPTION,
  alternates: { canonical: "/myths" },
  openGraph: {
    title: "Myth vs Reality",
    description: MYTH_VS_REALITY_HONESTY[0],
    url: "/myths",
    type: "website",
  },
};

export default async function MythVsRealityIndexPage() {
  const overview = await getMythVsRealityOverview();
  const entries = overview.ok ? overview.entries : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Myth vs Reality",
    description: MYTH_VS_REALITY_INDEX_DESCRIPTION,
    url: `https://${siteConfig.domain}/myths`,
  };

  return (
    <FeatureGate
      flag="mythVsRealityEngine"
      title="Myth vs Reality"
      description="Myth vs Reality is behind a feature flag."
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
            eyebrow="Training myths"
            title="Myth vs Reality"
            description={MYTH_VS_REALITY_INDEX_DESCRIPTION}
          />
        </div>
        <div className="mt-10">
          <MythVsRealityIndex entries={entries} />
        </div>
      </MarketingContainer>
    </FeatureGate>
  );
}
