import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { ProgramMarketplaceReviewPanel } from "@/components/program-marketplace/ProgramMarketplaceReviewPanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { Alert } from "@/design-system";
import { featureFlags } from "@/config/feature-flags";
import { prisma } from "@/lib/db";
import { requireSession } from "@/services/auth/session";
import { listProgramMarketplaceForStaff } from "@/services/program-marketplace";

export const metadata: Metadata = {
  title: "Review program listings",
  robots: { index: false, follow: false },
};

export default async function ProgramMarketplaceReviewPage() {
  const session = await requireSession();

  if (!featureFlags.programMarketplace) {
    return (
      <AppPage
        eyebrow="Staff"
        title="Review program listings"
        description="Copyright review for marketplace programs."
      >
        <Alert tone="warning" title="Feature off">
          Enable NEXT_PUBLIC_FF_PROGRAM_MARKETPLACE.
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
        title="Review program listings"
        description="Staff only."
      >
        <Alert tone="danger" title="Forbidden">
          Only staff can review program marketplace listings.
        </Alert>
      </AppPage>
    );
  }

  const result = await listProgramMarketplaceForStaff({
    actorUserId: session.user.id,
  });

  return (
    <FeatureGate
      flag="programMarketplace"
      title="Review program listings"
      description="Program Marketplace is behind a feature flag."
    >
      <AppPage
        eyebrow="Staff"
        title="Review program listings"
        description="Publish after copyright review. Reject unauthorized copyrighted uploads."
      >
        {result.ok ? (
          <ProgramMarketplaceReviewPanel listings={result.listings} />
        ) : (
          <Alert tone="danger" title="Unavailable">
            {result.error}
          </Alert>
        )}
      </AppPage>
    </FeatureGate>
  );
}
