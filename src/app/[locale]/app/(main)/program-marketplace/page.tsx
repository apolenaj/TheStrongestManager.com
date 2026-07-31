import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { ProgramCreatorPublishPanel } from "@/components/program-marketplace/ProgramCreatorPublishPanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { Alert, ButtonLink } from "@/design-system";
import { PROGRAM_MARKETPLACE_HONESTY } from "@/domain/program-marketplace";
import { featureFlags } from "@/config/feature-flags";
import { requireSession } from "@/services/auth/session";
import { listCreatorProgramMarketplaceListings } from "@/services/program-marketplace";

export const metadata: Metadata = {
  title: "Program marketplace",
  robots: { index: false, follow: false },
};

export default async function ProgramMarketplaceCreatorPage() {
  const session = await requireSession();

  if (!featureFlags.programMarketplace) {
    return (
      <AppPage
        eyebrow="Growth"
        title="Program marketplace"
        description="Publish training programs after Creator Program approval."
      >
        <Alert tone="warning" title="Feature off">
          Enable NEXT_PUBLIC_FF_PROGRAM_MARKETPLACE.
        </Alert>
      </AppPage>
    );
  }

  const result = await listCreatorProgramMarketplaceListings({
    userId: session.user.id,
  });

  return (
    <FeatureGate
      flag="programMarketplace"
      title="Program marketplace"
      description="Program Marketplace is behind a feature flag."
    >
      <AppPage
        eyebrow="Growth"
        title="Program marketplace"
        description={PROGRAM_MARKETPLACE_HONESTY[0]}
      >
        <div className="mb-6 flex flex-wrap gap-3">
          <ButtonLink href="/programs/marketplace" variant="secondary">
            Public browse
          </ButtonLink>
          <ButtonLink href="/app/creator" variant="ghost">
            Creator Program
          </ButtonLink>
        </div>
        {result.ok ? (
          <ProgramCreatorPublishPanel
            listings={result.listings}
            canPublish={result.canPublish}
          />
        ) : (
          <Alert tone="danger" title="Unavailable">
            {result.error}
          </Alert>
        )}
      </AppPage>
    </FeatureGate>
  );
}
