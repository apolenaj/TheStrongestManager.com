import type { Metadata } from "next";
import { AnalyticsBeacon } from "@/components/analytics/AnalyticsBeacon";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { PricingExperience } from "@/components/marketing/PricingExperience";
import { PageIntro } from "@/components/ui/PageIntro";
import { getPricingPageView } from "@/services/billing/billing-service";
import { resolvePricingFreeCtaLabel } from "@/services/growth-experiments";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Free, Pro, and Performance plans with features, limits, monthly and annual prices, and clear cancellation. Self-serve checkout when Stripe is configured.",
  alternates: { canonical: "/pricing" },
};

export default async function PricingPage() {
  const view = getPricingPageView();
  const freeCtaLabel = await resolvePricingFreeCtaLabel();

  return (
    <MarketingContainer>
      <AnalyticsBeacon
        name="pricing_viewed"
        checkoutEnabled={view.checkoutEnabled}
      />
      <PageIntro
        eyebrow="Plans"
        title="Pricing"
        description="Compare Free, Pro, and Performance. Cancel anytime. Monthly is the default; annual is optional. Elite Coaching is listed as a future option — not self-serve checkout today."
      />
      <div className="mt-10">
        <PricingExperience view={view} freeCtaLabel={freeCtaLabel} />
      </div>
    </MarketingContainer>
  );
}
