import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { AffiliateReviewPanel } from "@/components/affiliate-system/AffiliateReviewPanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { Alert } from "@/design-system";
import { featureFlags } from "@/config/feature-flags";
import { prisma } from "@/lib/db";
import { requireSession } from "@/services/auth/session";
import { listPendingAffiliatePartnersForStaff } from "@/services/affiliate-system";

export const metadata: Metadata = {
  title: "Review affiliates",
  robots: { index: false, follow: false },
};

export default async function AffiliateReviewPage() {
  const session = await requireSession();

  if (!featureFlags.affiliateSystem) {
    return (
      <AppPage
        eyebrow="Staff"
        title="Review affiliates"
        description="Activate creator, coach, and partner profiles."
      >
        <Alert tone="warning" title="Feature off">
          Enable NEXT_PUBLIC_FF_AFFILIATE_SYSTEM.
        </Alert>
      </AppPage>
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  });
  if (!user?.isAdmin) {
    return (
      <AppPage
        eyebrow="Staff"
        title="Review affiliates"
        description="Staff only."
      >
        <Alert tone="danger" title="Forbidden">
          Only staff can review affiliate partners.
        </Alert>
      </AppPage>
    );
  }

  const result = await listPendingAffiliatePartnersForStaff({
    actorUserId: session.user.id,
  });

  return (
    <FeatureGate
      flag="affiliateSystem"
      title="Review affiliates"
      description="Affiliate System is behind a feature flag."
    >
      <AppPage
        eyebrow="Staff"
        title="Review affiliates"
        description="Activate partners. Public listings always require disclosure."
      >
        {result.ok ? (
          <AffiliateReviewPanel partners={result.partners} />
        ) : (
          <Alert tone="danger" title="Unavailable">
            {result.error}
          </Alert>
        )}
      </AppPage>
    </FeatureGate>
  );
}
