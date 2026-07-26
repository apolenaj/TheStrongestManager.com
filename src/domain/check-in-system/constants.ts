/**
 * Weekly Check-in System (Prompt 133).
 * Customizable weekly check-in — training-safe questions only; not a medical intake.
 */

export const CHECK_IN_ENGINE_VERSION = "check_in_system.v1" as const;

export const CHECK_IN_HONESTY = [
  "Weekly check-ins collect training and recovery context you choose to share — not a medical assessment.",
  "Questions stay on training, recovery feel, bodyweight, and goal progress — we do not ask excessive sensitive health questions.",
  "Coaches may configure which allowlisted questions appear; they cannot enable forbidden sensitive topics.",
  "AI summaries are labelled AI summary and never invent medical diagnoses from your answers.",
] as const;

export const CHECK_IN_AI_SUMMARY_LABEL = "AI summary" as const;
export const CHECK_IN_AI_SUMMARY_DISCLAIMER =
  "AI summary of this weekly check-in — not a diagnosis, medical advice, or coach note." as const;

export const CHECK_IN_CATEGORIES = [
  "training",
  "recovery",
  "bodyweight",
  "goal_progress",
] as const;

export type CheckInCategory = (typeof CHECK_IN_CATEGORIES)[number];

export const CHECK_IN_CATEGORY_LABELS: Record<CheckInCategory, string> = {
  training: "Training",
  recovery: "Recovery",
  bodyweight: "Bodyweight",
  goal_progress: "Goal progress",
};

export const CHECK_IN_ANSWER_TYPES = [
  "scale_1_5",
  "number",
  "short_text",
  "boolean",
] as const;

export type CheckInAnswerType = (typeof CHECK_IN_ANSWER_TYPES)[number];

export type CheckInQuestionDef = {
  key: string;
  category: CheckInCategory;
  prompt: string;
  answerType: CheckInAnswerType;
  /** Shown as helper — training-safe framing only. */
  helper?: string;
  enabledByDefault: boolean;
  sortOrder: number;
};

/**
 * Allowlisted weekly check-in questions.
 * Coaches may only enable keys from this catalog.
 */
export const CHECK_IN_QUESTION_CATALOG: readonly CheckInQuestionDef[] = [
  {
    key: "training_sessions_completed",
    category: "training",
    prompt: "How many planned training sessions did you complete this week?",
    answerType: "number",
    helper: "Count completed sessions only.",
    enabledByDefault: true,
    sortOrder: 10,
  },
  {
    key: "training_quality",
    category: "training",
    prompt: "Overall, how did training quality feel this week?",
    answerType: "scale_1_5",
    helper: "1 = rough · 5 = excellent",
    enabledByDefault: true,
    sortOrder: 20,
  },
  {
    key: "training_focus_note",
    category: "training",
    prompt: "Anything notable about training this week? (optional)",
    answerType: "short_text",
    enabledByDefault: false,
    sortOrder: 30,
  },
  {
    key: "recovery_feel",
    category: "recovery",
    prompt: "How recovered do you feel heading into next week?",
    answerType: "scale_1_5",
    helper: "Subjective feel only — not a medical readiness score.",
    enabledByDefault: true,
    sortOrder: 40,
  },
  {
    key: "sleep_consistency",
    category: "recovery",
    prompt: "Was sleep timing fairly consistent this week?",
    answerType: "boolean",
    helper: "Yes/no habit check — not a sleep study.",
    enabledByDefault: true,
    sortOrder: 50,
  },
  {
    key: "stress_manageable",
    category: "recovery",
    prompt: "Was life stress generally manageable for training?",
    answerType: "boolean",
    helper: "High-level only — not a clinical stress screen.",
    enabledByDefault: false,
    sortOrder: 60,
  },
  {
    key: "bodyweight_kg",
    category: "bodyweight",
    prompt: "Current bodyweight (kg), if you track it",
    answerType: "number",
    helper: "Optional. Skip if you prefer not to share.",
    enabledByDefault: true,
    sortOrder: 70,
  },
  {
    key: "bodyweight_trend",
    category: "bodyweight",
    prompt: "Bodyweight trend this week?",
    answerType: "short_text",
    helper: "e.g. stable / up slightly / down slightly — optional.",
    enabledByDefault: false,
    sortOrder: 80,
  },
  {
    key: "goal_on_track",
    category: "goal_progress",
    prompt: "Do you feel on track toward your main training goal?",
    answerType: "boolean",
    enabledByDefault: true,
    sortOrder: 90,
  },
  {
    key: "goal_progress_note",
    category: "goal_progress",
    prompt: "One sentence on goal progress (optional)",
    answerType: "short_text",
    enabledByDefault: true,
    sortOrder: 100,
  },
] as const;

/**
 * Topics we refuse to add as check-in questions.
 * Coaches cannot enable these — architecture guard against excessive sensitive health asks.
 */
export const CHECK_IN_FORBIDDEN_SENSITIVE_TOPICS = [
  "medical diagnosis",
  "prescription medication",
  "mental health screening",
  "depression questionnaire",
  "anxiety disorder assessment",
  "suicidal ideation",
  "disordered eating screen",
  "body image pathology",
  "reproductive health",
  "sexual health",
  "pregnancy status",
  "substance abuse screen",
  "blood labs / biomarkers as intake",
  "injury diagnosis",
  "pain location mapping for medical triage",
] as const;

export const CHECK_IN_STATUSES = ["pending", "submitted"] as const;
export type CheckInStatus = (typeof CHECK_IN_STATUSES)[number];

export function catalogByKey(): Map<string, CheckInQuestionDef> {
  return new Map(CHECK_IN_QUESTION_CATALOG.map((q) => [q.key, q]));
}

export function defaultEnabledQuestionKeys(): string[] {
  return CHECK_IN_QUESTION_CATALOG.filter((q) => q.enabledByDefault).map(
    (q) => q.key,
  );
}

export function isAllowlistedQuestionKey(key: string): boolean {
  return catalogByKey().has(key);
}
