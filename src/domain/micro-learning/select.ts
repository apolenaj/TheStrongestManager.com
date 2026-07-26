/**
 * Select at most one micro-lesson — personalized, anti-spam.
 */

import {
  MICRO_LEARNING_COMPLETE_COOLDOWN_HOURS,
  MICRO_LEARNING_DISMISS_COOLDOWN_HOURS,
  MICRO_LEARNING_LESSON_COOLDOWN_HOURS,
  MICRO_LEARNING_MAX_PER_DAY,
  type MicroLearningHistory,
  type MicroLesson,
} from "@/domain/micro-learning/constants";
import { MICRO_LESSONS } from "@/domain/micro-learning/catalog";

export type MicroLearningSelectInput = {
  goalCategories: string[];
  primaryDiscipline: string | null;
  preferredSports?: string[];
  history: MicroLearningHistory;
  now: Date;
  /** Optional day key override for tests (YYYY-MM-DD). */
  dayKey?: string;
};

function hoursBetween(fromMs: number, toMs: number): number {
  return (toMs - fromMs) / (3600 * 1000);
}

export function dayKeyFromDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function emptyMicroLearningHistory(): MicroLearningHistory {
  return {
    shownDayKey: null,
    shownIdsToday: [],
    dismissedAt: {},
    completedAt: {},
    lastDismissAt: null,
    lastCompleteAt: null,
  };
}

function normalizeTag(raw: string): string {
  return raw.toLowerCase().trim().replace(/\s+/g, "_");
}

function scoreLesson(
  lesson: MicroLesson,
  goalCategories: string[],
  sports: string[],
): number {
  const goals = new Set(goalCategories.map(normalizeTag));
  const sportSet = new Set(sports.map(normalizeTag));
  let score = 0;
  for (const g of lesson.goalTags) {
    if (goals.has(g)) score += 3;
  }
  for (const s of lesson.sportTags) {
    if (sportSet.has(s)) score += 2;
  }
  // Mild baseline so general cards can still appear when nothing matches.
  if (score === 0) score = 1;
  return score;
}

function lessonBlocked(
  lesson: MicroLesson,
  history: MicroLearningHistory,
  nowMs: number,
): boolean {
  const dismissed = history.dismissedAt[lesson.id];
  if (
    dismissed != null &&
    hoursBetween(dismissed, nowMs) < MICRO_LEARNING_LESSON_COOLDOWN_HOURS
  ) {
    return true;
  }
  const completed = history.completedAt[lesson.id];
  if (
    completed != null &&
    hoursBetween(completed, nowMs) < MICRO_LEARNING_LESSON_COOLDOWN_HOURS
  ) {
    return true;
  }
  return false;
}

/**
 * Pick one card or null (anti-spam / nothing relevant).
 */
export function selectMicroLesson(
  input: MicroLearningSelectInput,
): MicroLesson | null {
  const nowMs = input.now.getTime();
  const dayKey = input.dayKey ?? dayKeyFromDate(input.now);
  const history = input.history;

  // Global pause after dismiss / complete
  if (
    history.lastDismissAt != null &&
    hoursBetween(history.lastDismissAt, nowMs) <
      MICRO_LEARNING_DISMISS_COOLDOWN_HOURS
  ) {
    return null;
  }
  if (
    history.lastCompleteAt != null &&
    hoursBetween(history.lastCompleteAt, nowMs) <
      MICRO_LEARNING_COMPLETE_COOLDOWN_HOURS
  ) {
    return null;
  }

  const shownToday =
    history.shownDayKey === dayKey ? history.shownIdsToday : [];
  if (shownToday.length >= MICRO_LEARNING_MAX_PER_DAY) {
    return null;
  }

  const sports = [
    ...(input.primaryDiscipline ? [input.primaryDiscipline] : []),
    ...(input.preferredSports ?? []),
  ];

  const ranked = MICRO_LESSONS.map((lesson) => ({
    lesson,
    score: scoreLesson(lesson, input.goalCategories, sports),
    blocked: lessonBlocked(lesson, history, nowMs),
  }))
    .filter((r) => !r.blocked && !shownToday.includes(r.lesson.id))
    .sort((a, b) => b.score - a.score || a.lesson.id.localeCompare(b.lesson.id));

  return ranked[0]?.lesson ?? null;
}

/** Record that a card was shown today (call when rendering a selected card). */
export function recordMicroLessonShown(
  history: MicroLearningHistory,
  lessonId: string,
  now: Date,
): MicroLearningHistory {
  const dayKey = dayKeyFromDate(now);
  const shownIdsToday =
    history.shownDayKey === dayKey ? [...history.shownIdsToday] : [];
  if (!shownIdsToday.includes(lessonId)) shownIdsToday.push(lessonId);
  return {
    ...history,
    shownDayKey: dayKey,
    shownIdsToday,
  };
}

export function recordMicroLessonDismissed(
  history: MicroLearningHistory,
  lessonId: string,
  now: Date,
): MicroLearningHistory {
  return {
    ...history,
    lastDismissAt: now.getTime(),
    dismissedAt: {
      ...history.dismissedAt,
      [lessonId]: now.getTime(),
    },
  };
}

export function recordMicroLessonCompleted(
  history: MicroLearningHistory,
  lessonId: string,
  now: Date,
): MicroLearningHistory {
  return {
    ...history,
    lastCompleteAt: now.getTime(),
    completedAt: {
      ...history.completedAt,
      [lessonId]: now.getTime(),
    },
  };
}
