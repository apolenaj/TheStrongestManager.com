/**
 * Assemble ethical retention loops.
 * Planned rest continues follow-through; never punish rest or use dark patterns.
 */

import type { ConfidenceLevel } from "@/domain/scoring/types";
import {
  BEHAVIORAL_RETENTION_ENGINE_VERSION,
  BEHAVIORAL_RETENTION_HONESTY,
  DEFAULT_RETENTION_LOOKBACK_DAYS,
  RETENTION_LOOP_LABELS,
  RETENTION_SOFT_NUDGES,
  type RetentionDayResolution,
  type RetentionLoopStatus,
} from "@/domain/behavioral-retention/constants";
import type {
  BehavioralRetentionPayload,
  BehavioralRetentionSignals,
  RetentionDaySignal,
  RetentionLoopCard,
} from "@/domain/behavioral-retention/types";

function conf(
  n: number,
  thresholds: [number, number, number] = [2, 5, 10],
): ConfidenceLevel {
  if (n >= thresholds[2]) return "high";
  if (n >= thresholds[1]) return "medium";
  if (n >= thresholds[0]) return "low";
  return "none";
}

/**
 * Resolve a calendar day from session statuses.
 * No sessions → planned_rest (rest is correct, not a failure).
 */
export function resolveRetentionDay(input: {
  completed: number;
  skipped: number;
  inProgress: number;
  planned: number;
}): RetentionDayResolution {
  if (input.completed > 0) return "completed";
  if (input.skipped > 0) return "missed";
  if (input.inProgress > 0) return "in_progress";
  if (input.planned > 0) return "in_progress";
  return "planned_rest";
}

/**
 * Ethical on-plan streak: walk backward from the newest day.
 * completed + planned_rest continue; missed breaks; in_progress pauses (does not break).
 * Leading empty days (before any signal) are ignored.
 */
export function computeOnPlanStreak(daysNewestFirst: RetentionDaySignal[]): {
  streakDays: number;
  plannedRestInStreak: number;
} {
  let streakDays = 0;
  let plannedRestInStreak = 0;
  let started = false;

  for (const day of daysNewestFirst) {
    if (!started) {
      if (day.resolution === "empty") continue;
      started = true;
    }

    if (day.resolution === "missed") break;
    if (day.resolution === "empty") break;
    if (day.resolution === "in_progress") {
      // Still on-plan today — count the day as follow-through in progress
      streakDays += 1;
      continue;
    }
    if (day.resolution === "planned_rest") {
      streakDays += 1;
      plannedRestInStreak += 1;
      continue;
    }
    if (day.resolution === "completed") {
      streakDays += 1;
      continue;
    }
  }

  return { streakDays, plannedRestInStreak };
}

function statusForStreak(
  streak: number,
  missed: number,
  hasData: boolean,
): RetentionLoopStatus {
  if (!hasData) return "insufficient_data";
  if (streak >= 7 && missed === 0) return "celebrating";
  if (missed > 0 && streak < 3) return "needs_attention";
  if (streak >= 1) return "on_track";
  return "needs_attention";
}

function buildWorkoutLoop(
  signals: BehavioralRetentionSignals,
  streakDays: number,
  plannedRestInStreak: number,
  missed: number,
  completed: number,
): RetentionLoopCard {
  const status = statusForStreak(streakDays, missed, signals.days.length > 0);

  let headline: string;
  let detail: string;
  let nudge: string | null = null;

  if (signals.days.length === 0) {
    headline = "Not enough plan history yet";
    detail =
      "Schedule or complete sessions so follow-through can be measured honestly.";
  } else if (streakDays === 0 && missed > 0) {
    headline = "Reset with the next planned day";
    detail = `${missed} missed planned session(s) in the lookback. Rest days were not counted against you.`;
    nudge = RETENTION_SOFT_NUDGES.missed;
  } else if (plannedRestInStreak > 0 && streakDays > 0) {
    headline = `${streakDays}-day on-plan streak (includes rest)`;
    detail = `${plannedRestInStreak} planned rest day(s) counted as follow-through. ${completed} completed session(s) in window.`;
    nudge = RETENTION_SOFT_NUDGES.rest_ok;
  } else if (streakDays > 0) {
    headline = `${streakDays}-day on-plan streak`;
    detail = `${completed} completed session(s) in the lookback. Planned rest would also continue this streak.`;
  } else {
    headline = "Start an on-plan day";
    detail =
      "Complete a planned session or take a planned rest day — both count.";
    nudge = RETENTION_SOFT_NUDGES.rest_ok;
  }

  return {
    id: "workout_streak",
    label: RETENTION_LOOP_LABELS.workout_streak,
    status: signals.days.length > 0 ? status : "insufficient_data",
    headline,
    detail,
    href: "/app/today",
    metricValue: streakDays > 0 ? streakDays : null,
    metricLabel: streakDays > 0 ? "on-plan days" : null,
    confidence: conf(
      completed + plannedRestInStreak,
      [1, 5, 14],
    ),
    evidence: [
      `${completed} completed`,
      `${plannedRestInStreak} rest days in current streak`,
      `${missed} missed planned`,
    ],
    nudge,
  };
}

