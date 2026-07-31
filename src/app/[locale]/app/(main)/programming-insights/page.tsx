import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { AbProgrammingInsightsPanel } from "@/components/ab-programming-insights/AbProgrammingInsightsPanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { Alert } from "@/design-system";
import { AB_PROGRAMMING_INSIGHTS_HONESTY } from "@/domain/ab-programming-insights";
import { requireSession } from "@/services/auth/session";
import { getAbProgrammingInsightsOverview } from "@/services/ab-programming-insights";
import { featureFlags } from "@/config/feature-flags";

export const metadata: Metadata = {
  title: "A/B Programming Insights",
  robots: { index: false, follow: false },
};

export default async function AbProgrammingInsightsPage() {
  await requireSession();

  if (!featureFlags.abProgrammingInsights) {
    return (
      <AppPage
        eyebrow="Programming"
        title="A/B Programming Insights"
        description="Anonymized aggregate architecture."
      >
        <Alert tone="warning" title="Insights off">
          Enable NEXT_PUBLIC_FF_AB_PROGRAMMING_INSIGHTS.
        </Alert>
      </AppPage>
    );
  }

  const result = await getAbProgrammingInsightsOverview();
  if (!result.ok) {
    return (
      <AppPage
        eyebrow="Programming"
        title="A/B Programming Insights"
        description=""
      >
        <Alert tone="danger" title="Unavailable">
          {result.error}
        </Alert>
      </AppPage>
    );
  }

  return (
    <FeatureGate
      flag="abProgrammingInsights"
      title="A/B Programming Insights"
      description="A/B Programming Insights is behind a feature flag."
    >
      <AppPage
        eyebrow="Programming"
        title="A/B Programming Insights"
        description={AB_PROGRAMMING_INSIGHTS_HONESTY[0]}
      >
        <AbProgrammingInsightsPanel overview={result.overview} />
      </AppPage>
    </FeatureGate>
  );
}
