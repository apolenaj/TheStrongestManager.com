import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { MethodKnowledgeGraphExplorer } from "@/components/training-method-knowledge-graph/MethodKnowledgeGraphExplorer";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { Alert } from "@/design-system";
import { neighborsForMethodGraphNode } from "@/domain/training-method-knowledge-graph";
import { requireSession } from "@/services/auth/session";
import { getMethodKnowledgeGraphOverview } from "@/services/training-method-knowledge-graph";

export const metadata: Metadata = {
  title: "Training Method Knowledge Graph",
  robots: { index: false, follow: false },
};

export default async function MethodKnowledgeGraphPage() {
  await requireSession();
  const result = await getMethodKnowledgeGraphOverview();

  const start = result.ok ? result.graph.featuredPath[0] : null;
  const initialNeighbors =
    start != null
      ? neighborsForMethodGraphNode(start.kind, start.id)
      : [];

  return (
    <FeatureGate
      flag="trainingMethodKnowledgeGraph"
      title="Training Method Knowledge Graph"
      description="Training Method Knowledge Graph is behind a feature flag."
    >
      <AppPage
        eyebrow="Knowledge graph"
        title="Training Method Knowledge Graph"
        description="Explore curated links between methods, coaches, sports, goals, volume and intensity strategies, and recovery demands — educational and accurate, not invented history."
      >
        {!result.ok ? (
          <Alert tone="warning" title="Unavailable">
            {result.error}
          </Alert>
        ) : (
          <MethodKnowledgeGraphExplorer
            graph={result.graph}
            featuredWalk={result.featuredWalk}
            initialNeighbors={initialNeighbors}
          />
        )}
      </AppPage>
    </FeatureGate>
  );
}
