import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { AffiliateHubPanel } from "@/components/affiliate-system/AffiliateHubPanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { Alert, ButtonLink } from "@/design-system";
import { AFFILIATE_HONESTY } from "@/domain/affiliate-system";
import { featureFlags } from "@/config/feature-flags";
import { requireSession } from "@/services/auth/session";
import { getAffiliateHubView } from "@/services/affiliate-system";

export const metadata: Metadata = {
  title: "Affiliates",
  robots: { index: false, follow: false },
};

export default async function AffiliateHubPage() {
  const session = await requireSession();

  if (!featureFlags.affiliateSystem) {
    return (
      <AppPage
        eyebrow="Growth"
        title="Affiliates"
        description="Creator, coach, and partner tracking — disclosure required."
      >
        <Alert tone="warning" title="Feature off">
          Enable NEXT_PUBLIC_FF_AFFILIATE_SYSTEM.
        </Alert>
      </AppPage>
    );
  }

  const result = await getAffiliateHubView({ userId: session.user.id });

  return (
    <FeatureGate
      flag="affiliateSystem"
      title="Affiliates"
      description="Affiliate System is behind a feature flag."
    >
      <AppPage
        eyebrow="Growth"
        title="Affiliates"
        description={AFFILIATE_HONESTY[0]}
      >
        <div className="mb-6">
          <ButtonLink href="/affiliates" variant="secondary">
            Public directory
          </ButtonLink>
        </div>
        {result.ok ? (
          <AffiliateHubPanel view={result.view} />
        ) : (
          <Alert tone="danger" title="Unavailable">
            {result.error}
          </Alert>
        )}
      </AppPage>
    </FeatureGate>
  );
}
