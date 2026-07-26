/**
 * Pure attention ranking from athlete signals — no DB, no invention.
 */

import {
  COACH_ATTENTION_CATEGORY_LABELS,
  COACH_ATTENTION_MAX_ITEMS,
  COACH_ATTENTION_MAX_PER_ATHLETE,
  COACH_ATTENTION_URGENCY_SCORE,
  type CoachAttentionCategory,
  type CoachAttentionUrgency,
} from "@/domain/coach-dashboard/constants";

export type AthleteAttentionSignals = {
  athleteProfileId: string;
  displayName: string;
  /** Coach has training and/or programs scope. */
  canTraining: boolean;
  canTechnique: boolean;
  canRecovery: boolean;
  sessionsLast7d: number;
  sessionsPrev7d: number;
  sessionsLast28d: number;
  /** Days since last completed session; null if none in lookback. */
  daysSinceLastSession: number | null;
  /** Recent technique mean − earlier mean; null if thin. */
  techniqueDelta: number | null;
  techniqueSampleCount: number;
  meanRpeRecent: number | null;
  /** Days until next active competition; null if none. */
  daysUntilCompetition: number | null;
  competitionLabel: string | null;
  /** PRs detected in last 7 days. */
  recentPrCount7d: number;
  recentPrHeadline: string | null;
  /** Days since last recovery check-in; null if never / no scope. */
  daysSinceCheckin: number | null;
  hadAnyCheckin: boolean;
};

export type CoachAttentionItem = {
  id: string;
  athleteProfileId: string;
  athleteLabel: string;
  category: CoachAttentionCategory;
  categoryLabel: string;
  urgency: CoachAttentionUrgency;
  urgencyScore: number;
  title: string;
  detail: string;
  href: string;
};

export type AttentionQueueResult = {
  items: CoachAttentionItem[];
  totalCandidates: number;
  capped: boolean;
};

function urgencyOf(
  category: CoachAttentionCategory,
  signals: AthleteAttentionSignals,
): CoachAttentionUrgency {
  switch (category) {
    case "missed_training": {
      const d = signals.daysSinceLastSession ?? 28;
      if (d >= 14) return "critical";
      if (d >= 10) return "high";
      return "medium";
    }
    case "performance_decline": {
      const drop = signals.sessionsPrev7d - signals.sessionsLast7d;
      if (drop >= 3) return "high";
      if (
        signals.meanRpeRecent != null &&
        signals.meanRpeRecent >= 8.5 &&
        drop >= 2
      ) {
        return "high";
      }
      return "medium";
    }
    case "technique_regression": {
      const delta = signals.techniqueDelta ?? 0;
      if (delta <= -8) return "high";
      if (delta <= -5) return "medium";
      return "low";
    }
    case "competition_approaching": {
      const d = signals.daysUntilCompetition ?? 99;
      if (d <= 7) return "critical";
      if (d <= 14) return "high";
      return "medium";
    }
    case "new_pr":
      return "low";
    case "incomplete_checkin": {
      const d = signals.daysSinceCheckin ?? 14;
      if (d >= 14) return "medium";
      return "low";
    }
  }
}

/**
 * Build raw attention candidates for one athlete (uncapped).
 */
