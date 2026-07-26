import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { TrainingStyleProfilerPanel } from "@/components/training-style/TrainingStyleProfilerPanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { Alert } from "@/design-system";
import { requireSession } from "@/services/auth/session";
import { getTrainingStyleProfile } from "@/services/training-style";

export const metadata: Metadata = {
  title: "Training style",
  robots: { index: false, follow: false },
};

export default async function TrainingStylePage() {
  const session = await requireSession();
  const result = await getTrainingStyleProfile({ userId: session.user.id });

  return (
    <FeatureGate
      flag="trainingStyleProfiler"
      title="Training style"
      description="Training preference profiler is behind a feature flag."
    >
      <AppPage
        eyebrow="Preferences"
        title="Training style profiler"
        description="Practical intensity, frequency, and volume preferences from your choices and training — not personality psychology."
      >
        {!result.ok ? (
          <Alert tone="warning" title="Unavailable">
            {result.error}
          </Alert>
        ) : (
          <TrainingStyleProfilerPanel profile={result.profile} />
        )}
      </AppPage>
    </FeatureGate>
  );
}
