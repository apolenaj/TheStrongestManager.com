/**
 * Walk a decision tree from a path of answers.
 * Explains every structured rule that fired.
 */

import type {
  DecisionTreeDefinition,
  DecisionTreeOutcomeNode,
  DecisionTreePathStep,
  DecisionTreeQuestionNode,
  DecisionTreeResult,
} from "@/domain/decision-trees/types";

export function getQuestionNode(
  tree: DecisionTreeDefinition,
  nodeId: string,
): DecisionTreeQuestionNode | null {
  const node = tree.nodes[nodeId];
  if (!node || node.kind !== "question") return null;
  return node;
}

export function getOutcomeNode(
  tree: DecisionTreeDefinition,
  nodeId: string,
): DecisionTreeOutcomeNode | null {
  const node = tree.nodes[nodeId];
  if (!node || node.kind !== "outcome") return null;
  return node;
}

/**
 * Apply one answer at the current question node.
 * Returns the next node id or an error.
 */
export function applyDecisionOption(
  tree: DecisionTreeDefinition,
  nodeId: string,
  optionId: string,
):
  | { ok: true; step: DecisionTreePathStep; nextNodeId: string }
  | { ok: false; error: string } {
  const question = getQuestionNode(tree, nodeId);
  if (!question) {
    return { ok: false, error: `Node “${nodeId}” is not a question.` };
  }
  const option = question.options.find((o) => o.id === optionId);
  if (!option) {
    return {
      ok: false,
      error: `Unknown option “${optionId}” for question “${nodeId}”.`,
    };
  }
  if (!tree.nodes[option.nextNodeId]) {
    return {
      ok: false,
      error: `Broken tree edge: ${option.ruleId} → missing node “${option.nextNodeId}”.`,
    };
  }
  return {
    ok: true,
    nextNodeId: option.nextNodeId,
    step: {
      nodeId: question.id,
      prompt: question.prompt,
      optionId: option.id,
      optionLabel: option.label,
      ruleId: option.ruleId,
      ruleLabel: option.ruleLabel,
      ruleExplanation: option.ruleExplanation,
    },
  };
}

/**
 * Resolve a full path of option ids starting from the tree's start node.
 * Path format: ordered option ids matching each successive question.
 */
export function resolveDecisionTreePath(
  tree: DecisionTreeDefinition,
  optionIds: string[],
):
  | { ok: true; result: DecisionTreeResult }
  | { ok: false; error: string } {
  const path: DecisionTreePathStep[] = [];
  let currentId = tree.startNodeId;

  for (const optionId of optionIds) {
    const node = tree.nodes[currentId];
    if (!node) {
      return { ok: false, error: `Missing node “${currentId}”.` };
    }
    if (node.kind === "outcome") {
      return {
        ok: false,
        error: "Extra answers after an outcome — path is too long.",
      };
    }
    const applied = applyDecisionOption(tree, currentId, optionId);
    if (!applied.ok) return applied;
    path.push(applied.step);
    currentId = applied.nextNodeId;
  }

  const outcome = getOutcomeNode(tree, currentId);
  if (!outcome) {
    return {
      ok: false,
      error:
        "Path incomplete — still on a question. Answer remaining steps to see a result.",
    };
  }

  return {
    ok: true,
    result: {
      treeSlug: tree.slug,
      treeTitle: tree.title,
      path,
      outcome,
      rulesApplied: path.map((s) => ({
        ruleId: s.ruleId,
        ruleLabel: s.ruleLabel,
        ruleExplanation: s.ruleExplanation,
      })),
      sharePath: buildDecisionTreeSharePath(tree.slug, optionIds),
    },
  };
}

export function buildDecisionTreeSharePath(
  slug: string,
  optionIds: string[],
): string {
  if (optionIds.length === 0) return `/decision-trees/${slug}`;
  const params = new URLSearchParams();
  params.set("path", optionIds.join("."));
  return `/decision-trees/${slug}?${params.toString()}`;
}

export function parseDecisionTreePathParam(
  raw: string | string[] | undefined,
): string[] {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value?.trim()) return [];
  return value
    .split(/[.,|/]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Validate that every question option points at a real node; no orphan starts. */
export function validateDecisionTreeIntegrity(
  tree: DecisionTreeDefinition,
): string[] {
  const errors: string[] = [];
  if (!tree.nodes[tree.startNodeId]) {
    errors.push(`Missing start node “${tree.startNodeId}”.`);
  }
  for (const node of Object.values(tree.nodes)) {
    if (node.kind !== "question") continue;
    if (node.options.length === 0) {
      errors.push(`Question “${node.id}” has no options.`);
    }
    for (const opt of node.options) {
      if (!tree.nodes[opt.nextNodeId]) {
        errors.push(
          `Option “${opt.id}” on “${node.id}” points to missing “${opt.nextNodeId}”.`,
        );
      }
      if (!opt.ruleId.trim() || !opt.ruleLabel.trim() || !opt.ruleExplanation.trim()) {
        errors.push(`Option “${opt.id}” on “${node.id}” is missing rule fields.`);
      }
    }
  }
  return errors;
}
