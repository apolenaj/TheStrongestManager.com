/**
 * AI cost control service — in-memory meter + inference cache.
 * Swap store for Redis/DB when a real LLM adapter ships.
 */

import {
  aggregateAiCostMeterEvents,
  buildAiCostMeterEvent,
  buildAiInferenceCacheKey,
  emptyAiCostDashboardSnapshot,
  meterSkippedDeterministic,
  routeAiInference,
  type AiCostDashboardSnapshot,
  type AiCostFeatureId,
  type AiCostMeterEvent,
  type AiCostMeterOutcome,
  type AiLlmRoutingDecision,
  type AiModelTier,
  type AiTaskClass,
} from "@/domain/ai-cost-control";

const MAX_EVENTS = 2000;

type CacheEntry = {
  key: string;
  storedAt: number;
  /** Structured adapter output JSON — never CoT. */
  valueJson: string;
  ttlMs: number;
};

const meterLog: AiCostMeterEvent[] = [];
const inferenceCache = new Map<string, CacheEntry>();

export function resetAiCostControlForTests(): void {
  meterLog.length = 0;
  inferenceCache.clear();
}

export function recordAiCostMeterEvent(
  event: AiCostMeterEvent,
): AiCostMeterEvent {
  meterLog.push(event);
  if (meterLog.length > MAX_EVENTS) {
    meterLog.splice(0, meterLog.length - MAX_EVENTS);
  }
  return event;
}

export function listAiCostMeterEvents(): readonly AiCostMeterEvent[] {
  return meterLog;
}

export function getAiCostDashboardSnapshot(): AiCostDashboardSnapshot {
  if (meterLog.length === 0) {
    return emptyAiCostDashboardSnapshot();
  }
  return aggregateAiCostMeterEvents(meterLog, { pricingConfigured: false });
}

export function recordSkippedDeterministic(input: {
  featureId: AiCostFeatureId | string;
  taskClass: AiTaskClass;
  adapterId: string;
  runId?: string | null;
}): AiCostMeterEvent {
  return recordAiCostMeterEvent(meterSkippedDeterministic(input));
}

export function decideAndMeterAiInference(input: {
  featureId: AiCostFeatureId | string;
  taskClass: AiTaskClass;
  adapterId: string;
  adapterIsStub?: boolean;
  featureEnabled?: boolean;
  payloadForCache?: unknown;
  modelTierHint?: AiModelTier;
  runId?: string | null;
}): {
  decision: AiLlmRoutingDecision;
  cacheKey: string | null;
  cacheHit: boolean;
  event: AiCostMeterEvent;
} {
  const modelTierForKey = input.modelTierHint ?? "none";
  const cacheKey =
    input.payloadForCache != null
      ? buildAiInferenceCacheKey({
          featureId: input.featureId,
          adapterId: input.adapterId,
          modelTier: modelTierForKey,
          payload: input.payloadForCache,
        })
      : null;

  let cacheHit = false;
  if (cacheKey) {
    const entry = inferenceCache.get(cacheKey);
    if (entry && Date.now() - entry.storedAt < entry.ttlMs) {
      cacheHit = true;
    } else if (entry) {
      inferenceCache.delete(cacheKey);
    }
  }

  const decision = routeAiInference({
    featureId: input.featureId,
    taskClass: input.taskClass,
    adapterIsStub: input.adapterIsStub,
    featureEnabled: input.featureEnabled,
    cacheHit,
  });

  let outcome: AiCostMeterOutcome;
  if (cacheHit) outcome = "cache_hit";
  else if (!decision.allow) {
    outcome =
      decision.reason === "adapter_stub_only" ||
      decision.reason === "task_class_denied" ||
      decision.reason === "feature_not_allowlisted"
        ? "skipped_deterministic"
        : "llm_denied";
  } else {
    outcome = "llm_ok";
  }

  const event = recordAiCostMeterEvent(
    buildAiCostMeterEvent({
      featureId: input.featureId,
      taskClass: input.taskClass,
      modelTier: decision.allow ? decision.modelTier : "none",
      adapterId: input.adapterId,
      outcome,
      cached: cacheHit,
      runId: input.runId,
    }),
  );

  return { decision, cacheKey, cacheHit, event };
}

export function putAiInferenceCache(input: {
  key: string;
  value: unknown;
  ttlMs?: number;
}): void {
  inferenceCache.set(input.key, {
    key: input.key,
    storedAt: Date.now(),
    valueJson: JSON.stringify(input.value),
    ttlMs: input.ttlMs ?? 1000 * 60 * 60,
  });
}

export function getAiInferenceCache<T>(key: string): T | null {
  const entry = inferenceCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.storedAt >= entry.ttlMs) {
    inferenceCache.delete(key);
    return null;
  }
  try {
    return JSON.parse(entry.valueJson) as T;
  } catch {
    inferenceCache.delete(key);
    return null;
  }
}
