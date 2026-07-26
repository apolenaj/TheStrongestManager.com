/**
 * Decision Tree Coaching Tools service (Prompt 116).
 */

import { featureFlags } from "@/config/feature-flags";
import {
  getDecisionTreeBySlug,
  listDecisionTrees,
  parseDecisionTreePathParam,
  resolveDecisionTreePath,
  type DecisionTreeDefinition,
  type DecisionTreeResult,
} from "@/domain/decision-trees";

export async function getDecisionTreeOverview(): Promise<
  | { ok: true; trees: DecisionTreeDefinition[] }
  | { ok: false; error: string }
> {
  if (!featureFlags.decisionTreeCoaching) {
    return { ok: false, error: "Decision Tree Coaching Tools are not enabled." };
  }
  return { ok: true, trees: listDecisionTrees() };
}

export async function getDecisionTreeSession(input: {
  slug: string;
  pathParam?: string | string[];
}): Promise<
  | {
      ok: true;
      tree: DecisionTreeDefinition;
      optionIds: string[];
      result: DecisionTreeResult | null;
      pathError: string | null;
    }
  | { ok: false; error: string }
> {
  if (!featureFlags.decisionTreeCoaching) {
    return { ok: false, error: "Decision Tree Coaching Tools are not enabled." };
  }

  const tree = getDecisionTreeBySlug(input.slug);
  if (!tree) return { ok: false, error: "Decision tree not found." };

  const optionIds = parseDecisionTreePathParam(input.pathParam);
  if (optionIds.length === 0) {
    return { ok: true, tree, optionIds, result: null, pathError: null };
  }

  const resolved = resolveDecisionTreePath(tree, optionIds);
  if (!resolved.ok) {
    // Incomplete paths are OK for mid-walk share URLs — only hard-fail unknown options
    const incomplete = resolved.error.includes("incomplete");
    if (incomplete) {
      return {
        ok: true,
        tree,
        optionIds,
        result: null,
        pathError: null,
      };
    }
    return {
      ok: true,
      tree,
      optionIds: [],
      result: null,
      pathError: resolved.error,
    };
  }

  return {
    ok: true,
    tree,
    optionIds,
    result: resolved.result,
    pathError: null,
  };
}
