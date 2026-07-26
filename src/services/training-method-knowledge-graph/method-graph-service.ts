/**
 * Training Method Knowledge Graph service — Prompt 110.
 */

import { featureFlags } from "@/config/feature-flags";
import {
  getMethodGraphNode,
  getTrainingMethodKnowledgeGraph,
  neighborsForMethodGraphNode,
  walkFeaturedMethodGraphPath,
  type MethodGraphNeighbor,
  type MethodGraphNode,
  type MethodGraphNodeKind,
  type MethodGraphPathStep,
  type TrainingMethodKnowledgeGraph,
} from "@/domain/training-method-knowledge-graph";

export async function getMethodKnowledgeGraphOverview(): Promise<
  | {
      ok: true;
      graph: TrainingMethodKnowledgeGraph;
      featuredWalk: MethodGraphPathStep[] | null;
    }
  | { ok: false; error: string }
> {
  if (!featureFlags.trainingMethodKnowledgeGraph) {
    return {
      ok: false,
      error: "Training Method Knowledge Graph is not enabled.",
    };
  }
  const graph = getTrainingMethodKnowledgeGraph();
  return {
    ok: true,
    graph,
    featuredWalk: walkFeaturedMethodGraphPath(),
  };
}

export async function getMethodGraphExploration(input: {
  kind: MethodGraphNodeKind;
  id: string;
}): Promise<
  | {
      ok: true;
      focus: MethodGraphNode;
      neighbors: MethodGraphNeighbor[];
    }
  | { ok: false; error: string }
> {
  if (!featureFlags.trainingMethodKnowledgeGraph) {
    return {
      ok: false,
      error: "Training Method Knowledge Graph is not enabled.",
    };
  }
  const focus = getMethodGraphNode(input.kind, input.id);
  if (!focus) {
    return { ok: false, error: "Unknown graph node." };
  }
  return {
    ok: true,
    focus,
    neighbors: neighborsForMethodGraphNode(input.kind, input.id),
  };
}
