import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { AffiliateLandingContinue } from "@/components/affiliate-system/AffiliateLandingContinue";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { Alert } from "@/design-system";
import { featureFlags } from "@/config/feature-flags";
import { getAffiliateLandingByCode } from "@/services/affiliate-system";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  return {
    title: "Affiliate link",
    description: "Disclosed affiliate tracking link.",
    robots: { index: false, follow: false },
    alternates: { canonical: `/a/${code}` },
  };
}

export default async function AffiliateLandingPage({ params }: Props) {
  const { code } = await params;

  if (!featureFlags.affiliateSystem) {
    return (
      <MarketingContainer>
        <ComingSoon
          title="Affiliate link"
          description="Affiliate tracking is not enabled."
        />
      </MarketingContainer>
    );
  }

  const landing = await getAffiliateLandingByCode(code);
  if (!landing.ok) {
    if (landing.error === "Invalid tracking code.") notFound();
    return (
      <MarketingContainer>
        <div className="mx-auto max-w-xl py-12">
          <Alert tone="warning" title="Link unavailable">
            {landing.error}
          </Alert>
        </div>
      </MarketingContainer>
    );
  }

  return (
    <MarketingContainer>
      <div className="mx-auto max-w-xl py-12">
        <AffiliateLandingContinue
          code={code}
          displayName={landing.displayName}
          partnerTypeLabel={landing.partnerTypeLabel}
          disclosure={landing.disclosure}
          disclosureShort={landing.disclosureShort}
        />
      </div>
    </MarketingContainer>
  );
}
