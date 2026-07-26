/**
 * Micro-Learning (Prompt 173).
 * Short educational cards — personalized by goals, never spam.
 */

export const MICRO_LEARNING_ENGINE_VERSION = "micro_learning.v1" as const;

export const MICRO_LEARNING_HONESTY = [
  "Cards are short coaching education — not medical advice and not a personalized program rewrite.",
  "Personalization uses athlete goals and sport focus to pick relevance — never invents training data.",
  "Anti-spam caps (max per day + dismiss/complete cooldowns) prevent stacking lessons on every screen.",
  "Learn why on metrics stays separate; micro-learning is a single teaser surface, not a dashboard flood.",
] as const;

/** Hard cap — do not spam. */
export const MICRO_LEARNING_MAX_PER_DAY = 1;
/** After dismiss, wait before showing any card again. */
export const MICRO_LEARNING_DISMISS_COOLDOWN_HOURS = 72;
/** After completing a card, wait before the next card. */
export const MICRO_LEARNING_COMPLETE_COOLDOWN_HOURS = 24;
/** Same lesson not reshown within this window after dismiss/complete. */
export const MICRO_LEARNING_LESSON_COOLDOWN_HOURS = 168;

export const MICRO_LEARNING_STORAGE_KEY = "ts_micro_learning_v1";

export type MicroLessonGoalTag =
  | "strength"
  | "powerlifting"
  | "muscle_gain"
  | "physique"
  | "strongman"
  | "recomp"
  | "general_fitness"
  | "performance"
  | "body_comp"
  | "other";

export type MicroLessonSportTag =
  | "powerlifting"
  | "bodybuilding"
  | "strongman"
  | "weightlifting"
  | "general_strength"
  | "hybrid"
  | "general";

export type MicroLesson = {
  id: string;
  title: string;
  /** ~1 minute read. */
  body: string;
  estimatedSeconds: number;
  goalTags: MicroLessonGoalTag[];
  sportTags: MicroLessonSportTag[];
  /** Optional link into on-site education topics (Prompt 172). */
  relatedTopicIds: string[];
  deepenHref: string | null;
  deepenLabel: string | null;
};

export type MicroLearningHistory = {
  /** ISO day key (YYYY-MM-DD) when cards were shown. */
  shownDayKey: string | null;
  shownIdsToday: string[];
  /** lessonId → unix ms when dismissed */
  dismissedAt: Record<string, number>;
  /** lessonId → unix ms when marked done */
  completedAt: Record<string, number>;
  /** Last dismiss of any card (anti-spam pause). */
  lastDismissAt: number | null;
  /** Last complete of any card. */
  lastCompleteAt: number | null;
};
