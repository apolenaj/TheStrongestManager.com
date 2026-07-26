import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppPage } from "@/components/app/AppPage";
import { ExperimentDetail } from "@/components/experiment-mode/ExperimentDetail";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { requireSession } from "@/services/auth/session";
import { getPersonalTrainingExperiment } from "@/services/experiment-mode";
import { prisma } from "@/lib/db";
import { featureFlags } from "@/config/feature-flags";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Experiment · ${id}`,
    robots: { index: false, follow: false },
  };
}

export default async function ExperimentDetailPage({ params }: Props) {
  const session = await requireSession();
  const { id } = await params;

  if (!featureFlags.experimentMode) notFound();

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) notFound();

  const result = await getPersonalTrainingExperiment({
    id,
    athleteProfileId: profile.id,
  });
  if (!result.ok) notFound();

  return (
    <FeatureGate
      flag="experimentMode"
      title="Experiment Mode"
      description="Experiment Mode is behind a feature flag."
    >
      <AppPage
        eyebrow="Personal training experiment"
        title={result.experiment.title}
        description={result.experiment.intervention}
      >
        <ExperimentDetail experiment={result.experiment} />
      </AppPage>
    </FeatureGate>
  );
}