function buildWeeklyReviewLoop(
  signals: BehavioralRetentionSignals,
): RetentionLoopCard {
  if (signals.weeklyReview.hasCurrentWeekReview) {
    return {
      id: "weekly_review",
      label: RETENTION_LOOP_LABELS.weekly_review,
      status: "celebrating",
      headline: "Weekly review ready",
      detail: signals.weeklyReview.summary
        ? signals.weeklyReview.summary
        : `Review ${signals.weeklyReview.weekKey ?? "this week"} is available for a calm check-in.`,
      href: "/app/weekly-review",
      metricValue: 1,
      metricLabel: "review this week",
      confidence: "medium",
      evidence: signals.weeklyReview.weekKey
        ? [`Week key ${signals.weeklyReview.weekKey}`]
        : [],
      nudge: RETENTION_SOFT_NUDGES.weekly_review,
    };
  }

  return {
    id: "weekly_review",
    label: RETENTION_LOOP_LABELS.weekly_review,
    status: "needs_attention",
    headline: "Weekly review not generated yet",
    detail:
      "Open Weekly review when you want a summary — there is no deadline penalty.",
    href: "/app/weekly-review",
    metricValue: null,
    metricLabel: null,
    confidence: "low",
    evidence: [],
    nudge: RETENTION_SOFT_NUDGES.weekly_review,
  };
}

function buildGoalLoop(signals: BehavioralRetentionSignals): RetentionLoopCard {
  if (!signals.goal.title) {
    return {
      id: "goal_progress",
      label: RETENTION_LOOP_LABELS.goal_progress,
      status: "insufficient_data",
      headline: "No active goal on file",
      detail: "Set a goal when ready — retention never invents one.",
      href: "/app/profile",
      metricValue: null,
      metricLabel: null,
      confidence: "none",
      evidence: [],
      nudge: null,
    };
  }

  if (!signals.goal.hasLoggedProgress) {
    return {
      id: "goal_progress",
      label: RETENTION_LOOP_LABELS.goal_progress,
      status: "needs_attention",
      headline: `Goal: ${signals.goal.title}`,
      detail:
        "Log a progress metric when you train so progress stays honest — no fake % complete.",
      href: "/app/goal-progress",
      metricValue: null,
      metricLabel: null,
      confidence: "low",
      evidence: signals.goal.category
        ? [`Category ${signals.goal.category}`]
        : [],
      nudge: RETENTION_SOFT_NUDGES.goal,
    };
  }

  const label = signals.goal.progressLabel ?? "logged";
  const status: RetentionLoopStatus =
    label === "improving" || label === "stable"
      ? "on_track"
      : label === "declining"
        ? "needs_attention"
        : "on_track";

  return {
    id: "goal_progress",
    label: RETENTION_LOOP_LABELS.goal_progress,
    status: status === "on_track" && label === "improving" ? "celebrating" : status,
    headline: `${signals.goal.title} — ${label}`,
    detail:
      "Progress uses your logged metrics only. Qualitative labels, not invented certainty scores.",
    href: "/app/goal-progress",
    metricValue: null,
    metricLabel: label,
    confidence: "medium",
    evidence: [`Active goal “${signals.goal.title}”`, `Signal: ${label}`],
    nudge: RETENTION_SOFT_NUDGES.goal,
  };
}

