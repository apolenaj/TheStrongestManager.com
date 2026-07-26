/**
 * AI Observability (Prompt 147).
 * Internal monitoring: requests, success rate, latency, cost, failures,
 * hallucination proxies, user feedback — without logging private raw inputs.
 */

export const AI_OBSERVABILITY_ENGINE_VERSION = "ai_observability.v1" as const;

export const AI_OBSERVABILITY_HONESTY = [
  "AI observability aggregates meters, router attempts, and feedback counts — it does not store raw prompts or completions.",
  "Private raw inputs (messages, notes, video, health, free-text reasons) are never logged on this dashboard.",
  "Cost USD stays null until a calibrated price table exists — never invent spend.",
  "Hallucination monitoring uses offline eval dimensions plus user quality flags — there is no live fabricated-content store.",
] as const;

/** Fields / payload keys that must never appear on observability snapshots or logs. */
export const AI_OBSERVABILITY_FORBIDDEN_FIELDS = [
  "prompt",
  "prompts",
  "messages",
  "completion",
  "completions",
  "content",
  "payload",
  "input",
  "rawInput",
  "reason",
  "note",
  "notes",
  "comment",
  "email",
  "phone",
  "video",
  "landmarks",
  "pose",
  "health",
  "injury",
  "storageKey",
  "mediaUrl",
] as const;

export type AiObservabilityRequests = {
  total: number;
  llmOk: number;
  llmFailed: number;
  llmDenied: number;
  skippedDeterministic: number;
  cacheHits: number;
  /** llmOk / (llmOk + llmFailed); null when no LLM outcomes. */
  successRate: number | null;
};

export type AiObservabilityLatency = {
  sampleCount: number;
  totalMs: number;
  avgMs: number | null;
};

export type AiObservabilityCost = {
  totalTokens: number;
  estimatedUsdSum: number | null;
  byFeature: Array<{
    featureId: string;
    label: string;
    eventCount: number;
    estimatedUsdSum: number | null;
  }>;
};

export type AiObservabilityFailures = {
  llmFailed: number;
  llmDenied: number;
  routerErrors: number;
  nullResponses: number;
};

export type AiObservabilityFeedback = {
  total: number;
  byVerdict: Record<string, number>;
  byRelatedType: Record<string, number>;
  helpfulRate: number | null;
  coachAcceptRate: number | null;
};

export type AiObservabilityHallucination = {
  offlineEvalDimension: "hallucination";
  /** Proxy: not_helpful + rejected + corrected (counts only). */
  userQualityFlags: number;
  note: string;
};

export type AiObservabilitySnapshot = {
  engineVersion: string;
  generatedAt: string;
  honesty: readonly string[];
  requests: AiObservabilityRequests;
  latency: AiObservabilityLatency;
  cost: AiObservabilityCost;
  failures: AiObservabilityFailures;
  feedback: AiObservabilityFeedback;
  hallucination: AiObservabilityHallucination;
  sources: {
    meterEventCount: number;
    attemptLogCount: number;
    feedbackRowCount: number;
  };
};

/** Opaque meter fields allowed into aggregation (no private text). */
export type AiObservabilityMeterInput = {
  outcome: string;
  totalTokens: number | null;
  estimatedUsd: number | null;
  latencyMs: number | null;
  featureId: string;
};

export type AiObservabilityAttemptInput = {
  outcome: string;
  latencyMs: number;
};

export type AiObservabilityFeedbackCountInput = {
  verdict: string;
  relatedType: string;
  count: number;
};

export type AiObservabilityCostFeatureInput = {
  featureId: string;
  label: string;
  eventCount: number;
  estimatedUsdSum: number | null;
};
