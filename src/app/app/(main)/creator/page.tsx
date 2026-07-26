import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { CreatorHubPanel } from "@/components/creator-program/CreatorHubPanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { Alert } from "@/design-system";
import { CREATOR_HONESTY } from "@/domain/creator-program";
import { featureFlags } from "@/config/feature-flags";
import { requireSession } from "@/services/auth/session";
import { getCreatorProgramView } from "@/services/creator-program";

export const metadata: Metadata = {
  title: "Creator Program",
  robots: { index: false, follow: false },
};

export default async function CreatorProgramPage() {
  const session = await requireSession();

  if (!featureFlags.creatorProgram) {
    return (
      <AppPage
        eyebrow="Growth"
        title="Creator Program"
        description="Future creator partnerships — approval required."
      >
        <Alert tone="warning" title="Feature off">
          Enable NEXT_PUBLIC_FF_CREATOR_PROGRAM.
        </Alert>
      </AppPage>
    );
  }

  const result = await getCreatorProgramView({ userId: session.user.id });

  return (
    <FeatureGate
      flag="creatorProgram"
      title="Creator Program"
      description="Creator Program is behind a feature flag."
    >
      <AppPage
        eyebrow="Growth"
        title="Creator Program"
        description={CREATOR_HONESTY[0]}
      >
        {result.ok ? (
          <CreatorHubPanel view={result.view} />
        ) : (
          <Alert tone="danger" title="Unavailable">
            {result.error}
          </Alert>
        )}
      </AppPage>
    </FeatureGate>
  );
}
