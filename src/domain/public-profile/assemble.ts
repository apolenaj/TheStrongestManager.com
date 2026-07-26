import type { PublicProfileVisibility } from "@/domain/public-profile/visibility";

export type PublicPrItem = {
  liftLabel: string;
  loadKg: number;
  reps: number | null;
};

export type PublicCompetitionItem = {
  name: string | null;
  sport: string;
  date: string;
  weightClassLabel: string | null;
};

export type PublicAchievementItem = {
  title: string;
  headline: string;
  at: string;
};

export type PublicTechniqueHighlight = {
  exerciseLabel: string;
  score: number;
  at: string;
};

export type PublicBodyMetricItem = {
  label: string;
  value: number;
  unit: string;
  recordedAt: string;
};

export type PublicProfileSignals = {
  displayName: string | null;
  sport: string | null;
  bio: string | null;
  prs: PublicPrItem[];
  competitions: PublicCompetitionItem[];
  achievements: PublicAchievementItem[];
  techniqueHighlights: PublicTechniqueHighlight[];
  trainingStreakDays: number | null;
  bodyMetrics: PublicBodyMetricItem[];
  /** Must never leak — assembly ignores these even if present. */
  recoverySummary?: string | null;
  privateNotes?: string | null;
};

export type AssembledPublicProfile = {
  slug: string;
  isPublic: true;
  displayName: string | null;
  sport: string | null;
  bio: string | null;
  prs: PublicPrItem[] | null;
  competitions: PublicCompetitionItem[] | null;
  achievements: PublicAchievementItem[] | null;
  techniqueHighlights: PublicTechniqueHighlight[] | null;
  trainingStreakDays: number | null;
  bodyMetrics: PublicBodyMetricItem[] | null;
  /** Always listed for honesty on the public page. */
  hiddenByPrivacy: string[];
};

/**
 * Assemble a public view from signals + visibility.
 * Recovery and private notes are never included.
 */
export function assemblePublicProfile(
  slug: string,
  visibility: PublicProfileVisibility,
  signals: PublicProfileSignals,
): AssembledPublicProfile {
  const hiddenByPrivacy: string[] = [
    "Recovery data",
    "Private notes",
  ];

  if (!visibility.body_metrics) {
    hiddenByPrivacy.push("Body metrics (not selected)");
  }

  // Hard strip — ignore even if accidentally passed
  void signals.recoverySummary;
  void signals.privateNotes;

  return {
    slug,
    isPublic: true,
    displayName: visibility.display_name ? signals.displayName : null,
    sport: visibility.sport ? signals.sport : null,
    bio: signals.bio,
    prs: visibility.prs ? signals.prs : null,
    competitions: visibility.competition_history ? signals.competitions : null,
    achievements: visibility.achievements ? signals.achievements : null,
    techniqueHighlights: visibility.technique_highlights
      ? signals.techniqueHighlights
      : null,
    trainingStreakDays: visibility.training_streak
      ? signals.trainingStreakDays
      : null,
    bodyMetrics: visibility.body_metrics ? signals.bodyMetrics : null,
    hiddenByPrivacy,
  };
}

/**
 * Compute consecutive calendar-day streak ending today (UTC days).
 */
export function computeTrainingStreakDays(
  completedSessionDates: Date[],
  now: Date = new Date(),
): number {
  if (completedSessionDates.length === 0) return 0;
  const days = new Set(
    completedSessionDates.map((d) => d.toISOString().slice(0, 10)),
  );
  let streak = 0;
  const cursor = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  // Allow streak to count if last session was yesterday or today
  const todayKey = cursor.toISOString().slice(0, 10);
  const y = new Date(cursor);
  y.setUTCDate(y.getUTCDate() - 1);
  const yesterdayKey = y.toISOString().slice(0, 10);
  if (!days.has(todayKey) && !days.has(yesterdayKey)) return 0;

  if (!days.has(todayKey)) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (!days.has(key)) break;
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}
