import type {
  MethodGraphNodeKind,
  MethodGraphRelationKind,
  MethodGraphSource,
} from "@/domain/training-method-knowledge-graph/constants";

export type MethodGraphNode = {
  kind: MethodGraphNodeKind;
  id: string;
  label: string;
  summary: string;
  /** Optional deep link when a real page exists. */
  href: string | null;
};

export type MethodGraphEdge = {
  fromKind: MethodGraphNodeKind;
  fromId: string;
  relation: MethodGraphRelationKind;
  toKind: MethodGraphNodeKind;
  toId: string;
  note: string;
  source: MethodGraphSource;
};

export type MethodGraphPathStep = {
  kind: MethodGraphNodeKind;
  id: string;
  label: string;
  href: string | null;
};

export type MethodGraphNeighbor = {
  edge: MethodGraphEdge;
  node: MethodGraphNode;
  /** Direction relative to the focused node. */
  direction: "outgoing" | "incoming";
};

export type TrainingMethodKnowledgeGraph = {
  engineVersion: string;
  honesty: readonly string[];
  nodes: MethodGraphNode[];
  edges: MethodGraphEdge[];
  featuredPath: MethodGraphPathStep[];
};
