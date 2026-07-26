/**
 * Safety System 2.0 (Prompt 180).
 * Central recommendation safety validator — block or modify unsafe advice.
 * Not a medical device; never diagnoses.
 */

export const SAFETY_SYSTEM_ENGINE_VERSION = "safety_system.v2" as const;

export const SAFETY_SYSTEM_HONESTY = [
  "Safety System 2.0 validates training recommendations before they reach athletes — it is not a medical diagnosis engine.",
  "Blocked or modified advice fails closed: prefer withhold or soften over inventing a safer protocol.",
  "Thresholds are product safety heuristics, not clinical guidelines or individualized medical advice.",
  "Pain-safe mode and Coach Brain forbidden patterns remain complementary layers; this is the central recommendation gate.",
] as const;

export const SAFETY_RULE_IDS = [
  "unsafe_max_frequency",
  "extreme_volume",
  "dangerous_rapid_weight_loss",
  "medical_diagnosis",
  "pain_ignoring",
] as const;

export type SafetyRuleId = (typeof SAFETY_RULE_IDS)[number];

export type SafetyAction = "allow" | "modify" | "block";

export type SafetyRuleDefinition = {
  id: SafetyRuleId;
  title: string;
  description: string;
  defaultAction: Exclude<SafetyAction, "allow">;
};

export const SAFETY_RULES: readonly SafetyRuleDefinition[] = [
  {
    id: "unsafe_max_frequency",
    title: "Unsafe max-frequency",
    description:
      "Blocks or caps recommendations that push extreme session frequency (e.g. daily max-effort on the same lift family).",
    defaultAction: "modify",
  },
  {
    id: "extreme_volume",
    title: "Extreme volume",
    description:
      "Blocks or softens recommendations that prescribe extreme weekly hard-set volume without recovery context.",
    defaultAction: "modify",
  },
  {
    id: "dangerous_rapid_weight_loss",
    title: "Dangerous rapid weight loss",
    description:
      "Blocks dehydration / crash-cut style advice and extreme weekly bodyweight loss prescriptions.",
    defaultAction: "block",
  },
  {
    id: "medical_diagnosis",
    title: "Medical diagnosis",
    description:
      "Blocks language that diagnoses injury or disease. Direct athletes to qualified clinicians instead.",
    defaultAction: "block",
  },
  {
    id: "pain_ignoring",
    title: "Pain-ignoring recommendations",
    description:
      "Blocks aggressive progression when pain-safe mode is active or text tells athletes to push through sharp/neurological pain.",
    defaultAction: "block",
  },
] as const;

/** Product heuristic caps — not clinical standards. */
export const SAFETY_THRESHOLDS = {
  /** Sessions/week above this → modify (cap suggestion). */
  maxSessionsPerWeekSoft: 6,
  /** Sessions/week above this → block. */
  maxSessionsPerWeekHard: 8,
  /** Hard sets on a single lift/muscle family per week. */
  maxHardSetsPerLiftSoft: 25,
  maxHardSetsPerLiftHard: 40,
  /** Total estimated hard sets across lifts. */
  maxWeeklyHardSetsSoft: 80,
  maxWeeklyHardSetsHard: 120,
  /** Proposed bodyweight loss kg/week. */
  maxWeightLossKgPerWeekSoft: 0.75,
  maxWeightLossKgPerWeekHard: 1.0,
} as const;

export const MEDICAL_DIAGNOSIS_PATTERNS: readonly RegExp[] = [
  /\byou have (a |an )?(tear|fracture|herniation|herniated|diagnosis|disease|disorder)\b/i,
  /\b(i|we) diagnose\b/i,
  /\bmedical diagnosis\s*:/i,
  /\bthis is (definitely |clearly )?(a )?(herniated disc|acl tear|muscle tear|stress fracture)\b/i,
  /\byou are diagnosed\b/i,
  /\bprescribe (you )?(medication|opioids|steroids)\b/i,
];

export const PAIN_IGNORING_PATTERNS: readonly RegExp[] = [
  /\bpush through (the )?(sharp )?pain\b/i,
  /\bignoring? (the )?pain\b/i,
  /\bpain is weakness\b/i,
  /\bno pain,? no gain\b/i,
  /\btrain through (sharp |neurological )?pain\b/i,
  /\bignore (your )?pain and (add|increase|max)\b/i,
];

export const RAPID_WEIGHT_LOSS_PATTERNS: readonly RegExp[] = [
  /\bdehydrat(e|ion)\b/i,
  /\bwater cut\b/i,
  /\bsauna cut\b/i,
  /\bdiuretic\b/i,
  /\bcrash cut\b/i,
  /\blose \d+(\.\d+)?\s*(kg|kilos|pounds|lbs)\s*(in|per)\s*(a |one )?(day|days|week)\b/i,
  /\bdrop \d+(\.\d+)?\s*%\s*(body\s*)?weight\s*(in|this)\s*week\b/i,
];

export const UNSAFE_FREQUENCY_PATTERNS: readonly RegExp[] = [
  /\bevery day\b.*\b(max|1rm|peaking|competition)\b/i,
  /\b(max|1rm|competition attempt).*\bevery day\b/i,
  /\b7\s*(hard\s*)?sessions?\s*(a|per)\s*week\b/i,
  /\btrain\s+(the\s+)?same\s+lift\s+daily\b/i,
  /\bdaily\s+(max|heavy)\s+(squat|bench|deadlift|pulls?)\b/i,
];

export const EXTREME_VOLUME_PATTERNS: readonly RegExp[] = [
  /\b\d{3,}\s*(hard\s*)?sets?\s*(a|per)\s*week\b/i,
  /\bdouble\s+volume\s+immediately\b/i,
  /\bextreme\s+volume\s+block\b/i,
  /\bdo\s+as\s+many\s+sets\s+as\s+possible\s+every\s+day\b/i,
];
