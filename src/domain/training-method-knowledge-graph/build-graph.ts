/**
 * Build and query the Training Method Knowledge Graph.
 */

import {
  FEATURED_METHOD_GRAPH_PATH,
  METHOD_GRAPH_HONESTY,
  METHOD_KNOWLEDGE_GRAPH_VERSION,
} from "@/domain/training-method-knowledge-graph/constants";
import { curatedMethodGraphEdges } from "@/domain/training-method-knowledge-graph/edges";
import { buildMethodGraphNodes } from "@/domain/training-method-knowledge-graph/nodes";
import type {
  MethodGraphEdge,
  MethodGraphNeighbor,
  MethodGraphNode,
  MethodGraphPathStep,
  TrainingMethodKnowledgeGraph,
} from "@/domain/training-method-knowledge-graph/types";
import type { MethodGraphNodeKind } from "@/domain/training-method-knowledge-graph/constants";

function nodeKey(kind: MethodGraphNodeKind, id: string): string {
  return `${kind}:${id}`;
}

function dedupeEdges(edges: MethodGraphEdge[]): MethodGraphEdge[] {
  const seen = new Set<string>();
  const out: MethodGraphEdge[] = [];
  for (const e of edges) {
    const key = [
      e.fromKind,
      e.fromId,
      e.relation,
      e.toKind,
      e.toId,
    ].join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(e);
  }
  return out;
}

export function buildTrainingMethodKnowledgeGraph(): TrainingMethodKnowledgeGraph {
  const nodes = buildMethodGraphNodes();
  const byKey = new Map(nodes.map((n) => [nodeKey(n.kind, n.id), n]));
  const edges = dedupeEdges(curatedMethodGraphEdges()).filter((e) => {
    return (
      byKey.has(nodeKey(e.fromKind, e.fromId)) &&
      byKey.has(nodeKey(e.toKind, e.toId))
    );
  });

  const featuredPath: MethodGraphPathStep[] = FEATURED_METHOD_GRAPH_PATH.map(
    (step) => {
      const node = byKey.get(nodeKey(step.kind, step.id));
      return {
        kind: step.kind,
        id: step.id,
        label: node?.label ?? step.id,
        href: node?.href ?? null,
      };
    },
  );

  return {
    engineVersion: METHOD_KNOWLEDGE_GRAPH_VERSION,
    honesty: METHOD_GRAPH_HONESTY,
    nodes,
    edges,
    featuredPath,
  };
}

let cached: TrainingMethodKnowledgeGraph | null = null;

export function getTrainingMethodKnowledgeGraph(): TrainingMethodKnowledgeGraph {
  if (!cached) cached = buildTrainingMethodKnowledgeGraph();
  return cached;
}

export function resetTrainingMethodKnowledgeGraphCache(): void {
  cached = null;
}

export function getMethodGraphNode(
  kind: MethodGraphNodeKind,
  id: string,
): MethodGraphNode | null {
  return (
    getTrainingMethodKnowledgeGraph().nodes.find(
      (n) => n.kind === kind && n.id === id,
    ) ?? null
  );
}

export function neighborsForMethodGraphNode(
  kind: MethodGraphNodeKind,
  id: string,
): MethodGraphNeighbor[] {
  const graph = getTrainingMethodKnowledgeGraph();
  const byKey = new Map(
    graph.nodes.map((n) => [nodeKey(n.kind, n.id), n]),
  );
  const out: MethodGraphNeighbor[] = [];

  for (const edge of graph.edges) {
    if (edge.fromKind === kind && edge.fromId === id) {
      const node = byKey.get(nodeKey(edge.toKind, edge.toId));
      if (!node) continue;
      out.push({ edge, node, direction: "outgoing" });
    } else if (edge.toKind === kind && edge.toId === id) {
      const node = byKey.get(nodeKey(edge.fromKind, edge.fromId));
      if (!node) continue;
      out.push({ edge, node, direction: "incoming" });
    }
  }

  return out.sort((a, b) =>
    a.node.label.localeCompare(b.node.label),
  );
}

/**
 * Walk a directed path along outgoing edges matching the featured step sequence.
 * Returns null if any step is missing an edge (keeps exploration honest).
 */
export function walkFeaturedMethodGraphPath(): MethodGraphPathStep[] | null {
  const graph = getTrainingMethodKnowledgeGraph();
  const path = graph.featuredPath;
  if (path.length < 2) return path;

  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i]!;
    const to = path[i + 1]!;
    const ok = graph.edges.some(
      (e) =>
        e.fromKind === from.kind &&
        e.fromId === from.id &&
        e.toKind === to.kind &&
        e.toId === to.id,
    );
    if (!ok) return null;
  }
  return path;
}

export function methodGraphNodeKey(
  kind: MethodGraphNodeKind,
  id: string,
): string {
  return nodeKey(kind, id);
}
