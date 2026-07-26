import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { PersonalizationEnginePanel } from "@/components/personalization/PersonalizationEnginePanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { Alert } from "@/design-system";
import { requireSession } from "@/services/auth/session";
import { getPersonalizationPlan } from "@/services/personalization";

export const metadata: Metadata = {
  title: "Personalization",
  robots: { index: false, follow: false },
};

export default async function PersonalizationPage() {
  const session = await requireSession();
  const result = await getPersonalizationPlan({ userId: session.user.id });

  return (
    <FeatureGate
      flag="personalizationEngine"
      title="Personalization"
      description="Personalization engine is behind a feature flag."
    >
      <AppPage
        eyebrow="Engine"
        title="Personalization engine"
        description="Central ranking for dashboard, recommendations, programs, exercise alternatives, content, and notifications — never pricing from sensitive characteristics."
      >
        {!result.ok ? (
          <Alert tone="warning" title="Unavailable">
            {result.error}
          </Alert>
        ) : (
          <PersonalizationEnginePanel plan={result.plan} />
        )}
      </AppPage>
    </FeatureGate>
  );
}
