export {
  CONVERSION_FUNNEL_ENGINE_VERSION,
  CONVERSION_FUNNEL_HONESTY,
  CONVERSION_FUNNEL_DEFAULT_COHORT_DAYS,
  CONVERSION_FUNNEL_MIN_TOP_FOR_RATES,
  CONVERSION_FUNNEL_STAGES,
} from "@/domain/conversion-funnel/constants";
export type { ConversionFunnelStageId } from "@/domain/conversion-funnel/constants";

export {
  summarizeConversionFunnel,
  funnelStageForEvent,
} from "@/domain/conversion-funnel/evaluate";
export type {
  FunnelStageCountInput,
  FunnelStageRow,
  FunnelDropOff,
  ConversionFunnelSummary,
} from "@/domain/conversion-funnel/evaluate";

export {
  buildConversionFunnelSnapshot,
  type ConversionFunnelSnapshot,
} from "@/domain/conversion-funnel/snapshot";
