export {
  COACH_BRAIN_ENGINE_VERSION,
  COACH_BRAIN_STUB_ADAPTER_ID,
  COACH_BRAIN_TOOL_NAMES,
  COACH_BRAIN_AUDIT_ACTIONS,
  COACH_BRAIN_HONESTY,
  COACH_BRAIN_FORBIDDEN_CLAIM_PATTERNS,
} from "@/domain/coach-brain/constants";
export type {
  CoachBrainToolName,
  CoachBrainAuditAction,
} from "@/domain/coach-brain/constants";
export type {
  CoachBrainRecommendation,
  CoachSupportingDatum,
  CoachRecommendedAction,
  CoachBrainToolBag,
  CoachBrainToolResult,
  CoachBrainRuleHit,
  CoachBrainSafetyFlag,
  CoachBrainReasoningResult,
  CoachBrainRunResult,
  CoachBrainAuditWrite,
} from "@/domain/coach-brain/types";
export { evaluateCoachBrainRules } from "@/domain/coach-brain/rules";
export { validateCoachBrainRecommendations } from "@/domain/coach-brain/safety";
export {
  stubCoachBrainReasoningAdapter,
  getCoachBrainReasoningAdapter,
  registerCoachBrainReasoningAdapter,
  resetCoachBrainReasoningAdapterForTests,
} from "@/domain/coach-brain/reasoning-adapter";
export type { CoachBrainReasoningAdapter } from "@/domain/coach-brain/reasoning-adapter";
export {
  COACH_CHAT_SUGGESTED_QUESTIONS,
  COACH_CHAT_INTENTS,
  COACH_CHAT_HONESTY,
} from "@/domain/coach-brain/chat-constants";
export type { CoachChatIntent } from "@/domain/coach-brain/chat-constants";
export {
  classifyCoachChatIntent,
  buildCoachChatAnswer,
} from "@/domain/coach-brain/chat";
export type {
  CoachChatAnswer,
  CoachChatDataRef,
  CoachChatDataRefKind,
} from "@/domain/coach-brain/chat";
export {
  detectCoachChatAdversarial,
  COACH_CHAT_ADVERSARIAL_KINDS,
} from "@/domain/coach-brain/chat-adversarial";
export type {
  CoachChatAdversarialHit,
  CoachChatAdversarialKind,
} from "@/domain/coach-brain/chat-adversarial";
