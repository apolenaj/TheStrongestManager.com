import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { InjuryModificationPanel } from "@/components/injury-modification/InjuryModificationPanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { Alert, ButtonLink, EmptyState } from "@/design-system";
import { INJURY_MODIFICATION_HEALTHCARE_DISCLAIMER } from "@/domain/injury-modification";
import { requireSession } from "@/services/auth/session";
import { getInjuryModificationView } from "@/services/injury-modification";
import { featureFlags } from "@/config/feature-flags";

export const metadata: Metadata = {
  title: "Injury modification",
  robots: { index: false, follow: false },
};

export default async function InjuryModificationPage() {
  const session = await requireSession();

  if (!featureFlags.injuryModification) {
    return (
      <AppPage
        eyebrow="Training"
        title="Injury modification"
        description="User-declared limitations — not a diagnosis."
      >
        <Alert tone="warning" title="Feature off">
          Enable NEXT_PUBLIC_FF_INJURY_MODIFICATION.
        </Alert>
      </AppPage>
    );
  }

  const result = await getInjuryModificationView({
    userId: session.user.id,
  });

  return (
    <FeatureGate
      flag="injuryModification"
      title="Injury modification"
      description="Injury-Modification Architecture is behind a feature flag."
    >
      <AppPage
        eyebrow="Training"
        title="Injury modification"
        description={INJURY_MODIFICATION_HEALTHCARE_DISCLAIMER}
      >
        {result.ok ? (
          <InjuryModificationPanel view={result.view} />
        ) : result.error === "No athlete profile." ? (
          <EmptyState
            title="No athlete profile yet"
            description="Complete onboarding before declaring training limitations."
            action={
              <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
            }
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
