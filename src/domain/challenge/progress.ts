/**
 * Pure progress + completion rules for challenges.
 */

import type { ChallengeDefinition } from "@/domain/challenge/catalog";
import { isForbiddenChallengeKind } from "@/domain/challenge/constants";

export type ChallengeProgressInput = {
  /** Distinct calendar days with technique work (ISO date strings). */
  techniqueDays: string[];
  /** Completed session timestamps (ISO). */
  completedSessionAt: string[];
  /** Technique scores in enrollment window (oldest → newest), optional exercise filter applied upstream. */
  techniqueScores: number[];
  /** Lesson completion timestamps during enrollment. */
  academyLessonCompletedAt: string[];
  /** Enrollment start (ISO). */
  startedAt: string;
  /** Now (ISO) for window checks. */
  now: string;
};

export type ChallengeProgressResult = {
  currentValue: number;
  targetValue: number;
  percentTowardTarget: number;
  completed: boolean;
  /** Honest status detail for UI. */
  detail: string;
  windowExpired: boolean;
};

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

function addDays(iso: string, days: number): Date {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

export function isWithinDuration(
  startedAt: string,
  now: string,
  durationDays: number | null,
): { active: boolean; expired: boolean } {
  if (durationDays == null) return { active: true, expired: false };
  const end = addDays(startedAt, durationDays);
  const n = new Date(now);
  if (n.getTime() > end.getTime()) return { active: false, expired: true };
  return { active: true, expired: false };
}

export function computeChallengeProgress(
  def: ChallengeDefinition,
  input: ChallengeProgressInput,
): ChallengeProgressResult {
  if (isForbiddenChallengeKind(def.safetyKind)) {
    return {
      currentValue: 0,
      targetValue: def.targetValue,
      percentTowardTarget: 0,
      completed: false,
      detail: "This challenge kind is not allowed.",
      windowExpired: false,
    };
  }

  const window = isWithinDuration(
    input.startedAt,
    input.now,
    def.durationDays,
  );
  const startMs = new Date(input.startedAt).getTime();
  const endMs =
    def.durationDays != null
      ? addDays(input.startedAt, def.durationDays).getTime()
      : new Date(input.now).getTime();

  const inWindow = (iso: string) => {
    const t = new Date(iso).getTime();
    return t >= startMs && t <= Math.max(endMs, new Date(input.now).getTime());
  };

  let currentValue = 0;
  let detail = "";

  switch (def.metricKind) {
    case "technique_day_streak": {
      const days = new Set(
        input.techniqueDays.filter(inWindow).map(dayKey),
      );
      currentValue = days.size;
      detail = `${currentValue} technique days (target ${def.targetValue})`;
      break;
    }
    case "completed_sessions": {
      currentValue = input.completedSessionAt.filter(inWindow).length;
      detail = `${currentValue} completed sessions (target ${def.targetValue})`;
      break;
    }
    case "technique_score_delta": {
      const scores = input.techniqueScores.filter((s) => Number.isFinite(s));
      if (scores.length < 2) {
        currentValue = 0;
        detail = "Need at least two scored technique analyses in the window.";
      } else {
        const first = scores[0]!;
        const last = scores[scores.length - 1]!;
        currentValue = Math.max(0, last - first);
        detail = `Technique delta +${currentValue.toFixed(1)} (target +${def.targetValue})`;
      }
      break;
    }
    case "academy_lessons_completed": {
      currentValue = input.academyLessonCompletedAt.filter(inWindow).length;
      detail = `${currentValue} lessons completed (target ${def.targetValue})`;
      break;
    }
    default: {
      detail = "Unknown metric.";
    }
  }

  const target = def.targetValue;
  const percentTowardTarget =
    target <= 0
      ? 0
      : Math.min(100, Math.round((currentValue / target) * 100));

  // Completion requires meeting target; if window expired without target, not completed.
  const metTarget = currentValue >= target;
  const completed = metTarget && (window.active || metTarget);

  return {
    currentValue,
    targetValue: target,
    percentTowardTarget,
    completed: metTarget,
    detail: window.expired && !metTarget
      ? `${detail} — window ended without completion.`
      : detail,
    windowExpired: window.expired,
  };
}

/** Optional leaderboard rows — only when definition enables it; never invent athletes. */
export type ChallengeLeaderboardRow = {
  athleteProfileId: string;
  displayLabel: string;
  progressValue: number;
  completed: boolean;
};

export function buildOptionalChallengeLeaderboard(
  def: ChallengeDefinition,
  rows: ChallengeLeaderboardRow[],
): ChallengeLeaderboardRow[] | null {
  if (!def.leaderboardEnabled) return null;
  return [...rows].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? -1 : 1;
    return b.progressValue - a.progressValue;
  });
}
