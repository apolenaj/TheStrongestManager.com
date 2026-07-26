/**
 * Dashboard rollups for internal AI cost architecture.
 */

import {
  AI_COST_CONTROL_ENGINE_VERSION,
  AI_COST_CONTROL_HONESTY,
  AI_LLM_ALLOWLISTED_FEATURES,
  AI_TASK_CLASSES_DENY_LLM,
  type AiCostDashboardSnapshot,
  type AiCostFeatureRollup,
  type AiCostMeterEvent,
  type AiCostFeatureId,
  type AiTaskClass,
} from "@/domain/ai-cost-control/constants";
import { featureLabel } from "@/domain/ai-cost-control/metering";
import { routeAiInference } from "@/domain/ai-cost-control/routing";

export function aggregateAiCostMeterEvents(
  events: readonly AiCostMeterEvent[],
  options?: { pricingConfigured?: boolean; now?: Date },
): AiCostDashboardSnapshot {
  const byFeature = new Map<string, AiCostFeatureRollup>();

  const ensure = (featureId: string): AiCostFeatureRollup => {
    let row = byFeature.get(featureId);
    if (!row) {
      row = {
        featureId,
        label: featureLabel(featureId),
        eventCount: 0,
        skippedDeterministic: 0,
        cacheHits: 0,
        llmOk: 0,
        llmDenied: 0,
        llmFailed: 0,
        totalTokens: 0,
        estimatedUsdSum: null,
        cacheHitRate: null,
      };
      byFeature.set(featureId, row);
    }
    return row;
  };

  let skippedDeterministic = 0;
  let cacheHits = 0;
  let llmCalls = 0;
  let llmDenied = 0;
  let totalTokens = 0;
  let usdSum = 0;
  let usdSeen = false;

  for (const event of events) {
    const row = ensure(event.featureId);
    row.eventCount += 1;
    if (event.outcome === "skipped_deterministic") {
      row.skippedDeterministic += 1;
      skippedDeterministic += 1;
    }
    if (event.outcome === "cache_hit" || event.cached) {
      row.cacheHits += 1;
      cacheHits += 1;
    }
    if (event.outcome === "llm_ok") {
      row.llmOk += 1;
      llmCalls += 1;
    }
    if (event.outcome === "llm_denied") {
      row.llmDenied += 1;
      llmDenied += 1;
    }
    if (event.outcome === "llm_failed") {
      row.llmFailed += 1;
    }
    if (event.totalTokens != null) {
      row.totalTokens += event.totalTokens;
      totalTokens += event.totalTokens;
    }
    if (event.estimatedUsd != null) {
      row.estimatedUsdSum = (row.estimatedUsdSum ?? 0) + event.estimatedUsd;
      usdSum += event.estimatedUsd;
      usdSeen = true;
    }
  }

  for (const row of byFeature.values()) {
    const denom = row.llmOk + row.cacheHits;
    row.cacheHitRate =
      denom > 0 ? Math.round((row.cacheHits / denom) * 1000) / 1000 : null;
  }

  const routingExamples: AiCostDashboardSnapshot["routingExamples"] = [
    {
      featureId: "coach_brain",
      taskClass: "score",
      decision: routeAiInference({
        featureId: "coach_brain",
        taskClass: "score",
        adapterIsStub: true,
      }),
    },
    {
      featureId: "coach_brain",
      taskClass: "rule",
      decision: routeAiInference({
        featureId: "coach_brain",
        taskClass: "rule",
        adapterIsStub: true,
      }),
    },
    {
      featureId: "research_summarizer",
      taskClass: "nl_summarize",
      decision: routeAiInference({
        featureId: "research_summarizer",
        taskClass: "nl_summarize",
        adapterIsStub: true,
      }),
    },
    {
      featureId: "research_summarizer",
      taskClass: "nl_summarize",
      decision: routeAiInference({
        featureId: "research_summarizer",
        taskClass: "nl_summarize",
        adapterIsStub: false,
      }),
    },
  ];

  return {
    engineVersion: AI_COST_CONTROL_ENGINE_VERSION,
    generatedAt: (options?.now ?? new Date()).toISOString(),
    honesty: AI_COST_CONTROL_HONESTY,
    pricingConfigured: options?.pricingConfigured ?? false,
    totals: {
      eventCount: events.length,
      skippedDeterministic,
      cacheHits,
      llmCalls,
      llmDenied,
      totalTokens,
      estimatedUsdSum: usdSeen ? usdSum : null,
    },
    byFeature: [...byFeature.values()].sort((a, b) =>
      a.featureId.localeCompare(b.featureId),
    ),
    deniedTaskClasses: AI_TASK_CLASSES_DENY_LLM as unknown as AiTaskClass[],
    allowlistedFeatures: AI_LLM_ALLOWLISTED_FEATURES as unknown as AiCostFeatureId[],
    routingExamples,
  };
}

/** Architecture-empty snapshot when no events yet — never invent LLM spend. */
export function emptyAiCostDashboardSnapshot(
  now = new Date(),
): AiCostDashboardSnapshot {
  return aggregateAiCostMeterEvents([], { now, pricingConfigured: false });
}
