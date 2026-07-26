/**
 * Allowlisted 1-minute micro-learning cards (Prompt 173).
 */

import type { MicroLesson } from "@/domain/micro-learning/constants";

export const MICRO_LESSONS: readonly MicroLesson[] = [
  {
    id: "what-rpe-means",
    title: "What RPE means",
    body: "RPE is Rate of Perceived Exertion — how hard a set felt on a 1–10 scale. In this product it is athlete-reported on sets and sessions. It helps plan load and flag dense work (often RPE ≥ 8), but it is not a lab fatigue score. Missing RPE stays blank; we never invent it from video.",
    estimatedSeconds: 60,
    goalTags: [
      "strength",
      "powerlifting",
      "performance",
      "muscle_gain",
      "physique",
      "general_fitness",
    ],
    sportTags: [
      "powerlifting",
      "bodybuilding",
      "strongman",
      "general_strength",
      "hybrid",
      "general",
    ],
    relatedTopicIds: ["rpe"],
    deepenHref: "/app/today",
    deepenLabel: "Log RPE in Today",
  },
  {
    id: "why-bracing-matters",
    title: "Why bracing matters",
    body: "Bracing creates torso stiffness so force transfers through the bar instead of leaking into a soft midsection. Think: breath in, expand 360°, hold through the hard part of the rep, then reset. It is a skill for squats, deadlifts, and presses — not a cue to hold your breath for an entire set. Film a side view when you want technique feedback on setup.",
    estimatedSeconds: 60,
    goalTags: ["strength", "powerlifting", "performance", "strongman"],
    sportTags: [
      "powerlifting",
      "strongman",
      "weightlifting",
      "general_strength",
      "hybrid",
    ],
    relatedTopicIds: ["technique_confidence", "technique"],
    deepenHref: "/app/technique",
    deepenLabel: "Technique uploads",
  },
  {
    id: "when-to-deload",
    title: "When to deload",
    body: "A deload is a planned easier week — lower volume and/or intensity — so you can recover and keep progressing. Common cues: performance stalls, sleep and readiness drop, or you just finished a hard block. Deload intelligence in-app uses logged signals when available; this card is education, not an auto-prescription. If you feel broken, stop and seek clinical care — we do not diagnose injury.",
    estimatedSeconds: 70,
    goalTags: [
      "strength",
      "powerlifting",
      "performance",
      "muscle_gain",
      "physique",
      "strongman",
    ],
    sportTags: [
      "powerlifting",
      "bodybuilding",
      "strongman",
      "general_strength",
      "hybrid",
      "general",
    ],
    relatedTopicIds: ["training_volume", "recovery"],
    deepenHref: "/app/recovery",
    deepenLabel: "Recovery dashboard",
  },
  {
    id: "training-volume-basics",
    title: "1-minute lesson: training volume",
    body: "Volume here means estimated tonnage — load × reps from logged sets. More kilograms moved is not automatically a better week. Quality, proximity to failure, and recovery matter. Charts exclude sets missing load or reps rather than inventing numbers.",
    estimatedSeconds: 55,
    goalTags: [
      "muscle_gain",
      "physique",
      "strength",
      "recomp",
      "body_comp",
      "general_fitness",
    ],
    sportTags: ["bodybuilding", "general_strength", "hybrid", "general"],
    relatedTopicIds: ["training_volume"],
    deepenHref: "/app/progress",
    deepenLabel: "Volume on Progress",
  },
  {
    id: "technique-confidence-basics",
    title: "1-minute lesson: technique confidence",
    body: "Confidence describes how much observable camera evidence supported an analysis — High, Moderate, Low, or Insufficient data. Low confidence usually means angle or landmark coverage, not that you “failed.” We withhold scores rather than invent precise numbers from poor video.",
    estimatedSeconds: 55,
    goalTags: ["strength", "powerlifting", "performance", "strongman"],
    sportTags: [
      "powerlifting",
      "strongman",
      "weightlifting",
      "general_strength",
      "hybrid",
    ],
    relatedTopicIds: ["technique_confidence"],
    deepenHref: "/app/technique",
    deepenLabel: "Open Technique",
  },
  {
    id: "powerlifting-specificity",
    title: "1-minute lesson: specificity",
    body: "If competing in powerlifting matters, squat, bench, and deadlift practice must show up in the week — accessories support the total, they do not replace it. Log competition lifts as themselves so Progress and Powerlifting Mode stay honest.",
    estimatedSeconds: 50,
    goalTags: ["powerlifting", "performance", "strength"],
    sportTags: ["powerlifting"],
    relatedTopicIds: ["strength", "programming"],
    deepenHref: "/app/powerlifting",
    deepenLabel: "Powerlifting Mode",
  },
] as const;

export function getMicroLesson(id: string): MicroLesson | undefined {
  return MICRO_LESSONS.find((l) => l.id === id);
}

export function allMicroLessonIds(): string[] {
  return MICRO_LESSONS.map((l) => l.id);
}
