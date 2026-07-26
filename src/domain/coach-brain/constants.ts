export const COACH_BRAIN_ENGINE_VERSION = "coach_brain.v1" as const;

/** Deterministic reasoning until a real LLM adapter is registered. */
export const COACH_BRAIN_STUB_ADAPTER_ID = "stub.deterministic" as const;

export const COACH_BRAIN_TOOL_NAMES = [
  "getAthleteProfile",
  "getRecentTraining",
  "getTechniqueTrend",
  "getRecoveryTrend",
  "getProgramContext",
  "getGoalProgress",
  "getRecentPRs",
  "getNutritionSummary",
  "getAthleteState",
] as const;

export type CoachBrainToolName = (typeof COACH_BRAIN_TOOL_NAMES)[number];

export const COACH_BRAIN_AUDIT_ACTIONS = [
  "run.started",
  "tools.gathered",
  "rules.evaluated",
  "reasoning.completed",
  "safety.rejected",
  "safety.passed",
  "recommendation.emitted",
  "chat.answered",
] as const;

export type CoachBrainAuditAction = (typeof COACH_BRAIN_AUDIT_ACTIONS)[number];

export const COACH_BRAIN_HONESTY = [
  "The AI Coach Brain reasons from structured athlete data and deterministic rules — it is not a generic chatbot.",
  "It never modifies programs without explicit athlete confirmation.",
  "Outputs are structured recommendations with concise reasoning summaries — not hidden chain-of-thought.",
  "Missing data stays listed in missingInformation — scores, macros, and medical claims are never invented.",
  "Fatigue and recovery language is coaching-practice heuristic, not a diagnosis.",
  "Recommendations account for stale data — technique, recovery, and strength freshness cap confidence when signals age out.",
  "If the AI layer fails, structured failure states are shown — never fabricated coaching text.",
] as const;

/** Phrases that fail safety validation if they appear in recommendation text. */
export const COACH_BRAIN_FORBIDDEN_CLAIM_PATTERNS = [
  /\bdiagnos(e|is|ed)\b/i,
  /\bmedical\s+(advice|treatment|device)\b/i,
  /\bguaranteed?\b/i,
  /\bclinically\s+proven\b/i,
  /\bprescrib(e|ed|ing)\s+\d+\s*(kcal|calories)\b/i,
  /\bauto[- ]?appl(y|ied)\b/i,
  /\binjur(y|ies)\s+will\b/i,
] as const;
