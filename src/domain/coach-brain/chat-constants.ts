export const COACH_CHAT_SUGGESTED_QUESTIONS = [
  "Should I increase my deadlift next week?",
  "Why did my bench stop progressing?",
  "Should I deload?",
  "Which accessory should I change?",
  "How am I progressing toward a 300 kg deadlift?",
] as const;

export const COACH_CHAT_INTENTS = [
  "increase_deadlift",
  "bench_stall",
  "deload",
  "accessory_change",
  "goal_deadlift_300",
  "safety_refusal",
  "general",
] as const;

export type CoachChatIntent = (typeof COACH_CHAT_INTENTS)[number];

export const COACH_CHAT_HONESTY = [
  "Answers use your logged athlete data only — missing signals are stated, never invented.",
  "Recovery, fatigue, and technique language stays coaching-practice, not medical diagnosis.",
  "Program changes are suggestions that still require your explicit confirmation.",
] as const;
