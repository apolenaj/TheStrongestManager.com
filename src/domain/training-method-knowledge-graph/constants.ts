/**
 * Training Method Knowledge Graph (Prompt 110).
 * Educational curated edges only — never invent history or arbitrary similarity.
 */

export const METHOD_KNOWLEDGE_GRAPH_VERSION =
  "training_method_knowledge_graph.v1" as const;

/** First-class node kinds connected by the graph. */
export const METHOD_GRAPH_NODE_KINDS = [
  "method",
  "coach",
  "sport",
  "goal",
  "volume_strategy",
  "intensity_strategy",
  "recovery_demand",
] as const;

export type MethodGraphNodeKind = (typeof METHOD_GRAPH_NODE_KINDS)[number];

export const METHOD_GRAPH_NODE_KIND_LABELS: Record<MethodGraphNodeKind, string> =
  {
    method: "Training method",
    coach: "Historical coach / practice",
    sport: "Sport",
    goal: "Goal",
    volume_strategy: "Volume strategy",
    intensity_strategy: "Intensity strategy",
    recovery_demand: "Recovery demand",
  };

/**
 * Edge relation kinds — directed educational associations.
 * Keep narrow so we never invent “related because similar.”
 */
export const METHOD_GRAPH_RELATION_KINDS = [
  "associated_with",
  "popularized_by",
  "uses_intensity",
  "uses_volume",
  "recovery_profile",
  "common_in_sport",
  "serves_goal",
  "related_method",
  "paired_with",
] as const;

export type MethodGraphRelationKind =
  (typeof METHOD_GRAPH_RELATION_KINDS)[number];

export const METHOD_GRAPH_HONESTY = [
  "Nodes and edges are educational associations drawn from the methods catalog, comparison profiles, and documented coaching history — not a claim that every link is experimentally “proven.”",
  "Westside / Louie Simmons / max-effort / dynamic-effort framing follows published conjugate method content: separate Soviet concurrent ideas, Westside gym practice, and internet clones.",
  "The graph never invents coach biographies, fake citations, or arbitrary similarity edges.",
] as const;

export const METHOD_GRAPH_SOURCES = [
  "methods_catalog",
  "comparison_profiles",
  "curated_educational",
  "history_timeline",
] as const;

export type MethodGraphSource = (typeof METHOD_GRAPH_SOURCES)[number];

/**
 * Featured exploration path (Prompt 110 example):
 * Conjugate → Westside → Max effort → Dynamic effort → Powerlifting
 */
export const FEATURED_METHOD_GRAPH_PATH = [
  { kind: "method" as const, id: "conjugate" },
  { kind: "coach" as const, id: "westside-barbell" },
  { kind: "intensity_strategy" as const, id: "max-effort" },
  { kind: "intensity_strategy" as const, id: "dynamic-effort" },
  { kind: "sport" as const, id: "powerlifting" },
] as const;
