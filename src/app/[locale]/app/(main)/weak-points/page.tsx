import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { WeakPointIntelligencePanel } from "@/components/weak-point-intelligence/WeakPointIntelligencePanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { ButtonLink, EmptyState } from "@/design-system";
import { requireSession } from "@/services/auth/session";
import { getWeakPointIntelligence } from "@/services/weak-point-intelligence";

export const metadata: Metadata = {
  title: "Weak points",
  robots: { index: false, follow: false },
};

export default async function WeakPointsPage() {
  const session = await requireSession();
  const view = await getWeakPointIntelligence(session.user.id);

  return (
    <FeatureGate
      flag="weakPointIntelligence"
      title="Weak Point Intelligence"
      description="Evidence-backed weak-point detection is behind a feature flag."
    >
      <AppPage
        eyebrow="Intelligence"
        title="Weak points"
        description="Potential weaknesses with evidence, confidence, and recommended validation — never from appearance alone."
      >
        {!view ? (
          <EmptyState
            title="No athlete profile yet"
            description="Complete onboarding so technique, lifts, and recovery can inform weak-point findings."
            action={
              <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
            }
          />
        ) : (
          <WeakPointIntelligencePanel result={view.result} />
        )}
      </AppPage>
    </FeatureGate>
  );
}
