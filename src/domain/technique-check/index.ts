export {
  TECHNIQUE_CHECK_ENGINE_VERSION,
  TECHNIQUE_CHECK_HONESTY,
  TECHNIQUE_CHECK_PRIVACY_COPY,
  TECHNIQUE_CHECK_CLAIM_LIMIT,
  TECHNIQUE_CHECK_CLAIM_WINDOW_MS,
  TECHNIQUE_CHECK_TICKET_TTL_SECONDS,
  TECHNIQUE_CHECK_MAX_INSIGHTS,
  TECHNIQUE_CHECK_MAX_PHASE_PREVIEW,
  TECHNIQUE_CHECK_SUPPORTED_EXERCISES,
  TECHNIQUE_CHECK_FUNNEL_STEPS,
  TECHNIQUE_CHECK_LOCKED_SECTIONS,
  TECHNIQUE_CHECK_SIGNUP_HREF,
} from "@/domain/technique-check/constants";
export type {
  TechniqueCheckEvidenceLabel,
  TechniqueCheckFunnelStep,
  TechniqueCheckFunnelStepId,
} from "@/domain/technique-check/constants";

export {
  buildLimitedTechniqueInsight,
  type LimitedInsightBullet,
  type LimitedTechniqueInsight,
} from "@/domain/technique-check/limited-insight";

export {
  isTechniqueCheckTicketPayload,
  type TechniqueCheckTicketPayload,
} from "@/domain/technique-check/ticket";

export {
  buildTechniqueCheckSnapshot,
  evaluateTechniqueCheckQuality,
  type TechniqueCheckSnapshot,
  type TechniqueCheckQualityResult,
} from "@/domain/technique-check/snapshot";
