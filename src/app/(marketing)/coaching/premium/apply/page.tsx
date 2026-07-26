import type { Metadata } from "next";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { PremiumCoachingApplyForm } from "@/components/premium-coaching-sales/PremiumCoachingApplyForm";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { Alert, ButtonLink } from "@/design-system";
import { PREMIUM_COACHING_HONESTY } from "@/domain/premium-coaching-sales";
import { featureFlags } from "@/config/feature-flags";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Apply for premium coaching",
  description:
    "Submit a premium coaching application — review does not promise acceptance.",
  alternates: { canonical: "/coaching/premium/apply" },
  robots: { index: false, follow: false },
};

export default async function PremiumCoachingApplyPage() {
  if (!featureFlags.premiumCoachingSales) {
    return (
      <MarketingContainer>
        <ComingSoon
          title="Apply for premium coaching"
          description="Applications are not open yet."
        />
      </MarketingContainer>
    );
  }

  const session = await auth();

  return (
    <MarketingContainer>
      <div className="mx-auto grid max-w-xl gap-8 py-12">
        <header className="grid gap-3">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
            Apply
          </h1>
          <p className="text-[var(--color-muted)]">
            Goal, experience, budget range, and availability.{" "}
            {PREMIUM_COACHING_HONESTY[0]}
          </p>
        </header>

        {!session?.user ? (
          <div className="grid gap-4">
            <Alert tone="info" title="Sign in required">
              Create an account or sign in to submit an application.
            </Alert>
            <ButtonLink href="/login?next=/coaching/premium/apply">
              Sign in to apply
            </ButtonLink>
          </div>
        ) : (
          <PremiumCoachingApplyForm />
        )}
      </div>
    </MarketingContainer>
  );
}
