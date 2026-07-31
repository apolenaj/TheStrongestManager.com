import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { BodybuildingModePanel } from "@/components/bodybuilding-mode/BodybuildingModePanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { Alert } from "@/design-system";
import { requireSession } from "@/services/auth/session";
import { getBodybuildingMode } from "@/services/bodybuilding-mode";

export const metadata: Metadata = {
  title: "Bodybuilding Mode",
  robots: { index: false, follow: false },
};

export default async function BodybuildingModePage() {
  const session = await requireSession();
  const result = await getBodybuildingMode({ userId: session.user.id });

  return (
    <FeatureGate
      flag="bodybuildingMode"
      title="Bodybuilding Mode"
      description="Bodybuilding Mode is behind a feature flag."
    >
      <AppPage
        eyebrow="Sport mode"
        title="Bodybuilding Mode"
        description="Muscle groups, weekly volume, exercise progression, bodyweight, and training performance — no fake growth scores; photos optional and private."
      >
        {!result.ok ? (
          <Alert tone="warning" title="Unavailable">
            {result.error}
          </Alert>
        ) : (
          <BodybuildingModePanel mode={result.mode} />
        )}
      </AppPage>
    </FeatureGate>
  );
}
