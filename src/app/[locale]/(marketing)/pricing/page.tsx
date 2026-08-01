import type { Metadata } from "next";
import { Suspense } from "react";
import { getLocale } from "next-intl/server";
import { AnalyticsBeacon } from "@/components/analytics/AnalyticsBeacon";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { PricingHub } from "@/components/marketing/PricingHub";
import { PageIntro } from "@/components/ui/PageIntro";
import { getPricingPageView } from "@/services/billing/billing-service";
import { resolvePricingFreeCtaLabel } from "@/services/growth-experiments";
import { listPaidProgramsForPricing } from "@/services/program-commerce/checkout-service";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "One-time training programs, recurring platform plans, and coaching applications — clearly separated.",
  alternates: { canonical: "/pricing" },
};

export default async function PricingPage() {
  const locale = await getLocale();
  const [platformView, freeCtaLabel, programPricing] = await Promise.all([
    Promise.resolve(getPricingPageView(locale)),
    resolvePricingFreeCtaLabel(),
    listPaidProgramsForPricing(),
  ]);

  return (
    <MarketingContainer>
      <AnalyticsBeacon
        name="pricing_viewed"
        checkoutEnabled={
          platformView.checkoutEnabled || programPricing.checkoutEnabled
        }
      />
      <PageIntro
        eyebrow="Commerce"
        title="Pricing"
        description="Programs are one-time purchases. Platform plans are subscriptions. Coaching is application-based. No fake scarcity."
      />
      <div className="mt-10">
        <Suspense
          fallback={
            <p className="text-sm text-[var(--color-muted)]">Loading pricing…</p>
          }
        >
          <PricingHub
            platformView={platformView}
            freeCtaLabel={freeCtaLabel}
            programs={programPricing.programs}
            programHonesty={programPricing.honesty}
            programsCheckoutEnabled={programPricing.checkoutEnabled}
          />
        </Suspense>
      </div>
    </MarketingContainer>
  );
}
