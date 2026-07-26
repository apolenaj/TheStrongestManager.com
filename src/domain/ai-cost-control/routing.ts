/**
 * LLM routing policy — deny by default for calc/filter/rule/score.
 */

import {
  AI_COST_FEATURE_LABELS,
  AI_LLM_ALLOWLISTED_FEATURES,
  AI_TASK_CLASS_LABELS,
  AI_TASK_CLASSES_DENY_LLM,
  type AiCostFeatureId,
  type AiLlmRoutingDecision,
  type AiModelTier,
  type AiTaskClass,
} from "@/domain/ai-cost-control/constants";

const DENY_SET = new Set<string>(AI_TASK_CLASSES_DENY_LLM);
const ALLOW_FEATURES = new Set<string>(AI_LLM_ALLOWLISTED_FEATURES);

function isDenyTaskClass(taskClass: AiTaskClass): boolean {
  return DENY_SET.has(taskClass);
}

function preferredTierForFeature(
  featureId: string,
): Exclude<AiModelTier, "none"> {
  // Prefer smaller models where appropriate.
  if (
    featureId === "research_summarizer" ||
    featureId === "coach_chat" ||
    featureId === "coach_ai_copilot"
  ) {
    return "small";
  }
  if (featureId === "coach_brain" || featureId === "program_review") {
    return "small";
  }
  return "standard";
}

function maxTokensForTier(tier: Exclude<AiModelTier, "none">): number {
  switch (tier) {
    case "small":
      return 512;
    case "standard":
      return 1024;
    case "large":
      return 2048;
  }
}

/**
 * Decide whether an LLM call is allowed for this feature + task class.
 * Structured prompts are required whenever allow=true.
 */
export function routeAiInference(input: {
  featureId: AiCostFeatureId | string;
  taskClass: AiTaskClass;
  featureEnabled?: boolean;
  adapterIsStub?: boolean;
  budgetExhausted?: boolean;
  cacheHit?: boolean;
}): AiLlmRoutingDecision {
  if (input.cacheHit) {
    return {
      allow: false,
      reason: "cache_served",
      modelTier: "none",
      requireStructuredOutput: false,
      useCache: true,
      message: "Served from inference cache — no LLM call.",
    };
  }

  if (input.featureEnabled === false) {
    return {
      allow: false,
      reason: "feature_disabled",
      modelTier: "none",
      requireStructuredOutput: false,
      useCache: true,
      message: `${AI_COST_FEATURE_LABELS[input.featureId as AiCostFeatureId] ?? input.featureId} is disabled — no LLM call.`,
    };
  }

  if (input.budgetExhausted) {
    return {
      allow: false,
      reason: "budget_exhausted",
      modelTier: "none",
      requireStructuredOutput: false,
      useCache: true,
      message: "AI budget exhausted for this window — falling back to deterministic systems.",
    };
  }

  if (isDenyTaskClass(input.taskClass)) {
    return {
      allow: false,
      reason: "task_class_denied",
      modelTier: "none",
      requireStructuredOutput: false,
      useCache: false,
      message: `${AI_TASK_CLASS_LABELS[input.taskClass]} must stay deterministic — LLM not called.`,
    };
  }

  if (!ALLOW_FEATURES.has(input.featureId)) {
    return {
      allow: false,
      reason: "feature_not_allowlisted",
      modelTier: "none",
      requireStructuredOutput: false,
      useCache: false,
      message: `${input.featureId} is not allowlisted for LLM — use deterministic engines.`,
    };
  }

  // Until a real LLM adapter is registered, deny and meter as stub-only.
  if (input.adapterIsStub !== false) {
    return {
      allow: false,
      reason: "adapter_stub_only",
      modelTier: "none",
      requireStructuredOutput: false,
      useCache: true,
      message:
        "No live LLM adapter registered — deterministic stub handles this path (no inference cost).",
    };
  }

  const modelTier = preferredTierForFeature(input.featureId);
  return {
    allow: true,
    reason: "policy_allowed",
    modelTier,
    maxTokens: maxTokensForTier(modelTier),
    requireStructuredOutput: true,
    preferSmallModel: modelTier === "small",
    useCache: true,
    message: `LLM allowed with structured prompt on ${modelTier} tier (max ${maxTokensForTier(modelTier)} tokens).`,
  };
}

/** Convenience: should this request skip LLM entirely? */
export function mustStayDeterministic(taskClass: AiTaskClass): boolean {
  return isDenyTaskClass(taskClass);
}
