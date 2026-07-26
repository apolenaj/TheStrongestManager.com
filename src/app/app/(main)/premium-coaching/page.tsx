import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { PremiumCoachingStatusPanel } from "@/components/premium-coaching-sales/PremiumCoachingStatusPanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { Alert, ButtonLink, EmptyState } from "@/design-system";
import { PREMIUM_COACHING_HONESTY } from "@/domain/premium-coaching-sales";
import { featureFlags } from "@/config/feature-flags";
import { requireSession } from "@/services/auth/session";
import { listMyPremiumCoachingApplications } from "@/services/premium-coaching-sales";

export const metadata: Metadata = {
  title: "Premium coaching application",
  robots: { index: false, follow: false },
};

export default async function PremiumCoachingAppPage() {
  const session = await requireSession();

  if (!featureFlags.premiumCoachingSales) {
    return (
      <AppPage
        eyebrow="Coaching"
        title="Premium coaching"
        description="Application status for the premium coaching funnel."
      >
        <Alert tone="warning" title="Feature off">
          Enable NEXT_PUBLIC_FF_PREMIUM_COACHING_SALES.
        </Alert>
      </AppPage>
    );
  }

  const result = await listMyPremiumCoachingApplications({
    userId: session.user.id,
  });

  return (
    <FeatureGate
      flag="premiumCoachingSales"
      title="Premium coaching"
      description="Premium Coaching Sales Flow is behind a feature flag."
    >
      <AppPage
        eyebrow="Coaching"
        title="Your applications"
        description={PREMIUM_COACHING_HONESTY[0]}
      >
        <div className="mb-6">
          <ButtonLink href="/coaching/premium/apply" variant="secondary">
            New application
          </ButtonLink>
        </div>
        {result.ok ? (
          <PremiumCoachingStatusPanel
            applications={result.applications}
            honesty={result.honesty}
          />
        ) : (
          <EmptyState
            title="Unavailable"
            description={result.error}
            action={
              <ButtonLink href="/coaching/premium">Back to landing</ButtonLink>
            }
          />
        )}
      </AppPage>
    </FeatureGate>
  );
}
