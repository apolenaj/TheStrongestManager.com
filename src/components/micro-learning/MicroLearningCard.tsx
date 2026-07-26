"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge, Button, ButtonLink, Card } from "@/design-system";
import { featureFlags } from "@/config/feature-flags";
import {
  MICRO_LEARNING_STORAGE_KEY,
  emptyMicroLearningHistory,
  recordMicroLessonCompleted,
  recordMicroLessonDismissed,
  recordMicroLessonShown,
  selectMicroLesson,
  type MicroLearningHistory,
  type MicroLesson,
} from "@/domain/micro-learning";
import { LearnWhy } from "@/components/on-site-education/LearnWhy";

function readHistory(): MicroLearningHistory {
  if (typeof window === "undefined") return emptyMicroLearningHistory();
  try {
    const raw = localStorage.getItem(MICRO_LEARNING_STORAGE_KEY);
    if (!raw) return emptyMicroLearningHistory();
    const parsed = JSON.parse(raw) as MicroLearningHistory;
    return {
      ...emptyMicroLearningHistory(),
      ...parsed,
      dismissedAt: parsed.dismissedAt ?? {},
      completedAt: parsed.completedAt ?? {},
      shownIdsToday: parsed.shownIdsToday ?? [],
    };
  } catch {
    return emptyMicroLearningHistory();
  }
}

function writeHistory(history: MicroLearningHistory) {
  try {
    localStorage.setItem(MICRO_LEARNING_STORAGE_KEY, JSON.stringify(history));
  } catch {
    // ignore quota
  }
}

/**
 * Single dashboard teaser — personalized, anti-spam (max 1/day + cooldowns).
 */
export function MicroLearningCard({
  goalCategories,
  primaryDiscipline,
}: {
  goalCategories: string[];
  primaryDiscipline: string | null;
}) {
  const [history, setHistory] = useState<MicroLearningHistory | null>(null);
  const [lesson, setLesson] = useState<MicroLesson | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!featureFlags.microLearning) return;
    const h = readHistory();
    const now = new Date();
    const picked = selectMicroLesson({
      goalCategories,
      primaryDiscipline,
      history: h,
      now,
    });
    if (picked) {
      const next = recordMicroLessonShown(h, picked.id, now);
      writeHistory(next);
      setHistory(next);
      setLesson(picked);
    } else {
      setHistory(h);
      setLesson(null);
    }
  }, [goalCategories, primaryDiscipline]);

  const relatedTopic = useMemo(
    () => lesson?.relatedTopicIds[0] ?? null,
    [lesson],
  );

  if (!featureFlags.microLearning || hidden || !lesson) return null;

  function dismiss() {
    if (!lesson || !history) return;
    const now = new Date();
    const next = recordMicroLessonDismissed(history, lesson.id, now);
    writeHistory(next);
    setHistory(next);
    setHidden(true);
  }

  function complete() {
    if (!lesson || !history) return;
    const now = new Date();
    const next = recordMicroLessonCompleted(history, lesson.id, now);
    writeHistory(next);
    setHistory(next);
    setHidden(true);
  }

  return (
    <Card elevated className="h-full">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="info">1-minute lesson</Badge>
        <Badge variant="neutral">~{lesson.estimatedSeconds}s</Badge>
      </div>
      <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl font-semibold">
        {lesson.title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
        {lesson.body}
      </p>
      {relatedTopic ? (
        <div className="mt-4">
          <LearnWhy topicId={relatedTopic} compact />
        </div>
      ) : null}
      <div className="mt-5 flex flex-wrap gap-2">
        {lesson.deepenHref ? (
          <ButtonLink href={lesson.deepenHref} size="sm">
            {lesson.deepenLabel ?? "Go deeper"}
          </ButtonLink>
        ) : null}
        <Button type="button" variant="secondary" size="sm" onClick={complete}>
          Got it
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={dismiss}>
          Not now
        </Button>
      </div>
      <p className="mt-3 text-xs text-[var(--color-subtle)]">
        Personalized from your goals
        {primaryDiscipline ? ` · ${primaryDiscipline}` : ""}. We show at most
        one card per day — dismiss pauses future cards for a few days.
      </p>
    </Card>
  );
}

/** Fallback when used outside dashboard with Link-only deepen. */
export function MicroLearningCardStatic({ lesson }: { lesson: MicroLesson }) {
  return (
    <Card elevated>
      <Badge variant="info">1-minute lesson</Badge>
      <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl">
        {lesson.title}
      </h3>
      <p className="mt-2 text-sm text-[var(--color-muted)]">{lesson.body}</p>
      {lesson.deepenHref ? (
        <p className="mt-3 text-sm">
          <Link
            href={lesson.deepenHref}
            className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
          >
            {lesson.deepenLabel ?? "Go deeper"}
          </Link>
        </p>
      ) : null}
    </Card>
  );
}
