/**
 * Data moat — privacy-safe aggregation for future model improvement (Prompt 91).
 * Not surveillance. Never include identifiable data without consent.
 */

export const DATA_MOAT_ENGINE_VERSION = "data_moat.v1" as const;
export const DATA_MOAT_POLICY_VERSION = "data_moat_policy.v1" as const;

/** Anonymized insight families the moat may eventually produce. */
export const DATA_MOAT_INSIGHT_KINDS = [
  "technique_patterns",
  "training_outcomes",
  "exercise_response",
  "programming_trends",
] as const;
export type DataMoatInsightKind = (typeof DATA_MOAT_INSIGHT_KINDS)[number];

export const DATA_MOAT_INSIGHT_KIND_LABELS: Record<
  DataMoatInsightKind,
  string
> = {
  technique_patterns: "Technique patterns",
  training_outcomes: "Training outcomes",
  exercise_response: "Exercise response",
  programming_trends: "Programming trends",
};

/** Consent scopes — each defaults off until the athlete opts in. */
export const DATA_MOAT_CONSENT_SCOPES = [
  "training_aggregates",
  "technique_aggregates",
  "strength_aggregates",
] as const;
export type DataMoatConsentScope =
  (typeof DATA_MOAT_CONSENT_SCOPES)[number];

export const DATA_MOAT_CONSENT_SCOPE_LABELS: Record<
  DataMoatConsentScope,
  string
> = {
  training_aggregates:
    "Training sessions & outcomes (counts, loads, RPE bands — no notes)",
  technique_aggregates:
    "Technique scores & metric keys (no video, pose, or free-text)",
  strength_aggregates:
    "Strength / progress numeric scores (no identity labels)",
};

export type DataMoatConsentScopes = Record<DataMoatConsentScope, boolean>;

export const DEFAULT_DATA_MOAT_CONSENT_SCOPES: DataMoatConsentScopes = {
  training_aggregates: false,
  technique_aggregates: false,
  strength_aggregates: false,
};

export const AGGREGATION_JOB_STATUSES = [
  "queued",
  "running",
  "completed",
  "failed",
  "cancelled",
] as const;
export type AggregationJobStatus =
  (typeof AGGREGATION_JOB_STATUSES)[number];

/** k-anonymity floor — suppress cohorts smaller than this. */
export const DATA_MOAT_MIN_COHORT_SIZE = 5;

/** Retention defaults (days) — architecture policy, not auto-enforced yet. */
export const DATA_MOAT_RETENTION = {
  /** Scratch rows for a running job. */
  intermediateScratchDays: 7,
  /** Published anonymized artifacts. */
  anonymizedArtifactDays: 730,
  /** Consent audit fields kept with account (+ legal buffer documented separately). */
  consentAuditYearsAfterAccount: 3,
  /** Failed job logs without PII. */
  failedJobLogDays: 90,
} as const;

/**
 * Fields / classes that must never appear in moat outputs or job scratch
 * linked to a person. Aligns with analytics privacy + org forbidden classes.
 */
export const DATA_MOAT_FORBIDDEN_OUTPUT_KEYS = [
  "email",
  "password",
  "name",
  "fullName",
  "firstName",
  "lastName",
  "displayName",
  "phone",
  "address",
  "userId",
  "athleteProfileId",
  "notes",
  "note",
  "coachNote",
  "coachNoteSummary",
  "sessionNotes",
  "comment",
  "message",
  "summary",
  "movementNotes",
  "bodyweight",
  "bodyWeight",
  "weightKg",
  "heightCm",
  "heartRate",
  "hrv",
  "sleepHours",
  "bloodPressure",
  "injury",
  "medical",
  "diagnosis",
  "video",
  "videoUrl",
  "storageKey",
  "mediaUrl",
  "landmarks",
  "frames",
  "poseFrames",
  "movementReportJson",
  "originalFileName",
  "mimeType",
] as const;

export const DATA_MOAT_HONESTY = [
  "The data moat exists for future model improvement — not surveillance or selling individual profiles.",
  "Private identifiable user data is never used without explicit Data Moat consent (default off).",
  "Outputs are anonymized cohort statistics only; cohorts below the k-anonymity floor are suppressed.",
  "Aggregation pipelines are not running in production yet — this is architecture readiness.",
] as const;

export function emptyConsentScopes(): DataMoatConsentScopes {
  return { ...DEFAULT_DATA_MOAT_CONSENT_SCOPES };
}

export function isDataMoatInsightKind(
  value: string,
): value is DataMoatInsightKind {
  return (DATA_MOAT_INSIGHT_KINDS as readonly string[]).includes(value);
}

export function isDataMoatConsentScope(
  value: string,
): value is DataMoatConsentScope {
  return (DATA_MOAT_CONSENT_SCOPES as readonly string[]).includes(value);
}
