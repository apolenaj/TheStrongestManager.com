import { DECISION_TREE_CATALOG } from "@/domain/decision-trees/catalog";
import type { DecisionTreeDefinition } from "@/domain/decision-trees/types";

export function listDecisionTrees(): DecisionTreeDefinition[] {
  return [...DECISION_TREE_CATALOG];
}

export function getDecisionTreeBySlug(
  slug: string,
): DecisionTreeDefinition | undefined {
  return DECISION_TREE_CATALOG.find((t) => t.slug === slug);
}

export function allDecisionTreeSlugs(): string[] {
  return DECISION_TREE_CATALOG.map((t) => t.slug);
}

export function decisionTreeIndexPath(): string {
  return "/decision-trees";
}

export function decisionTreePath(slug: string): string {
  return `/decision-trees/${slug}`;
}
