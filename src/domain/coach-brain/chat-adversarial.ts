/**
 * Detect adversarial / unsafe coach-chat asks and build safe refusals.
 * Used by Coach chat before normal intent routing (Prompt 181).
 */

export const COACH_CHAT_ADVERSARIAL_KINDS = [
  "injury_max",
  "sleep_deprivation_max",
  "medical_diagnosis_request",
  "guaranteed_gain",
] as const;

export type CoachChatAdversarialKind =
  (typeof COACH_CHAT_ADVERSARIAL_KINDS)[number];

export type CoachChatAdversarialHit = {
  kind: CoachChatAdversarialKind;
  /** Safe athlete-facing refusal. */
  content: string;
};

const INJURY_OR_PAIN =
  /\b(hurt|injur(y|ed)|pain|strained|tweaked|sore back|back is out)\b/i;
const MAX_OR_PR_ATTEMPT =
  /\b(max(ing|es|ed)?|max out|1\s*rm|one[- ]rep max|pr attempt|attempt a pr|want (a |to )?pr|max today)\b/i;
const SLEEP_DEBT =
  /\b(slept|sleep(ing)?)\s*(\d+|one|two|three)\s*(hours?|hrs?)\b/i;
const DIAGNOSIS_ASK =
  /\b(what injury|exactly what injury|diagnose|diagnosis|tell me.*(injury|tear|fracture)|which injury)\b/i;
const GUARANTEE_GAIN =
  /\b(guarante(e|ed)|promise)\b.*\b(\d+\s*kg|pr|increase|gain|personal record)\b/i;
const GUARANTEE_GAIN_ALT =
  /\b(guaranteed?\s+\d+\s*kg|guarantee me a pr|guaranteed pr)\b/i;

/**
 * Returns a safe refusal when the question is an adversarial unsafe ask.
 */
export function detectCoachChatAdversarial(
  question: string,
): CoachChatAdversarialHit | null {
  const q = question.trim();
  if (!q) return null;

  if (DIAGNOSIS_ASK.test(q)) {
    return {
      kind: "medical_diagnosis_request",
      content:
        "I cannot tell you what injury you have and I will not diagnose any condition. Seek evaluation from a qualified medical professional. This app does not diagnose. I can help with training questions that use your logged sessions, technique, and recovery data — not medical labels.",
    };
  }

  if (INJURY_OR_PAIN.test(q) && MAX_OR_PR_ATTEMPT.test(q)) {
    return {
      kind: "injury_max",
      content:
        "I will not recommend a max or PR attempt while you report pain or injury. Stop aggressive loading for now and seek evaluation from a qualified medical professional. This app does not diagnose. When you are cleared to train, we can revisit load using your logged data — not today as a max.",
    };
  }

  if (SLEEP_DEBT.test(q) && MAX_OR_PR_ATTEMPT.test(q)) {
    return {
      kind: "sleep_deprivation_max",
      content:
        "I will not prescribe a max attempt after severe sleep restriction. With only a few hours of sleep, skip maxing today and prioritize rest and an easier session if you train at all. This is coaching caution, not medical advice.",
    };
  }

  if (GUARANTEE_GAIN.test(q) || GUARANTEE_GAIN_ALT.test(q)) {
    return {
      kind: "guaranteed_gain",
      content:
        "I cannot guarantee a strength increase, PR, or any specific kilogram jump (including 50 kg). Progress depends on training history, recovery, technique, and many other factors. Any load change is a suggestion that requires your explicit confirmation and is never guaranteed.",
    };
  }

  return null;
}
