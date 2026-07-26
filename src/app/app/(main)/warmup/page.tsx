import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { WarmupGeneratorPanel } from "@/components/warmup-generator/WarmupGeneratorPanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { ButtonLink, EmptyState } from "@/design-system";
import { requireSession } from "@/services/auth/session";
import { getWarmupGeneratorData } from "@/services/warmup-generator";

export const metadata: Metadata = {
  title: "Warm-up generator",
  robots: { index: false, follow: false },
};

export default async function WarmupGeneratorPage() {
  const session = await requireSession();
  const data = await getWarmupGeneratorData(session.user.id);

  return (
    <FeatureGate
      flag="warmupGenerator"
      title="Warm-up generator"
      description="Warm-up planning is behind a feature flag."
    >
      <AppPage
        eyebrow="Training"
        title="Warm-up generator"
        description="Progressive warm-ups from target working weight, exercise, and recent history — conservative defaults you can edit."
      >
        {!data ? (
          <EmptyState
            title="No athlete profile yet"
            description="Complete onboarding, then return to plan warm-ups."
            action={
              <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
            }
          />
        ) : (
          <WarmupGeneratorPanel data={data} />
        )}
      </AppPage>
    </FeatureGate>
  );
}
