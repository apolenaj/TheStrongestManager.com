export {
  COOKIE_CATEGORIES,
  COOKIE_CONSENT_COOKIE,
  COOKIE_CONSENT_VERSION,
  DEFAULT_COOKIE_CONSENT,
  GDPR_ENGINE_VERSION,
  GDPR_HONESTY,
  GDPR_PROCESSING_ACTIVITIES,
  GDPR_RETENTION_INTENTIONS,
  GDPR_WORKFLOW_AREAS,
  GDPR_WORKFLOWS,
  LEGAL_CONTENT_SURFACES,
  LEGAL_REVIEW_BANNER,
  hasDecidedCookieConsent,
  parseCookieConsent,
  serializeCookieConsent,
} from "@/domain/gdpr-readiness/constants";
export type {
  CookieCategoryId,
  CookieConsentState,
  GdprWorkflow,
  GdprWorkflowAreaId,
  GdprWorkflowStatus,
} from "@/domain/gdpr-readiness/constants";
export {
  buildGdprReadinessSnapshot,
  type GdprReadinessSnapshot,
} from "@/domain/gdpr-readiness/snapshot";
