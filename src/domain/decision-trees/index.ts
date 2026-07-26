export {
  DECISION_TREE_ENGINE_VERSION,
  DECISION_TREE_HONESTY,
  DECISION_TREE_MEDICAL_DISCLAIMER,
  DECISION_TREE_INDEX_DESCRIPTION,
} from "@/domain/decision-trees/constants";

export {
  DECISION_TREE_CATALOG,
  DECISION_TREE_DELOAD,
  DECISION_TREE_INCREASE_WEIGHT,
  DECISION_TREE_DEADLIFT,
  DECISION_TREE_VOLUME,
} from "@/domain/decision-trees/catalog";

export type {
  DecisionTreeDefinition,
  DecisionTreeNode,
  DecisionTreeOption,
  DecisionTreeOutcomeNode,
  DecisionTreePathStep,
  DecisionTreeQuestionNode,
  DecisionTreeResult,
} from "@/domain/decision-trees/types";

export {
  listDecisionTrees,
  getDecisionTreeBySlug,
  allDecisionTreeSlugs,
  decisionTreeIndexPath,
  decisionTreePath,
} from "@/domain/decision-trees/access";

export {
  applyDecisionOption,
  resolveDecisionTreePath,
  buildDecisionTreeSharePath,
  parseDecisionTreePathParam,
  validateDecisionTreeIntegrity,
  getQuestionNode,
  getOutcomeNode,
} from "@/domain/decision-trees/walk";