export function buildAthleteAttentionItems(
  signals: AthleteAttentionSignals,
): CoachAttentionItem[] {
  const items: CoachAttentionItem[] = [];
  const href = `/app/coach/${signals.athleteProfileId}`;
  const label = signals.displayName;

  if (
    signals.canTraining &&
    signals.sessionsLast7d === 0 &&
    signals.sessionsLast28d > 0
  ) {
    const category = "missed_training" as const;
    const urgency = urgencyOf(category, signals);
    const days = signals.daysSinceLastSession;
    items.push({
      id: `${signals.athleteProfileId}:missed_training`,
      athleteProfileId: signals.athleteProfileId,
      athleteLabel: label,
      category,
      categoryLabel: COACH_ATTENTION_CATEGORY_LABELS[category],
      urgency,
      urgencyScore: COACH_ATTENTION_URGENCY_SCORE[urgency],
      title: `${label} — missed training`,
      detail:
        days != null
          ? `No completed sessions in 7 days (last session ~${days}d ago).`
          : "No completed sessions in the last 7 days.",
      href,
    });
  }

  if (
    signals.canTraining &&
    signals.sessionsPrev7d >= 2 &&
    signals.sessionsLast7d <= signals.sessionsPrev7d - 2
  ) {
    const category = "performance_decline" as const;
    const urgency = urgencyOf(category, signals);
    const rpeNote =
      signals.meanRpeRecent != null
        ? ` Mean recent RPE ≈ ${signals.meanRpeRecent.toFixed(1)}.`
        : "";
    items.push({
      id: `${signals.athleteProfileId}:performance_decline`,
      athleteProfileId: signals.athleteProfileId,
      athleteLabel: label,
      category,
      categoryLabel: COACH_ATTENTION_CATEGORY_LABELS[category],
      urgency,
      urgencyScore: COACH_ATTENTION_URGENCY_SCORE[urgency],
      title: `${label} — performance decline`,
      detail: `Sessions ${signals.sessionsLast7d} vs ${signals.sessionsPrev7d} prior week.${rpeNote}`,
      href,
    });
  }

  if (
    signals.canTechnique &&
    signals.techniqueDelta != null &&
    signals.techniqueSampleCount >= 2 &&
    signals.techniqueDelta <= -5
  ) {
    const category = "technique_regression" as const;
    const urgency = urgencyOf(category, signals);
    items.push({
      id: `${signals.athleteProfileId}:technique_regression`,
      athleteProfileId: signals.athleteProfileId,
      athleteLabel: label,
      category,
      categoryLabel: COACH_ATTENTION_CATEGORY_LABELS[category],
      urgency,
      urgencyScore: COACH_ATTENTION_URGENCY_SCORE[urgency],
      title: `${label} — technique regression`,
      detail: `Technique trend ≈ ${signals.techniqueDelta.toFixed(1)} vs earlier window (${signals.techniqueSampleCount} scores).`,
      href,
    });
  }

  if (
    signals.daysUntilCompetition != null &&
    signals.daysUntilCompetition >= 0 &&
    signals.daysUntilCompetition <= 21
  ) {
    const category = "competition_approaching" as const;
    const urgency = urgencyOf(category, signals);
    const name = signals.competitionLabel?.trim() || "Competition";
    items.push({
      id: `${signals.athleteProfileId}:competition_approaching`,
      athleteProfileId: signals.athleteProfileId,
      athleteLabel: label,
      category,
      categoryLabel: COACH_ATTENTION_CATEGORY_LABELS[category],
      urgency,
      urgencyScore: COACH_ATTENTION_URGENCY_SCORE[urgency],
      title: `${label} — competition approaching`,
      detail: `${name} in ${signals.daysUntilCompetition} day${signals.daysUntilCompetition === 1 ? "" : "s"}.`,
      href,
    });
  }

  if (signals.canTraining && signals.recentPrCount7d > 0) {
    const category = "new_pr" as const;
    const urgency = urgencyOf(category, signals);
    items.push({
      id: `${signals.athleteProfileId}:new_pr`,
      athleteProfileId: signals.athleteProfileId,
      athleteLabel: label,
      category,
      categoryLabel: COACH_ATTENTION_CATEGORY_LABELS[category],
      urgency,
      urgencyScore: COACH_ATTENTION_URGENCY_SCORE[urgency],
      title: `${label} — new PR`,
      detail:
        signals.recentPrHeadline ??
        `${signals.recentPrCount7d} PR event(s) in the last 7 days.`,
      href,
    });
  }

  if (
    signals.canRecovery &&
    signals.sessionsLast7d > 0 &&
    (!signals.hadAnyCheckin ||
      (signals.daysSinceCheckin != null && signals.daysSinceCheckin >= 7))
  ) {
    const category = "incomplete_checkin" as const;
    const urgency = urgencyOf(category, signals);
    items.push({
      id: `${signals.athleteProfileId}:incomplete_checkin`,
      athleteProfileId: signals.athleteProfileId,
      athleteLabel: label,
      category,
      categoryLabel: COACH_ATTENTION_CATEGORY_LABELS[category],
      urgency,
      urgencyScore: COACH_ATTENTION_URGENCY_SCORE[urgency],
      title: `${label} — incomplete check-in`,
      detail: signals.hadAnyCheckin
        ? `No recovery check-in in ~${signals.daysSinceCheckin} days while training continued.`
        : "Training logged this week but no recovery check-in on file.",
      href,
    });
  }

  return items;
}

/**
 * Merge, prioritize, and cap — keeps the coach queue short.
 */
export function prioritizeAttentionQueue(
  candidates: CoachAttentionItem[],
  options?: {
    maxItems?: number;
    maxPerAthlete?: number;
  },
): AttentionQueueResult {
  const maxItems = options?.maxItems ?? COACH_ATTENTION_MAX_ITEMS;
  const maxPerAthlete =
    options?.maxPerAthlete ?? COACH_ATTENTION_MAX_PER_ATHLETE;

  const sorted = [...candidates].sort((a, b) => {
    if (b.urgencyScore !== a.urgencyScore) {
      return b.urgencyScore - a.urgencyScore;
    }
    // Prefer actionable problems over celebration when tied
    const aPositive = a.category === "new_pr" ? 1 : 0;
    const bPositive = b.category === "new_pr" ? 1 : 0;
    if (aPositive !== bPositive) return aPositive - bPositive;
    return a.athleteLabel.localeCompare(b.athleteLabel);
  });

  const perAthlete = new Map<string, number>();
  const items: CoachAttentionItem[] = [];

  for (const item of sorted) {
    const count = perAthlete.get(item.athleteProfileId) ?? 0;
    if (count >= maxPerAthlete) continue;
    items.push(item);
    perAthlete.set(item.athleteProfileId, count + 1);
    if (items.length >= maxItems) break;
  }

  return {
    items,
    totalCandidates: candidates.length,
    capped: candidates.length > items.length,
  };
}

/**
 * Full pipeline for one roster of signal bags.
 */
export function buildPrioritizedAttention(
  roster: AthleteAttentionSignals[],
): AttentionQueueResult {
  const candidates = roster.flatMap(buildAthleteAttentionItems);
  return prioritizeAttentionQueue(candidates);
}
