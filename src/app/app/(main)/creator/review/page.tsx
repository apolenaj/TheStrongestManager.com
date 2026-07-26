import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { CreatorReviewPanel } from "@/components/creator-program/CreatorReviewPanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { Alert } from "@/design-system";
import { featureFlags } from "@/config/feature-flags";
import { prisma } from "@/lib/db";
import { requireSession } from "@/services/auth/session";
import { listCreatorPartnershipsForStaff } from "@/services/creator-program";

export const metadata: Metadata = {
  title: "Review creators",
  robots: { index: false, follow: false },
};

export default async function CreatorReviewPage() {
  const session = await requireSession();

  if (!featureFlags.creatorProgram) {
    return (
      <AppPage
        eyebrow="Staff"
        title="Review creators"
        description="Approve creator applications."
      >
        <Alert tone="warning" title="Feature off">
          Enable NEXT_PUBLIC_FF_CREATOR_PROGRAM.
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
        title="Review creators"
        description="Staff only."
      >
        <Alert tone="danger" title="Forbidden">
          Only staff can review creator applications.
        </Alert>
      </AppPage>
    );
  }

  const result = await listCreatorPartnershipsForStaff({
    actorUserId: session.user.id,
  });

  return (
    <FeatureGate
      flag="creatorProgram"
      title="Review creators"
      description="Creator Program is behind a feature flag."
    >
      <AppPage
        eyebrow="Staff"
        title="Review creators"
        description="Approve applications. Do not imply partnership until approved."
      >
        {result.ok ? (
          <CreatorReviewPanel applications={result.applications} />
        ) : (
          <Alert tone="danger" title="Unavailable">
            {result.error}
          </Alert>
        )}
      </AppPage>
    </FeatureGate>
  );
}
