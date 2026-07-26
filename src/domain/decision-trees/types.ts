export type DecisionTreeNodeKind = "question" | "outcome";

/** An option edge — the structured rule that fires when chosen. */
export type DecisionTreeOption = {
  id: string;
  label: string;
  /** Next node id (question or outcome). */
  nextNodeId: string;
  /** Stable rule id for transparency / tests. */
  ruleId: string;
  /** Short rule name shown in “rules that applied”. */
  ruleLabel: string;
  /** Why this branch was taken. */
  ruleExplanation: string;
};

export type DecisionTreeQuestionNode = {
  id: string;
  kind: "question";
  prompt: string;
  help?: string;
  options: readonly DecisionTreeOption[];
};

export type DecisionTreeOutcomeNode = {
  id: string;
  kind: "outcome";
  title: string;
  summary: string;
  /** Practical coaching guidance bullets. */
  guidance: readonly string[];
  /** Limits / when to ignore this outcome. */
  caveats: readonly string[];
};

export type DecisionTreeNode =
  | DecisionTreeQuestionNode
  | DecisionTreeOutcomeNode;

export type DecisionTreeDefinition = {
  slug: string;
  title: string;
  /** SEO / index blurb. */
  description: string;
  /** Question used as the marketing claim. */
  question: string;
  startNodeId: string;
  nodes: Readonly<Record<string, DecisionTreeNode>>;
};

export type DecisionTreePathStep = {
  nodeId: string;
  prompt: string;
  optionId: string;
  optionLabel: string;
  ruleId: string;
  ruleLabel: string;
  ruleExplanation: string;
};

export type DecisionTreeResult = {
  treeSlug: string;
  treeTitle: string;
  path: DecisionTreePathStep[];
  outcome: DecisionTreeOutcomeNode;
  /** Rules that fired along the path (same order as path). */
  rulesApplied: Array<{
    ruleId: string;
    ruleLabel: string;
    ruleExplanation: string;
  }>;
  sharePath: string;
};
