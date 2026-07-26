import type { ScoreLevel } from "@/design-system/tokens/colors";
import { scoreLevelFromValue } from "@/design-system/tokens/colors";

/** Honesty label for any surfaced metric. */
export type MetricSource =
  | "observed"
  | "heuristic"
  | "reported"
  | "recommended"
  | "insufficient";

export type DashboardScore = {
  key: string;
  label: string;
  href: string;
  /** Null when there is not enough data — never invent a number. */
  value: number | null;
  level: ScoreLevel | null;
  source: MetricSource;
  /** Exact product copy when value is null and no statusLabel. */
  emptyLabel: string;
  /** Qualitative status when a number would be dishonest (e.g. active program name). */
  statusLabel: string | null;
  detail: string | null;
};

export type DashboardOpportunity = {
  id: string;
  title: string;
  body: string;
  category: string;
  href: string;
};

export type DashboardProgressItem = {
  id: string;
  label: string;
  valueLabel: string;
  recordedAt: Date;
  source: MetricSource;
  href: string;
};

export type DashboardSessionItem = {
  id: string;
  title: string;
  status: string;
  when: Date | null;
  href: string;
};

export type DashboardTrendPoint = {
  id: string;
  label: string;
  value: number;
  recordedAt: Date;
};

export type DashboardPrItem = {
  liftId: string;
  label: string;
  display: string;
  recordedAt: Date;
  source: MetricSource;
  href: string;
  /** Sport focus this PR belongs to when multi-sport is active. */
  sportId?: string;
  sportLabel?: string;
};

/** PRs grouped by sport focus (Prompt 108). */
export type DashboardSportPrGroup = {
  sportId: string;
  sportLabel: string;
  href: string;
  prs: DashboardPrItem[];
  emptyNote: string | null;
};

export type DashboardSportFocus = {
  id: string;
  label: string;
  href: string;
};

export type DashboardTrainingLoad = {
  completedLast7Days: number;
  completedLast28Days: number;
  plannedUpcoming: number;
  /** False until at least one completed session exists. */
  hasEnoughData: boolean;
  href: string;
};

export type DashboardView = {
  athleteProfileId: string;
  greetingName: string;
  goalTitle: string | null;
  /** Active goals when multi-sport allows mixed training goals. */
  goals: Array<{ title: string; category: string }>;
  discipline: string | null;
  /** Normalized sport focuses (Prompt 108). */
  sportFocuses: DashboardSportFocus[];
  isMultiSport: boolean;
  experienceLevel: string | null;
  /** Brand-new: profile exists but almost no training signal yet. */
  isNewAthlete: boolean;
  /**
   * True only for Demo Mode presentation (/demo or isDemoAccount session).
   * Production athlete dashboards must leave this false/undefined.
   */
  isDemoPresentation?: boolean;
  /** Checklist for the first ~10 minutes — not a score wall. */
  firstSession: {
    goalChosen: boolean;
    profileReady: boolean;
    techniqueUploaded: boolean;
    workoutLogged: boolean;
    completedCount: number;
    totalCount: number;
  };
  scores: {
    athlete: DashboardScore;
    strength: DashboardScore;
    technique: DashboardScore;
    programming: DashboardScore;
    recovery: DashboardScore;
    consistency: DashboardScore;
    /** Omitted from UI when null (not enough readiness history). */
    mobilityReadiness: DashboardScore | null;
  };
  opportunity: DashboardOpportunity | null;
  /** Top cross-domain insight when the engine surfaces one. */
  topInsight: {
    id: string;
    title: string;
    summary: string;
    confidence: string;
    actionLabel: string;
    actionHref: string;
  } | null;
  recentProgress: DashboardProgressItem[];
  trainingLoad: DashboardTrainingLoad;
  recentSessions: DashboardSessionItem[];
  upcomingWorkout: DashboardSessionItem | null;
  techniqueTrend: DashboardTrendPoint[];
  recoveryTrend: DashboardTrendPoint[];
  personalRecords: DashboardPrItem[];
  /** When multi-sport: PRs separated by sport namespace. */
  prsBySport: DashboardSportPrGroup[];
};

export const NOT_ENOUGH_DATA = "Not enough data yet.";

export function resolveScoreLevel(
  value: number | null,
  storedLevel: string | null | undefined,
): ScoreLevel | null {
  if (value == null) return null;
  if (
    storedLevel === "excellent" ||
    storedLevel === "good" ||
    storedLevel === "needsAttention" ||
    storedLevel === "critical"
  ) {
    return storedLevel;
  }
  return scoreLevelFromValue(value);
}

export function hrefForRecommendationCategory(category: string): string {
  switch (category) {
    case "technique":
      return "/app/technique";
    case "recovery":
      return "/app/recovery";
    case "nutrition":
      return "/app/nutrition";
    case "assessment":
      return "/app/profile";
    case "training":
    default:
      return "/app/today";
  }
}
