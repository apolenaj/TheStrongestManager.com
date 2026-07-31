import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { ModelImprovementConsentPanel } from "@/components/model-improvement-consent/ModelImprovementConsentPanel";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { featureFlags } from "@/config/feature-flags";
import { requireSession } from "@/services/auth/session";
import { getConsentDashboard } from "@/services/model-improvement-consent";

export const metadata: Metadata = {
  title: "Consent preferences",
  robots: { index: false, follow: false },
};

export default async function ConsentSettingsPage() {
  return (
    <FeatureGate
      flag="modelImprovementConsent"
      title="Consent preferences"
      description="Separate service use, expert review, and research consent appear when this flag is enabled."
    >
      <ConsentSettingsContent />
    </FeatureGate>
  );
}

async function ConsentSettingsContent() {
  const session = await requireSession();
  if (!featureFlags.modelImprovementConsent) {
    return (
      <ComingSoon
        title="Consent preferences"
        description="Unbundled consent UI is not enabled."
        reason="Set NEXT_PUBLIC_FF_MODEL_IMPROVEMENT_CONSENT=true."
      />
    );
  }

  const dashboard = await getConsentDashboard(session.user.id);
  if (!dashboard) {
    return (
      <AppPage
        eyebrow="Privacy"
        title="Consent preferences"
        description="Complete athlete onboarding to manage consent."
      >
        <p className="text-sm text-[var(--color-muted)]">
          Athlete profile required.
        </p>
      </AppPage>
    );
  }

  return (
    <AppPage
      eyebrow="Privacy"
      title="Consent preferences"
      description="Service use, expert review, and research/model improvement are separate — never bundled."
    >
      <ModelImprovementConsentPanel dashboard={dashboard} />
    </AppPage>
  );
}
