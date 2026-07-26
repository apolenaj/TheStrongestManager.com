/**
 * Session Readiness Adjuster (Prompt 198).
 * Pre-workout quick check-in → proceed / minor adjustment / review load.
 * Never cancel a workout from one metric.
 */

export const SESSION_READINESS_ENGINE_VERSION =
  "session_readiness_adjuster.v1" as const;

export const SESSION_READINESS_HONESTY = [
  "Session readiness recommendations are planning aids from your check-in — not medical clearance or a diagnosis.",
  "A single soft signal never cancels your workout and never alone forces a “review load” recommendation.",
  "Missing fields are skipped — never invented sleep, fatigue, soreness, or motivation.",
  "You always choose whether to train; the system suggests proceed, minor adjustment, or review load only.",
] as const;

export const SESSION_CHECKIN_SCALE_MIN = 1;
export const SESSION_CHECKIN_SCALE_MAX = 10;

/** Recommendations the product may emit — cancel is intentionally absent. */
export const SESSION_READINESS_RECOMMENDATIONS = [
  "proceed",
  "minor_adjustment",
  "review_load",
] as const;
export type SessionReadinessRecommendation =
  (typeof SESSION_READINESS_RECOMMENDATIONS)[number];

export const SESSION_READINESS_RECOMMENDATION_LABELS: Record<
  SessionReadinessRecommendation,
  string
> = {
  proceed: "Proceed",
  minor_adjustment: "Minor adjustment",
  review_load: "Review load",
};

export const SESSION_READINESS_RECOMMENDATION_DETAILS: Record<
  SessionReadinessRecommendation,
  string
> = {
  proceed:
    "Signals look workable for today’s plan — still listen to how warm-ups feel.",
  minor_adjustment:
    "Consider a small trim (volume, RPE target, or skip a backoff) — not a full cancel.",
  review_load:
    "Several signals look off together — review today’s loads with your coach or judgment before pushing top sets.",
};

/** Soft thresholds for “concerning” flags (1–10 scales; sleep in hours). */
export const SESSION_SLEEP_HOURS_CONCERN = 6;
export const SESSION_FATIGUE_CONCERN = 7;
export const SESSION_SORENESS_CONCERN = 7;
export const SESSION_MOTIVATION_CONCERN = 3;

/**
 * review_load requires at least this many independent concerning metrics.
 * One metric alone cannot escalate that far.
 */
export const SESSION_REVIEW_LOAD_MIN_CONCERNS = 2;

/**
 * Forbidden outcomes — encoded so tests and admin can assert them.
 */
export const SESSION_READINESS_FORBIDDEN = [
  "cancel_workout",
  "cancel_from_single_metric",
  "review_load_from_single_metric",
  "invent_missing_checkin_fields",
  "medical_clearance_language",
] as const;

export const SESSION_CHECKIN_FIELDS = [
  "sleepHours",
  "fatigue",
  "soreness",
  "motivation",
] as const;
export type SessionCheckInField = (typeof SESSION_CHECKIN_FIELDS)[number];

export const SESSION_CHECKIN_FIELD_LABELS: Record<SessionCheckInField, string> =
  {
    sleepHours: "Sleep",
    fatigue: "Fatigue",
    soreness: "Soreness",
    motivation: "Motivation",
  };
