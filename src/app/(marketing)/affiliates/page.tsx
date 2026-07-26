import type { Metadata } from "next";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { AffiliateDirectory } from "@/components/affiliate-system/AffiliateDirectory";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { featureFlags } from "@/config/feature-flags";
import { listPublicAffiliateDirectory } from "@/services/affiliate-system";

export const metadata: Metadata = {
  title: "Affiliate partners",
  description:
    "Affiliate partner directory — disclosed relationships only. We may earn a commission.",
  alternates: { canonical: "/affiliates" },
};

export default async function AffiliatesDirectoryPage() {
  if (!featureFlags.affiliateSystem) {
    return (
      <MarketingContainer>
        <ComingSoon
          title="Affiliate partners"
          description="The affiliate partner directory is not enabled yet."
        />
      </MarketingContainer>
    );
  }

  // disclosureVisible: true — page always renders AffiliateDisclosureBanner first.
  const partners = await listPublicAffiliateDirectory({
    disclosureVisible: true,
  });

  return (
    <MarketingContainer>
      <div className="mx-auto grid max-w-3xl gap-8 py-12">
        <header className="grid gap-3">
          <p className="text-sm uppercase tracking-wide text-[var(--color-muted)]">
            Partners
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight">
            TheStrongest
          </h1>
          <p className="text-lg text-[var(--color-muted)]">
            Creators, coaches, and partners with disclosed affiliate
            relationships.
          </p>
        </header>
        <AffiliateDirectory partners={partners} />
      </div>
    </MarketingContainer>
  );
}
