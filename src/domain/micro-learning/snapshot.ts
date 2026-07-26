import {
  MICRO_LEARNING_COMPLETE_COOLDOWN_HOURS,
  MICRO_LEARNING_DISMISS_COOLDOWN_HOURS,
  MICRO_LEARNING_ENGINE_VERSION,
  MICRO_LEARNING_HONESTY,
  MICRO_LEARNING_LESSON_COOLDOWN_HOURS,
  MICRO_LEARNING_MAX_PER_DAY,
} from "@/domain/micro-learning/constants";
import { MICRO_LESSONS, allMicroLessonIds } from "@/domain/micro-learning/catalog";

export type MicroLearningQualityCheck = {
  id:
    | "example_lessons"
    | "anti_spam_caps"
    | "personalization_tags"
    | "one_minute_length";
  label: string;
  ok: boolean;
  detail: string;
};

export function evaluateMicroLearningQuality(): {
  passed: boolean;
  checks: MicroLearningQualityCheck[];
} {
  const ids = new Set(allMicroLessonIds());
  const required = [
    "what-rpe-means",
    "why-bracing-matters",
    "when-to-deload",
  ] as const;
  const checks: MicroLearningQualityCheck[] = [
    {
      id: "example_lessons",
      label: "Prompt examples present (RPE, bracing, deload)",
      ok: required.every((id) => ids.has(id)),
      detail: required.join(", "),
    },
    {
      id: "anti_spam_caps",
      label: "Anti-spam caps configured",
      ok:
        MICRO_LEARNING_MAX_PER_DAY === 1 &&
        MICRO_LEARNING_DISMISS_COOLDOWN_HOURS >= 24 &&
        MICRO_LEARNING_COMPLETE_COOLDOWN_HOURS >= 12,
      detail: `max/day ${MICRO_LEARNING_MAX_PER_DAY}; dismiss ${MICRO_LEARNING_DISMISS_COOLDOWN_HOURS}h; complete ${MICRO_LEARNING_COMPLETE_COOLDOWN_HOURS}h; lesson ${MICRO_LEARNING_LESSON_COOLDOWN_HOURS}h`,
    },
    {
      id: "personalization_tags",
      label: "Every lesson has goal + sport tags",
      ok: MICRO_LESSONS.every(
        (l) => l.goalTags.length > 0 && l.sportTags.length > 0,
      ),
      detail: `${MICRO_LESSONS.length} lessons`,
    },
    {
      id: "one_minute_length",
      label: "Cards stay ~1 minute",
      ok: MICRO_LESSONS.every(
        (l) =>
          l.estimatedSeconds >= 40 &&
          l.estimatedSeconds <= 90 &&
          l.body.trim().length >= 80 &&
          l.body.trim().length <= 700,
      ),
      detail: "40–90s · body length gated",
    },
  ];
  return { passed: checks.every((c) => c.ok), checks };
}

export type MicroLearningSnapshot = {
  engineVersion: typeof MICRO_LEARNING_ENGINE_VERSION;
  generatedAt: string;
  honesty: readonly string[];
  lessonCount: number;
  lessonIds: string[];
  maxPerDay: number;
  dismissCooldownHours: number;
  completeCooldownHours: number;
  quality: ReturnType<typeof evaluateMicroLearningQuality>;
};

export function buildMicroLearningSnapshot(): MicroLearningSnapshot {
  return {
    engineVersion: MICRO_LEARNING_ENGINE_VERSION,
    generatedAt: new Date().toISOString(),
    honesty: MICRO_LEARNING_HONESTY,
    lessonCount: MICRO_LESSONS.length,
    lessonIds: allMicroLessonIds(),
    maxPerDay: MICRO_LEARNING_MAX_PER_DAY,
    dismissCooldownHours: MICRO_LEARNING_DISMISS_COOLDOWN_HOURS,
    completeCooldownHours: MICRO_LEARNING_COMPLETE_COOLDOWN_HOURS,
    quality: evaluateMicroLearningQuality(),
  };
}
