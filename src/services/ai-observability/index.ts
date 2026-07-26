/**
 * AI observability service — compose cost meters, router attempts, feedback counts.
 * Never selects ModelFeedback.reason or other private raw text.
 */

import {
  buildAiObservabilitySnapshot,
  emptyAiObservabilitySnapshot,
  type AiObservabilitySnapshot,
} from "@/domain/ai-observability";
import { listAiCostMeterEvents } from "@/services/ai-cost-control";
import { aggregateAiCostMeterEvents } from "@/domain/ai-cost-control";
import { listAiRouterAttemptLogs } from "@/services/ai-model-router";
import { prisma } from "@/lib/db";

export async function getAiObservabilitySnapshot(): Promise<AiObservabilitySnapshot> {
  const meters = listAiCostMeterEvents();
  const attempts = listAiRouterAttemptLogs();

  let feedbackCounts: Array<{
    verdict: string;
    relatedType: string;
    count: number;
  }> = [];

  try {
    // Counts only — never select reason / free-text.
    const grouped = await prisma.modelFeedback.groupBy({
      by: ["verdict", "relatedType"],
      _count: { _all: true },
    });
    feedbackCounts = grouped.map((row) => ({
      verdict: row.verdict,
      relatedType: row.relatedType,
      count: row._count._all,
    }));
  } catch {
    feedbackCounts = [];
  }

  if (
    meters.length === 0 &&
    attempts.length === 0 &&
    feedbackCounts.length === 0
  ) {
    return emptyAiObservabilitySnapshot();
  }

  const costSnap = aggregateAiCostMeterEvents([...meters], {
    pricingConfigured: false,
  });

  return buildAiObservabilitySnapshot({
    meters: meters.map((m) => ({
      outcome: m.outcome,
      totalTokens: m.totalTokens,
      estimatedUsd: m.estimatedUsd,
      latencyMs: m.latencyMs,
      featureId: m.featureId,
    })),
    attempts: attempts.map((a) => ({
      outcome: a.outcome,
      latencyMs: a.latencyMs,
    })),
    feedbackCounts,
    costByFeature: costSnap.byFeature.map((f) => ({
      featureId: f.featureId,
      label: f.label,
      eventCount: f.eventCount,
      estimatedUsdSum: f.estimatedUsdSum,
    })),
  });
}
