import {
  CONVERSION_FUNNEL_DEFAULT_COHORT_DAYS,
  CONVERSION_FUNNEL_ENGINE_VERSION,
  CONVERSION_FUNNEL_HONESTY,
  CONVERSION_FUNNEL_MIN_TOP_FOR_RATES,
  CONVERSION_FUNNEL_STAGES,
} from "@/domain/conversion-funnel/constants";
import {
  summarizeConversionFunnel,
  type ConversionFunnelSummary,
  type FunnelStageCountInput,
} from "@/domain/conversion-funnel/evaluate";

export type ConversionFunnelSnapshot = {
  engineVersion: typeof CONVERSION_FUNNEL_ENGINE_VERSION;
  honesty: typeof CONVERSION_FUNNEL_HONESTY;
  stageDefinitions: typeof CONVERSION_FUNNEL_STAGES;
  cohortDays: number;
  minTopForRates: number;
  funnel: ConversionFunnelSummary;
  liveCounts: Record<string, number>;
  durableCounts: Record<string, number>;
  generatedAt: string;
};

export function buildConversionFunnelSnapshot(input: {
  cohortDays?: number;
  stageCounts: FunnelStageCountInput[];
  liveCounts?: Record<string, number>;
  durableCounts?: Record<string, number>;
  generatedAt?: string;
}): ConversionFunnelSnapshot {
  return {
    engineVersion: CONVERSION_FUNNEL_ENGINE_VERSION,
    honesty: CONVERSION_FUNNEL_HONESTY,
    stageDefinitions: CONVERSION_FUNNEL_STAGES,
    cohortDays: input.cohortDays ?? CONVERSION_FUNNEL_DEFAULT_COHORT_DAYS,
    minTopForRates: CONVERSION_FUNNEL_MIN_TOP_FOR_RATES,
    funnel: summarizeConversionFunnel(input.stageCounts),
    liveCounts: input.liveCounts ?? {},
    durableCounts: input.durableCounts ?? {},
    generatedAt: input.generatedAt ?? new Date().toISOString(),
  };
}
