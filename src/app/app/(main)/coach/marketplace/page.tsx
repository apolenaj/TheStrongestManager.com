import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { CoachMarketplaceControls } from "@/components/marketplace/CoachMarketplaceControls";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { EmptyState } from "@/design-system";
import { requireSession } from "@/services/auth/session";
import { getCoachMarketplaceWorkspace } from "@/services/marketplace";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Marketplace listing",
  robots: { index: false, follow: false },
};

export default async function CoachMarketplacePage() {
  const session = await requireSession();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isCoach: true },
  });

  return (
    <FeatureGate
      flag="coachMarketplace"
      title="Coach marketplace"
      description="Marketplace listing tools are behind a feature flag."
    >
      <AppPage
        eyebrow="Coach"
        title="Marketplace listing"
        description="Set availability, pricing, and specializations. Athletes request consultations — no payments yet."
      >
        {!user?.isCoach ? (
          <EmptyState
            title="Coach Mode required"
            description="Enable Coach Mode on your account before publishing a marketplace listing."
          />
        ) : (
          <CoachMarketplaceControls
            view={await getCoachMarketplaceWorkspace(session.user.id)}
          />
        )}
      </AppPage>
    </FeatureGate>
  );
}
