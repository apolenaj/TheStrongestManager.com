import type { Metadata } from "next";
import Link from "next/link";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { AnalyticsBeacon } from "@/components/analytics/AnalyticsBeacon";
import { Alert, ButtonLink } from "@/design-system";
import {
  PREMIUM_COACHING_HONESTY,
  PREMIUM_COACHING_STAGE_LABELS,
  premiumCoachingFunnelSteps,
} from "@/domain/premium-coaching-sales";
import { featureFlags } from "@/config/feature-flags";
import { ComingSoon } from "@/components/ui/ComingSoon";

export const metadata: Metadata = {
  title: "Premium coaching",
  description:
    "Apply for premium human coaching — applications are reviewed; acceptance is never promised.",
  alternates: { canonical: "/coaching/premium" },
};

export default function PremiumCoachingLandingPage() {
  if (!featureFlags.premiumCoachingSales) {
    return (
      <MarketingContainer>
        <ComingSoon
          title="Premium coaching"
          description="The premium coaching application funnel is not enabled yet."
        />
      </MarketingContainer>
    );
  }

  const steps = premiumCoachingFunnelSteps();

  return (
    <MarketingContainer>
      <AnalyticsBeacon
        name="premium_coaching_landing_viewed"
        checkoutEnabled={false}
      />
      <div className="mx-auto grid max-w-3xl gap-10 py-12">
        <header className="grid gap-4">
          <p className="text-sm uppercase tracking-wide text-[var(--color-muted)]">
            Premium coaching
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight md:text-5xl">
            TheStrongest
          </h1>
          <p className="text-lg text-[var(--color-muted)]">
            Apply for a reviewed coaching engagement. Tell us your goal,
            experience, budget range, and availability — then our team reviews
            applications.
          </p>
          <Alert tone="warning" title="No acceptance promise">
            {PREMIUM_COACHING_HONESTY[0]}
          </Alert>
        </header>

        <section className="grid gap-3">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
            How it works
          </h2>
          <ol className="grid gap-3">
            {steps.map((step, i) => (
              <li
                key={step}
                className="flex gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4"
              >
                <span className="font-semibold text-[var(--color-accent)]">
                  {i + 1}.
                </span>
                <span>
                  <span className="font-medium">
                    {PREMIUM_COACHING_STAGE_LABELS[step]}
                  </span>
                  <span className="mt-1 block text-sm text-[var(--color-muted)]">
                    {step === "applied" &&
                      "You submit goal, experience, budget, and availability."}
                    {step === "in_review" &&
                      "Staff or coaches review fit — not automatic acceptance."}
                    {step === "consultation" &&
                      "A conversation opportunity if invited — not enrollment."}
                    {step === "offer" &&
                      "A proposed engagement you may accept or decline."}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/coaching/premium/apply">Apply</ButtonLink>
          <ButtonLink href="/app/premium-coaching" variant="secondary">
            Check application status
          </ButtonLink>
          <ButtonLink href="/coaching" variant="ghost">
            Browse marketplace
          </ButtonLink>
        </div>

        <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
          {PREMIUM_COACHING_HONESTY.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>

        <p className="text-sm text-[var(--color-muted)]">
          Looking for organic coach fit instead?{" "}
          <Link href="/coaching/match" className="underline underline-offset-2">
            Try coach matching
          </Link>
          .
        </p>
      </div>
    </MarketingContainer>
  );
}
