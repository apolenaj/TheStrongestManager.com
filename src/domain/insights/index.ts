export {
  INSIGHTS_ENGINE_VERSION,
  INSIGHT_CONFIDENCE_LEVELS,
  INSIGHT_DOMAINS,
  INSIGHT_DOMAIN_LABELS,
  INSIGHT_HONESTY,
  RAPID_BW_LOSS_KG_PER_WEEK,
} from "@/domain/insights/constants";
export type {
  InsightConfidence,
  InsightDomain,
} from "@/domain/insights/constants";
export { proposeCrossDomainInsights } from "@/domain/insights/engine";
export {
  classifyPerformanceTrend,
  estimateBodyweightTrendKgPerWeek,
  meanDelta,
  volumeTrendPct,
} from "@/domain/insights/signals";
export type {
  CrossDomainSignals,
  InsightAction,
  InsightEvidence,
  InsightProposal,
  InsightsEngineResult,
} from "@/domain/insights/types";