function buildTechniqueLoop(
  signals: BehavioralRetentionSignals,
): RetentionLoopCard {
  if (signals.technique.sampleCount < 2 || signals.technique.delta == null) {
    return {
      id: "technique_improvement",
      label: RETENTION_LOOP_LABELS.technique_improvement,
      status: "insufficient_data",
      headline: "Need comparable technique analyses",
      detail:
        "Upload at least two scored analyses to see improvement — nothing is invented.",
      href: "/app/technique",
      metricValue: null,
      metricLabel: null,
      confidence: conf(signals.technique.sampleCount, [1, 2, 4]),
      evidence:
        signals.technique.sampleCount > 0
          ? [`${signals.technique.sampleCount} analysis sample(s)`]
          : [],
      nudge: RETENTION_SOFT_NUDGES.technique,
    };
  }

  const dir = signals.technique.direction ?? "stable";
  const delta = signals.technique.delta;
  const status: RetentionLoopStatus =
    dir === "improved"
      ? "celebrating"
      : dir === "regressed"
        ? "needs_attention"
        : "on_track";

  return {
    id: "technique_improvement",
    label: RETENTION_LOOP_LABELS.technique_improvement,
    status,
    headline:
      dir === "improved"
        ? "Technique trending up"
        : dir === "regressed"
          ? "Technique score softer lately"
          : "Technique holding steady",
    detail: `Comparable score Δ ${delta > 0 ? "+" : ""}${delta.toFixed(1)} across ${signals.technique.sampleCount} analyses. Cause not attributed.`,
    href: "/app/technique",
    metricValue: Math.round(delta * 10) / 10,
    metricLabel: "score Δ",
    confidence: conf(signals.technique.sampleCount, [2, 4, 8]),
    evidence: [
      `${signals.technique.sampleCount} analyses`,
      `Direction: ${dir}`,
    ],
    nudge: RETENTION_SOFT_NUDGES.technique,
  };
}

export function assembleBehavioralRetention(
  signals: BehavioralRetentionSignals,
): BehavioralRetentionPayload {
  const lookbackDays =
    signals.lookbackDays > 0
      ? signals.lookbackDays
      : DEFAULT_RETENTION_LOOKBACK_DAYS;

  const daysNewestFirst = [...signals.days].sort((a, b) =>
    a.dayKey < b.dayKey ? 1 : a.dayKey > b.dayKey ? -1 : 0,
  );

  const { streakDays, plannedRestInStreak } =
    computeOnPlanStreak(daysNewestFirst);

  const missed = signals.days.filter((d) => d.resolution === "missed").length;
  const completed = signals.days.filter(
    (d) => d.resolution === "completed",
  ).length;

  const loops: RetentionLoopCard[] = [
    buildWorkoutLoop(
      signals,
      streakDays,
      plannedRestInStreak,
      missed,
      completed,
    ),
    buildWeeklyReviewLoop(signals),
    buildGoalLoop(signals),
    buildTechniqueLoop(signals),
  ];

  const celebrating = loops.filter((l) => l.status === "celebrating").length;
  const onTrack = loops.filter((l) => l.status === "on_track").length;
  const summaryLine =
    celebrating > 0
      ? `${celebrating} retention loop${celebrating === 1 ? "" : "s"} worth celebrating — planned rest still counts.`
      : onTrack > 0
        ? `${onTrack} loop${onTrack === 1 ? "" : "s"} on track. Soft nudges only — no streak guilt.`
        : loops.every((l) => l.status === "insufficient_data")
          ? null
          : "Follow-through loops are ready when you are — rest days are not punished.";

  return {
    engineVersion: BEHAVIORAL_RETENTION_ENGINE_VERSION,
    lookbackDays,
    generatedAtIso: signals.now.toISOString(),
    summaryLine,
    loops,
    onPlanStreakDays: streakDays,
    plannedRestDaysInStreak: plannedRestInStreak,
    missedPlannedSessions: missed,
    completedSessions: completed,
    honesty: BEHAVIORAL_RETENTION_HONESTY,
  };
}

/** Flatten text for forbidden-pattern tests. */
export function behavioralRetentionText(
  payload: BehavioralRetentionPayload,
): string {
  return [
    payload.summaryLine ?? "",
    ...payload.honesty,
    ...payload.loops.flatMap((l) => [
      l.headline,
      l.detail,
      l.nudge ?? "",
      ...l.evidence,
    ]),
  ]
    .join("\n")
    .toLowerCase();
}
