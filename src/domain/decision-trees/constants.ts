/**
 * Decision Tree Coaching Tools (Prompt 116).
 * Interactive structured rules — coaching education, not medical advice.
 */

export const DECISION_TREE_ENGINE_VERSION = "decision_tree_coaching.v1" as const;

export const DECISION_TREE_HONESTY = [
  "These decision trees use transparent coaching rules. They explain how an answer was reached — they do not replace a coach, clinician, or professional medical advice.",
  "Pain, injury, illness, pregnancy, or red-flag symptoms need qualified care. Do not use a decision tree as a diagnosis or treatment plan.",
  "Outputs are educational suggestions for healthy trainees in typical gym contexts. Your sport rules, equipment, and recovery still matter.",
] as const;

export const DECISION_TREE_MEDICAL_DISCLAIMER =
  "Not medical advice. If you have pain, injury, dizziness, chest pain, unexplained weakness, or other concerning symptoms, stop and seek professional care. This tool cannot replace a clinician or coach who knows you." as const;

export const DECISION_TREE_INDEX_DESCRIPTION =
  "Interactive coaching decision trees with structured rules and explained outputs — deload, load increases, deadlift variation, and volume.";
