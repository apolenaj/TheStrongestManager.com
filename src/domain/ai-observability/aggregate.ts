/**
 * Pure AI observability rollup — compose meters, attempts, feedback counts.
 */

import {
  AI_OBSERVABILITY_ENGINE_VERSION,
  AI_OBSERVABILITY_HONESTY,
  type AiObservabilityAttemptInput,
  type AiObservabilityCostFeatureInput,
  type AiObservabilityFeedbackCountInput,
  type AiObservabilityMeterInput,
  type AiObservabilitySnapshot,
} from "@/domain/ai-observability/constants";

function rate(numer: number, denom: number): number | null {
  if (denom <= 0) return null;
  return Math.round((numer / denom) * 1000) / 1000;
}

export function buildAiObservabilitySnapshot(input: {
  meters: readonly AiObservabilityMeterInput[];
  attempts: readonly AiObservabilityAttemptInput[];
  feedbackCounts: readonly AiObservabilityFeedbackCountInput[];
  costByFeature?: readonly AiObservabilityCostFeatureInput[];
  now?: Date;
}): AiObservabilitySnapshot {
  let llmOk = 0;
  let llmFailed = 0;
  let llmDenied = 0;
  let skippedDeterministic = 0;
  let cacheHits = 0;
  let totalTokens = 0;
  let usdSum = 0;
  let usdSeen = false;
  let latencyTotal = 0;
  let latencySamples = 0;

  for (const m of input.meters) {
    if (m.outcome === "llm_ok") llmOk += 1;
    else if (m.outcome === "llm_failed") llmFailed += 1;
    else if (m.outcome === "llm_denied") llmDenied += 1;
    else if (m.outcome === "skipped_deterministic") skippedDeterministic += 1;
    else if (m.outcome === "cache_hit") cacheHits += 1;

    if (m.totalTokens != null) totalTokens += m.totalTokens;
    if (m.estimatedUsd != null) {
      usdSum += m.estimatedUsd;
      usdSeen = true;
    }
    if (m.latencyMs != null && m.latencyMs > 0) {
      latencyTotal += m.latencyMs;
      latencySamples += 1;
    }
  }

  let routerErrors = 0;
  let nullResponses = 0;
  for (const a of input.attempts) {
    if (a.outcome === "error") routerErrors += 1;
    if (a.outcome === "null_response") nullResponses += 1;
    if (a.latencyMs > 0) {
      latencyTotal += a.latencyMs;
      latencySamples += 1;
    }
  }

  const byVerdict: Record<string, number> = {};
  const byRelatedType: Record<string, number> = {};
  let feedbackTotal = 0;
  let helpful = 0;
  let notHelpful = 0;
  let accepted = 0;
  let modified = 0;
  let rejected = 0;
  let corrected = 0;

  for (const row of input.feedbackCounts) {
    feedbackTotal += row.count;
    byVerdict[row.verdict] = (byVerdict[row.verdict] ?? 0) + row.count;
    byRelatedType[row.relatedType] =
      (byRelatedType[row.relatedType] ?? 0) + row.count;
    if (row.verdict === "helpful") helpful += row.count;
    if (row.verdict === "not_helpful") notHelpful += row.count;
    if (row.verdict === "accepted") accepted += row.count;
    if (row.verdict === "modified") modified += row.count;
    if (row.verdict === "rejected") rejected += row.count;
    if (row.verdict === "corrected") corrected += row.count;
  }

  const userQualityFlags = notHelpful + rejected + corrected;

  const costByFeature =
    input.costByFeature?.map((f) => ({
      featureId: f.featureId,
      label: f.label,
      eventCount: f.eventCount,
      estimatedUsdSum: f.estimatedUsdSum,
    })) ?? [];

  return {
    engineVersion: AI_OBSERVABILITY_ENGINE_VERSION,
    generatedAt: (input.now ?? new Date()).toISOString(),
    honesty: AI_OBSERVABILITY_HONESTY,
    requests: {
      total: input.meters.length,
      llmOk,
      llmFailed,
      llmDenied,
      skippedDeterministic,
      cacheHits,
      successRate: rate(llmOk, llmOk + llmFailed),
    },
    latency: {
      sampleCount: latencySamples,
      totalMs: latencyTotal,
      avgMs: latencySamples > 0 ? Math.round(latencyTotal / latencySamples) : null,
    },
    cost: {
      totalTokens,
      estimatedUsdSum: usdSeen ? usdSum : null,
      byFeature: costByFeature,
    },
    failures: {
      llmFailed,
      llmDenied,
      routerErrors,
      nullResponses,
    },
    feedback: {
      total: feedbackTotal,
      byVerdict,
      byRelatedType,
      helpfulRate: rate(helpful, helpful + notHelpful),
      coachAcceptRate: rate(accepted, accepted + modified + rejected),
    },
    hallucination: {
      offlineEvalDimension: "hallucination",
      userQualityFlags,
      note:
        "No live hallucination-report store. Proxy = not_helpful + rejected + corrected. Offline eval remains CI-only.",
    },
    sources: {
      meterEventCount: input.meters.length,
      attemptLogCount: input.attempts.length,
      feedbackRowCount: feedbackTotal,
    },
  };
}

export function emptyAiObservabilitySnapshot(
  now = new Date(),
): AiObservabilitySnapshot {
  return buildAiObservabilitySnapshot({
    meters: [],
    attempts: [],
    feedbackCounts: [],
    now,
  });
}
