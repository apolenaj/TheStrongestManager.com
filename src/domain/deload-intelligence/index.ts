export {
  DELOAD_INTELLIGENCE_ENGINE_VERSION,
  DELOAD_INTELLIGENCE_HONESTY,
  DELOAD_RECOMMENDATION_LABEL,
  DELOAD_HOLD_LABEL,
  DELOAD_INSUFFICIENT_LABEL,
  DELOAD_MIN_SESSIONS,
  DELOAD_MIN_SIGNALS_FIRED,
  DELOAD_LOOKBACK_DAYS,
  DELOAD_RECENT_SUPPRESS_DAYS,
  DELOAD_READINESS_LOW,
  DELOAD_READINESS_DROP,
  DELOAD_RPE_HIGH,
  DELOAD_MISSED_REP_RATE,
  DELOAD_SIGNAL_KEYS,
  DELOAD_SIGNAL_LABELS,
  type DeloadSignalKey,
} from "@/domain/deload-intelligence/constants";

export type {
  DeloadSignalEvaluation,
  DeloadRecommendationStatus,
  DeloadIntelligenceAnalysis,
} from "@/domain/deload-intelligence/types";

export {
  canPublishDeloadRecommendation,
  deloadGateReason,
} from "@/domain/deload-intelligence/gate";

export {
  evaluateDeloadSignals,
  type DeloadSignalInputs,
} from "@/domain/deload-intelligence/signals";

export { analyzeDeloadIntelligence } from "@/domain/deload-intelligence/analyze";
