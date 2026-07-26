/**
 * Multi-Model AI Router (Prompt 146).
 * Provider abstraction — different models for reasoning, vision, summarization, classification.
 * Not hard-wired to one vendor. Fallback · latency · errors · cost.
 */

export const AI_MODEL_ROUTER_ENGINE_VERSION = "ai_model_router.v1" as const;

export const AI_MODEL_ROUTER_HONESTY = [
  "The platform is not hard-wired to a single AI provider — providers register behind a shared router.",
  "Different task kinds use different model chains: text reasoning, vision, summarization, and simple classification.",
  "Fallback support tries the next provider when one fails — never fabricates a successful completion.",
  "Every attempt logs latency, errors, and cost meters (USD null until pricing is configured).",
  "Stub/none providers return null or deterministic passthrough only — never invent NL, scores, or citations.",
] as const;

export const AI_ROUTER_TASK_KINDS = [
  "text_reasoning",
  "vision",
  "summarization",
  "classification",
] as const;

export type AiRouterTaskKind = (typeof AI_ROUTER_TASK_KINDS)[number];

export const AI_ROUTER_TASK_KIND_LABELS: Record<AiRouterTaskKind, string> = {
  text_reasoning: "Text reasoning",
  vision: "Vision",
  summarization: "Summarization",
  classification: "Simple classification",
};

export type AiModelProviderStatus =
  | "unavailable"
  | "not_configured"
  | "stub"
  | "ready";

export const AI_MODEL_PROVIDER_STATUS_LABELS: Record<
  AiModelProviderStatus,
  string
> = {
  unavailable: "Unavailable",
  not_configured: "Not configured",
  stub: "Stub",
  ready: "Ready",
};

/**
 * Default fallback chains by task kind (provider ids).
 * Live vendors register later — never assume one hard-wired platform provider.
 */
export const DEFAULT_PROVIDER_CHAINS: Record<
  AiRouterTaskKind,
  readonly string[]
> = {
  text_reasoning: ["stub"],
  summarization: ["stub"],
  classification: ["stub"],
  /** Vision stays local / none until a real vision LLM is registered. */
  vision: ["none"],
};

export type AiModelCompleteInput = {
  taskKind: AiRouterTaskKind;
  featureId: string;
  /** Concrete tier when live LLM is allowed. */
  modelTier: "small" | "standard" | "large";
  /** Structured prompt / messages — required for live providers. */
  payload: unknown;
  maxTokens?: number;
  runId?: string | null;
};

export type AiModelCompleteResult = {
  providerId: string;
  modelId: string;
  /** Structured content only — never raw CoT. */
  content: unknown;
  promptTokens: number | null;
  completionTokens: number | null;
  latencyMs: number;
};

export type AiModelProvider = {
  id: string;
  label: string;
  status: AiModelProviderStatus;
  supportedTaskKinds: readonly AiRouterTaskKind[];
  /**
   * Invoke model. Return null when unavailable / stub —
   * never invent model text, scores, or citations.
   */
  complete: (
    input: AiModelCompleteInput,
  ) => Promise<AiModelCompleteResult | null>;
};

export type AiRouterAttemptOutcome =
  | "success"
  | "null_response"
  | "error"
  | "skipped_unavailable"
  | "skipped_unsupported";

export type AiRouterAttemptLog = {
  attemptIndex: number;
  providerId: string;
  providerStatus: AiModelProviderStatus;
  taskKind: AiRouterTaskKind;
  featureId: string;
  outcome: AiRouterAttemptOutcome;
  latencyMs: number;
  errorMessage: string | null;
  promptTokens: number | null;
  completionTokens: number | null;
  /** Cost estimate — null until pricing configured. */
  estimatedUsd: number | null;
};

export type AiRouterRunResult = {
  engineVersion: string;
  taskKind: AiRouterTaskKind;
  featureId: string;
  success: boolean;
  result: AiModelCompleteResult | null;
  attempts: AiRouterAttemptLog[];
  /** Provider ids that were tried or skipped. */
  chain: string[];
  fallbackUsed: boolean;
  totalLatencyMs: number;
};

export type AiRouterDashboardSnapshot = {
  engineVersion: string;
  generatedAt: string;
  honesty: readonly string[];
  taskKinds: Array<{
    kind: AiRouterTaskKind;
    label: string;
    chain: string[];
  }>;
  providers: Array<{
    id: string;
    label: string;
    status: AiModelProviderStatus;
    supportedTaskKinds: readonly AiRouterTaskKind[];
  }>;
  recentAttempts: AiRouterAttemptLog[];
  totals: {
    attempts: number;
    successes: number;
    errors: number;
    nullResponses: number;
    totalLatencyMs: number;
  };
};
