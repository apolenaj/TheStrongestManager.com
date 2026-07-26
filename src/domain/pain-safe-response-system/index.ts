export {
  PAIN_SAFE_ENGINE_VERSION,
  PAIN_SAFE_RESPONSE_HONESTY,
  PAIN_SAFE_SEEK_CARE_MESSAGE,
  PAIN_SAFE_CATEGORIES,
  PAIN_SAFE_CATEGORY_LABELS,
  PAIN_SAFE_AGGRESSIVE_KINDS,
  PAIN_SAFE_SURFACES,
  PAIN_SAFE_FORBIDDEN_PHRASES,
  type PainSafeCategory,
  type PainSafeAggressiveKind,
  type PainSafeSurface,
} from "@/domain/pain-safe-response-system/constants";

export type {
  PainSafeReportInput,
  PainSafeDetection,
  PainSafeAnalysis,
  PainSafeGuardResult,
} from "@/domain/pain-safe-response-system/types";

export {
  classifyPainSafeText,
  detectionsFromText,
  detectionsFromExplicitReports,
} from "@/domain/pain-safe-response-system/classify";

export {
  analyzePainSafeResponse,
  isPainSafeModeActive,
} from "@/domain/pain-safe-response-system/analyze";

export {
  isAggressiveKind,
  adaptiveKindToAggressive,
  applyPainSafeGuard,
  painSafeAdaptationHold,
} from "@/domain/pain-safe-response-system/guard";
