export {
  PERSONALIZATION_ENGINE_VERSION,
  PERSONALIZATION_SURFACES,
  PERSONALIZATION_SURFACE_LABELS,
  PERSONALIZATION_SENSITIVE_CHARACTERISTICS,
  PERSONALIZATION_FORBIDDEN_USES,
  PERSONALIZATION_HONESTY,
  PERSONALIZATION_INPUT_KINDS,
  DEFAULT_PERSONALIZATION_LOOKBACK_DAYS,
} from "@/domain/personalization/constants";
export type {
  PersonalizationSurface,
  PersonalizationInputKind,
} from "@/domain/personalization/constants";

export type {
  PersonalizationItem,
  PersonalizationSurfaceSlot,
  PersonalizationPlan,
  PersonalizationSignals,
} from "@/domain/personalization/types";

export {
  assemblePersonalizationPlan,
  itemsForSurface,
  isPricingPersonalizationAllowed,
  assertNotPricingPersonalization,
  personalizationPlanText,
} from "@/domain/personalization/assemble";
