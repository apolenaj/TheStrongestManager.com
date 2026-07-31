import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { ExerciseRelationshipGraphPanel } from "@/components/exercise-relationship-graph/ExerciseRelationshipGraphPanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { Alert } from "@/design-system";
import { requireSession } from "@/services/auth/session";
import { getExerciseGraphOverview } from "@/services/exercise-relationship-graph";

export const metadata: Metadata = {
  title: "Exercise Relationship Graph",
  robots: { index: false, follow: false },
};

export default async function ExerciseRelationshipGraphPage() {
  await requireSession();
  const result = await getExerciseGraphOverview();

  return (
    <FeatureGate
      flag="exerciseRelationshipGraph"
      title="Exercise Relationship Graph"
      description="Exercise Relationship Graph is behind a feature flag."
    >
      <AppPage
        eyebrow="Knowledge graph"
        title="Exercise Relationship Graph"
        description="Typed edges only: variation, muscles, weak point, sport, method, technique issue. Improves recommendations, SEO, and related content — never invents arbitrary links."
      >
        {!result.ok ? (
          <Alert tone="warning" title="Unavailable">
            {result.error}
          </Alert>
        ) : (
          <ExerciseRelationshipGraphPanel graph={result.graph} />
        )}
      </AppPage>
    </FeatureGate>
  );
}
