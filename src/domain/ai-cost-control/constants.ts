/**
 * AI Cost Control Architecture (Prompt 145).
 * Use AI only where it adds value. Never call LLMs for calc/filter/rules/scores.
 * Cache · structured prompts · smaller models · meter cost per feature.
 */

export const AI_COST_CONTROL_ENGINE_VERSION = "ai_cost_control.v1" as const;

export const AI_COST_CONTROL_HONESTY = [
  "AI is used only where it adds value — not for simple calculations, filters, known rules, or scoring formulas.",
  "Deterministic engines stay the source of truth; LLMs may draft language over structured facts, never invent scores.",
  "Inference responses should be cached when inputs are identical; cache hits cost $0.",
  "Prefer smaller models and structured prompts when an LLM is allowed.",
  "Cost estimates are metered per feature — USD is null until a real provider price table is configured (never invent spend).",
] as const;

/** Task classes that must never invoke an LLM. */
export const AI_TASK_CLASSES_DENY_LLM = [
  "calc",
  "filter",
  "rule",
  "score",
  "assemble",
  "pose",
  "eval_offline",
  "intent_route",
] as const;

/** Task classes that may invoke an LLM when the feature is allowlisted. */
export const AI_TASK_CLASSES_ALLOW_LLM = [
  "nl_draft",
  "nl_summarize",
  "nl_paraphrase",
] as const;

export const AI_TASK_CLASSES = [
  ...AI_TASK_CLASSES_DENY_LLM,
  ...AI_TASK_CLASSES_ALLOW_LLM,
] as const;

export type AiTaskClass = (typeof AI_TASK_CLASSES)[number];

export const AI_TASK_CLASS_LABELS: Record<AiTaskClass, string> = {
  calc: "Simple calculations",
  filter: "Filters",
  rule: "Known rules",
  score: "Scoring formulas",
  assemble: "Deterministic assemble",
  pose: "Pose / movement compute",
  eval_offline: "Offline evaluation",
  intent_route: "Intent routing",
  nl_draft: "Natural-language draft",
  nl_summarize: "Natural-language summarize",
  nl_paraphrase: "Natural-language paraphrase",
};

export const AI_MODEL_TIERS = [
  "none",
  "small",
  "standard",
  "large",
] as const;

export type AiModelTier = (typeof AI_MODEL_TIERS)[number];

export const AI_MODEL_TIER_LABELS: Record<AiModelTier, string> = {
  none: "None (deterministic)",
  small: "Smaller model",
  standard: "Standard model",
  large: "Large model",
};

/**
 * Features that may eventually call an LLM (aligned with Prompt 144 capabilities).
 * Default policy still requires an allowlisted task class.
 */
export const AI_COST_FEATURE_IDS = [
  "coach_brain",
  "coach_chat",
  "coach_ai_copilot",
  "research_summarizer",
  "program_review",
  "daily_brief",
  "insights",
  "technique_backend",
] as const;

export type AiCostFeatureId = (typeof AI_COST_FEATURE_IDS)[number];

export const AI_COST_FEATURE_LABELS: Record<AiCostFeatureId, string> = {
  coach_brain: "AI Coach Brain",
  coach_chat: "AI Coach chat",
  coach_ai_copilot: "Coach AI Copilot",
  research_summarizer: "Research summarizer",
  program_review: "Program AI review",
  daily_brief: "Daily coaching brief",
  insights: "Cross-domain insights",
  technique_backend: "Technique analysis",
};

/**
 * Features allowed to use LLM for nl_* task classes only.
 * Others stay deterministic forever under this policy.
 */
export const AI_LLM_ALLOWLISTED_FEATURES: readonly AiCostFeatureId[] = [
  "coach_brain",
  "coach_chat",
  "coach_ai_copilot",
  "research_summarizer",
  "program_review",
] as const;

export type AiLlmDenyReason =
  | "task_class_denied"
  | "feature_not_allowlisted"
  | "feature_disabled"
  | "budget_exhausted"
  | "adapter_stub_only"
  | "cache_served";

export type AiLlmRoutingDecision =
  | {
      allow: false;
      reason: AiLlmDenyReason;
      modelTier: "none";
      requireStructuredOutput: false;
      useCache: boolean;
      message: string;
    }
  | {
      allow: true;
      reason: "policy_allowed";
      modelTier: Exclude<AiModelTier, "none">;
      maxTokens: number;
      requireStructuredOutput: true;
      preferSmallModel: boolean;
      useCache: boolean;
      message: string;
    };

export type AiCostMeterOutcome =
  | "skipped_deterministic"
  | "cache_hit"
  | "llm_ok"
  | "llm_denied"
  | "llm_failed";

export type AiCostMeterEvent = {
  engineVersion: typeof AI_COST_CONTROL_ENGINE_VERSION;
  eventId: string;
  at: string;
  featureId: AiCostFeatureId | string;
  taskClass: AiTaskClass;
  modelTier: AiModelTier;
  adapterId: string;
  cached: boolean;
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
  /** Null until a calibrated provider price table exists. */
  estimatedUsd: number | null;
  latencyMs: number | null;
  outcome: AiCostMeterOutcome;
  runId: string | null;
};

export type AiCostFeatureRollup = {
  featureId: string;
  label: string;
  eventCount: number;
  skippedDeterministic: number;
  cacheHits: number;
  llmOk: number;
  llmDenied: number;
  llmFailed: number;
  totalTokens: number;
  /** Sum of non-null estimates only — never invent missing USD. */
  estimatedUsdSum: number | null;
  cacheHitRate: number | null;
};

export type AiCostDashboardSnapshot = {
  engineVersion: string;
  generatedAt: string;
  honesty: readonly string[];
  pricingConfigured: boolean;
  totals: {
    eventCount: number;
    skippedDeterministic: number;
    cacheHits: number;
    llmCalls: number;
    llmDenied: number;
    totalTokens: number;
    estimatedUsdSum: number | null;
  };
  byFeature: AiCostFeatureRollup[];
  deniedTaskClasses: readonly AiTaskClass[];
  allowlistedFeatures: readonly AiCostFeatureId[];
  routingExamples: Array<{
    featureId: AiCostFeatureId;
    taskClass: AiTaskClass;
    decision: AiLlmRoutingDecision;
  }>;
};
