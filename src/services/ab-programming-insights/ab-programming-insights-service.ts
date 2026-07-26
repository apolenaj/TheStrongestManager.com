/**
 * A/B Programming Insights service (Prompt 120).
 */

import { featureFlags } from "@/config/feature-flags";
import {
  AB_PROGRAMMING_DIMENSIONS,
  AB_PROGRAMMING_INSIGHTS_ENGINE_VERSION,
  aggregateAbProgrammingInsightsStub,
  overviewHonesty,
  type AbProgrammingInsightsOverview,
} from "@/domain/ab-programming-insights";

export async function getAbProgrammingInsightsOverview(): Promise<
  | { ok: true; overview: AbProgrammingInsightsOverview }
  | { ok: false; error: string }
> {
  if (!featureFlags.abProgrammingInsights) {
    return { ok: false, error: "A/B Programming Insights is not enabled." };
  }

  const stub = aggregateAbProgrammingInsightsStub();

  return {
    ok: true,
    overview: {
      engineVersion: AB_PROGRAMMING_INSIGHTS_ENGINE_VERSION,
      dimensions: [...AB_PROGRAMMING_DIMENSIONS],
      insights: stub.insights,
      suppressedCohortCount: stub.suppressedCohortCount,
      honesty: overviewHonesty(),
      pipelineStatus: stub.pipelineStatus,
    },
  };
}
