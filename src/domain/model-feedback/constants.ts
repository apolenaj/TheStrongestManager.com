/**
 * Model feedback loop (Prompt 92).
 * Collect helpful/not_helpful (athletes) and accepted/modified/rejected (coaches).
 * Never auto-retrain production AI from unreviewed feedback.
 */

export const MODEL_FEEDBACK_ENGINE_VERSION = "model_feedback.v1" as const;

export const MODEL_FEEDBACK_ROLES = ["athlete", "coach", "expert"] as const;
export type ModelFeedbackRole = (typeof MODEL_FEEDBACK_ROLES)[number];

/** Athlete quality ratings. */
export const ATHLETE_FEEDBACK_VERDICTS = ["helpful", "not_helpful"] as const;
export type AthleteFeedbackVerdict =
  (typeof ATHLETE_FEEDBACK_VERDICTS)[number];

/** Coach decision signals on AI suggestions. */
export const COACH_FEEDBACK_VERDICTS = [
  "accepted",
  "modified",
  "rejected",
] as const;
export type CoachFeedbackVerdict = (typeof COACH_FEEDBACK_VERDICTS)[number];

/** Expert decisions on technique analyses (Prompt 95). */
export const EXPERT_FEEDBACK_VERDICTS = [
  "confirmed",
  "corrected",
  "commented",
] as const;
export type ExpertFeedbackVerdict = (typeof EXPERT_FEEDBACK_VERDICTS)[number];

export const MODEL_FEEDBACK_VERDICTS = [
  ...ATHLETE_FEEDBACK_VERDICTS,
  ...COACH_FEEDBACK_VERDICTS,
  ...EXPERT_FEEDBACK_VERDICTS,
] as const;
export type ModelFeedbackVerdict = (typeof MODEL_FEEDBACK_VERDICTS)[number];

export const MODEL_FEEDBACK_VERDICT_LABELS: Record<
  ModelFeedbackVerdict,
  string
> = {
  helpful: "Helpful",
  not_helpful: "Not helpful",
  accepted: "Accepted",
  modified: "Modified",
  rejected: "Rejected",
  confirmed: "Confirmed",
  corrected: "Corrected",
  commented: "Commented",
};

export const MODEL_FEEDBACK_RELATED_TYPES = [
  "program_adaptation",
  "coach_ai_suggestion",
  "recommendation",
  "program_ai_review",
  "insight",
  "technique_expert_review",
  "coach_chat",
  "coach_brain",
  "pr_prediction",
  "goal_probability",
  "exercise_prescription",
  "weak_point",
  "daily_brief",
  "fatigue_alert",
  "deload_intelligence",
] as const;
export type ModelFeedbackRelatedType =
  (typeof MODEL_FEEDBACK_RELATED_TYPES)[number];

export const MODEL_FEEDBACK_USES = [
  "product_analytics",
  "rule_improvement",
  "future_model_evaluation",
] as const;

export const MODEL_FEEDBACK_HONESTY = [
  "Feedback improves product analytics, rule review, and future model evaluation.",
  "Production AI is never automatically retrained from unreviewed feedback.",
  "Optional reasons stay in the feedback record — they are not sent to product analytics.",
] as const;

export function isAthleteFeedbackVerdict(
  value: string,
): value is AthleteFeedbackVerdict {
  return (ATHLETE_FEEDBACK_VERDICTS as readonly string[]).includes(value);
}

export function isCoachFeedbackVerdict(
  value: string,
): value is CoachFeedbackVerdict {
  return (COACH_FEEDBACK_VERDICTS as readonly string[]).includes(value);
}

export function isExpertFeedbackVerdict(
  value: string,
): value is ExpertFeedbackVerdict {
  return (EXPERT_FEEDBACK_VERDICTS as readonly string[]).includes(value);
}

export function isModelFeedbackVerdict(
  value: string,
): value is ModelFeedbackVerdict {
  return (MODEL_FEEDBACK_VERDICTS as readonly string[]).includes(value);
}

export function isModelFeedbackRelatedType(
  value: string,
): value is ModelFeedbackRelatedType {
  return (MODEL_FEEDBACK_RELATED_TYPES as readonly string[]).includes(value);
}

export function verdictsAllowedForRole(
  role: ModelFeedbackRole,
): readonly ModelFeedbackVerdict[] {
  if (role === "athlete") return ATHLETE_FEEDBACK_VERDICTS;
  if (role === "expert") return EXPERT_FEEDBACK_VERDICTS;
  return COACH_FEEDBACK_VERDICTS;
}

/**
 * Hard rule: feedback storage must never trigger production retrain.
 */
export function mayAutoRetrainFromFeedback(): false {
  return false;
}
