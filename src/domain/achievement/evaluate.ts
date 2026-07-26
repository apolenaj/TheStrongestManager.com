/**
 * Pure achievement evaluation from evidence — never invent unlocks.
 */

import {
  ACHIEVEMENT_CATALOG,
  type AchievementId,
} from "@/domain/achievement/catalog";
import { isForbiddenAchievementPattern } from "@/domain/achievement/constants";

export type AchievementEvidence = {
  completedSessionCount: number;
  /** ISO timestamps of completed sessions (for week consistency). */
  completedSessionAt: string[];
  /** Completed technique analyses with real scores. */
  techniqueScoreCount: number;
  /** Chronological technique scores (oldest → newest). */
  techniqueScores: number[];
  /** True when PR intelligence detected at least one real PR event. */
  hasLoggedPr: boolean;
  /** Competition prep marked completed. */
  hasCompletedCompetition: boolean;
};

export type AchievementEvaluation = {
  id: AchievementId;
  unlocked: boolean;
  /** Short honest reason for UI. */
  reason: string;
  /** ISO evidence hint when unlocked. */
  evidenceSummary: string | null;
};

function isoWeekKey(iso: string): string {
  const d = new Date(iso);
  // UTC week: year + week number (Mon-based approx via Thursday rule)
  const date = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export function countDistinctTrainingWeeks(sessionAt: string[]): number {
  const weeks = new Set(sessionAt.filter(Boolean).map(isoWeekKey));
  return weeks.size;
}

export function techniqueImprovementDelta(scores: number[]): number {
  const finite = scores.filter((s) => Number.isFinite(s));
  if (finite.length < 2) return 0;
  const first = finite[0]!;
  const last = finite[finite.length - 1]!;
  return Math.max(0, last - first);
}

export function evaluateAchievement(
  id: AchievementId,
  evidence: AchievementEvidence,
): AchievementEvaluation {
  if (isForbiddenAchievementPattern(id)) {
    return {
      id,
      unlocked: false,
      reason: "This achievement pattern is not allowed.",
      evidenceSummary: null,
    };
  }

  switch (id) {
    case "first_workout": {
      const unlocked = evidence.completedSessionCount >= 1;
      return {
        id,
        unlocked,
        reason: unlocked
          ? "Completed at least one training session."
          : "Complete your first training session.",
        evidenceSummary: unlocked
          ? `${evidence.completedSessionCount} session(s)`
          : null,
      };
    }
    case "first_technique_analysis": {
      const unlocked = evidence.techniqueScoreCount >= 1;
      return {
        id,
        unlocked,
        reason: unlocked
          ? "Completed a scored technique analysis."
          : "Complete a technique analysis with a real score.",
        evidenceSummary: unlocked
          ? `${evidence.techniqueScoreCount} scored analysis(es)`
          : null,
      };
    }
    case "workouts_10": {
      const unlocked = evidence.completedSessionCount >= 10;
      return {
        id,
        unlocked,
        reason: unlocked
          ? "Reached 10 completed sessions."
          : `${evidence.completedSessionCount}/10 completed sessions.`,
        evidenceSummary: unlocked
          ? `${evidence.completedSessionCount} sessions`
          : null,
      };
    }
    case "technique_plus_10": {
      const delta = techniqueImprovementDelta(evidence.techniqueScores);
      const unlocked = delta >= 10;
      return {
        id,
        unlocked,
        reason: unlocked
          ? `Technique score improved by +${delta.toFixed(1)}.`
          : `Need +10 technique improvement (current +${delta.toFixed(1)}).`,
        evidenceSummary: unlocked ? `delta +${delta.toFixed(1)}` : null,
      };
    }
    case "first_pr": {
      const unlocked = evidence.hasLoggedPr;
      return {
        id,
        unlocked,
        reason: unlocked
          ? "Logged a personal record from training data."
          : "Log a PR from real session or technique data.",
        evidenceSummary: unlocked ? "pr_event" : null,
      };
    }
    case "consistency_12_weeks": {
      const weeks = countDistinctTrainingWeeks(evidence.completedSessionAt);
      const unlocked = weeks >= 12;
      return {
        id,
        unlocked,
        reason: unlocked
          ? "Trained across 12 distinct weeks."
          : `${weeks}/12 distinct training weeks.`,
        evidenceSummary: unlocked ? `${weeks} weeks` : null,
      };
    }
    case "competition_completed": {
      const unlocked = evidence.hasCompletedCompetition;
      return {
        id,
        unlocked,
        reason: unlocked
          ? "Completed a competition prep."
          : "Complete a Competition Mode prep.",
        evidenceSummary: unlocked ? "competition_prep_completed" : null,
      };
    }
    default: {
      return {
        id,
        unlocked: false,
        reason: "Unknown achievement.",
        evidenceSummary: null,
      };
    }
  }
}

export function evaluateAllAchievements(
  evidence: AchievementEvidence,
): AchievementEvaluation[] {
  return ACHIEVEMENT_CATALOG.map((a) => evaluateAchievement(a.id, evidence));
}
