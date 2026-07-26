/**
 * Pain-Safe Response System (Prompt 126).
 * Safety layer: stop aggressive training advice; seek qualified evaluation; never diagnose.
 */

export const PAIN_SAFE_ENGINE_VERSION = "pain_safe_response_system.v1" as const;

export const PAIN_SAFE_RESPONSE_HONESTY = [
  "This is a safety layer — not a diagnosis, medical assessment, or treatment plan.",
  "If you report sharp pain, neurological symptoms, or a serious injury, aggressive training recommendations are withheld.",
  "Seek evaluation from a qualified medical professional who knows your history.",
  "You decide next steps with your clinician; this app never diagnoses injury or disease.",
] as const;

export const PAIN_SAFE_SEEK_CARE_MESSAGE =
  "Stop aggressive training progression for now and seek evaluation from a qualified medical professional. This app does not diagnose." as const;

export const PAIN_SAFE_CATEGORIES = [
  "sharp_pain",
  "neurological",
  "serious_injury",
] as const;

export type PainSafeCategory = (typeof PAIN_SAFE_CATEGORIES)[number];

export const PAIN_SAFE_CATEGORY_LABELS: Record<PainSafeCategory, string> = {
  sharp_pain: "Sharp pain",
  neurological: "Neurological symptoms",
  serious_injury: "Serious injury",
};

/** Recommendation kinds that must be suppressed in pain-safe mode. */
export const PAIN_SAFE_AGGRESSIVE_KINDS = [
  "increase_load",
  "increase_volume",
  "aggressive_attempt",
  "optimistic_pr",
  "progression_push",
] as const;

export type PainSafeAggressiveKind =
  (typeof PAIN_SAFE_AGGRESSIVE_KINDS)[number];

export const PAIN_SAFE_SURFACES = [
  "adaptations",
  "pr_prediction",
  "attempt_selector",
  "coach_brain",
  "program_builder",
  "goal_probability",
] as const;

export type PainSafeSurface = (typeof PAIN_SAFE_SURFACES)[number];

/** Forbidden product language — never diagnose. */
export const PAIN_SAFE_FORBIDDEN_PHRASES = [
  "you have a tear",
  "you are diagnosed",
  "this is a herniated",
  "you have a fracture",
  "medical diagnosis:",
  "i diagnose",
] as const;
