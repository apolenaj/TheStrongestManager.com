import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { ExperimentModePanel } from "@/components/experiment-mode/ExperimentModePanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { Alert } from "@/design-system";
import {
  EXPERIMENT_MODE_HONESTY,
  EXPERIMENT_MODE_PRODUCT_NAME,
} from "@/domain/experiment-mode";
import { requireSession } from "@/services/auth/session";
import { listPersonalTrainingExperiments } from "@/services/experiment-mode";
import { prisma } from "@/lib/db";
import { featureFlags } from "@/config/feature-flags";

export const metadata: Metadata = {
  title: "Experiment Mode",
  robots: { index: false, follow: false },
};

export default async function ExperimentsPage() {
  const session = await requireSession();

  if (!featureFlags.experimentMode) {
    return (
      <AppPage
        eyebrow="Training"
        title="Experiment Mode"
        description="Personal training experiments."
      >
        <Alert tone="warning" title="Experiment Mode off">
          Enable NEXT_PUBLIC_FF_EXPERIMENT_MODE.
        </Alert>
      </AppPage>
    );
  }

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!profile) {
    return (
      <AppPage
        eyebrow="Training"
        title="Experiment Mode"
        description={EXPERIMENT_MODE_HONESTY[0]}
      >
        <Alert tone="info" title="Onboarding needed">
          Complete onboarding to create a personal training experiment.
        </Alert>
      </AppPage>
    );
  }

  const listed = await listPersonalTrainingExperiments(profile.id);
  const experiments = listed.ok ? listed.experiments : [];

  return (
    <FeatureGate
      flag="experimentMode"
      title="Experiment Mode"
      description="Experiment Mode is behind a feature flag."
    >
      <AppPage
        eyebrow="Training"
        title="Experiment Mode"
        description={`${EXPERIMENT_MODE_PRODUCT_NAME}s — ${EXPERIMENT_MODE_HONESTY[0]}`}
      >
        <ExperimentModePanel experiments={experiments} />
      </AppPage>
    </FeatureGate>
  );
}
