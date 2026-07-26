export {
  ACCESSIBILITY_ENGINE_VERSION,
  ACCESSIBILITY_HONESTY,
  FOCUSABLE_SELECTOR,
  SCORE_TEXT_LABELS,
  SCORE_SYMBOLS,
  formatScoreAnnouncement,
  scorePresentation,
} from "@/domain/accessibility-system/constants";
export type {
  A11ySurfaceId,
  A11yAuditStatus,
  A11yAuditCriterion,
  ScoreLevel,
} from "@/domain/accessibility-system/constants";

export {
  A11Y_AUDIT_CRITERIA,
  buildAccessibilityAuditSnapshot,
  assertTechniqueScoreNotColorOnly,
  type AccessibilityAuditSnapshot,
} from "@/domain/accessibility-system/audit";
