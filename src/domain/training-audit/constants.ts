/** Automatic Training Audit — Prompt 58 */

export const TRAINING_AUDIT_ENGINE_VERSION = "training_audit.v1" as const;

export const TRAINING_AUDIT_STAGES = [
  "upload",
  "analyze",
  "understand",
  "improve",
] as const;

export type TrainingAuditStage = (typeof TRAINING_AUDIT_STAGES)[number];

export const TRAINING_AUDIT_STAGE_LABELS: Record<TrainingAuditStage, string> = {
  upload: "Upload your program",
  analyze: "Analyze",
  understand: "Understand",
  improve: "Improve",
};

export const TRAINING_AUDIT_INPUT_MODES = [
  "manual",
  "csv",
  "paste",
  "pdf_image",
] as const;

export type TrainingAuditInputMode = (typeof TRAINING_AUDIT_INPUT_MODES)[number];

export const TRAINING_AUDIT_FINDING_CODES = [
  "duplicate_stress",
  "missing_movement_pattern",
  "excessive_progression",
  "poor_exercise_ordering",
  "unrealistic_volume",
  "unclear_progression",
] as const;

export type TrainingAuditFindingCode =
  (typeof TRAINING_AUDIT_FINDING_CODES)[number];

export const TRAINING_AUDIT_HONESTY = [
  "The audit only uses lines you uploaded or entered — it never fabricates sets, reps, loads, or exercises.",
  "Unresolved exercise names stay unresolved; movement patterns are not invented.",
  "PDF and image parsing are feature-flagged and unavailable until a real parser ships.",
  "Improve suggestions are coaching-practice only and never auto-apply to your program.",
] as const;

/** Dense-day threshold for duplicate-stress detection (estimated sets). */
export const AUDIT_DENSE_SETS = 12;
/** Same-pattern set weight on one day that flags duplicate stress. */
export const AUDIT_DUPLICATE_PATTERN_SETS = 10;
/** Weekly sets above this (with context) flag potentially unrealistic volume. */
export const AUDIT_VOLUME_HIGH = 70;
export const AUDIT_VOLUME_VERY_HIGH = 90;
/** RPE jump across consecutive days that may indicate excessive progression density. */
export const AUDIT_RPE_JUMP = 1.5;
