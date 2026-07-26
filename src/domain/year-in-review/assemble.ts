import {
  MONTH_LABELS_SHORT,
  YEAR_IN_REVIEW_ENGINE_VERSION,
  YEAR_IN_REVIEW_HONESTY,
} from "@/domain/year-in-review/constants";
import type {
  YearInReviewCard,
  YearInReviewReport,
  YearInReviewSharePayload,
  YearInReviewSignals,
} from "@/domain/year-in-review/types";

/**
 * Month with the highest completed-session count.
 * Ties → earliest month. Null if no sessions.
 */
export function findMostConsistentMonth(
  sessionsByMonth: number[],
): { monthIndex: number; label: string; sessions: number } | null {
  let bestIdx = -1;
  let best = 0;
  for (let i = 0; i < 12; i++) {
    const n = sessionsByMonth[i] ?? 0;
    if (n > best) {
      best = n;
      bestIdx = i;
    }
  }
  if (bestIdx < 0 || best <= 0) return null;
  return {
    monthIndex: bestIdx,
    label: MONTH_LABELS_SHORT[bestIdx]!,
    sessions: best,
  };
}

function techniqueDelta(
  first: number | null,
  last: number | null,
): number | null {
  if (first == null || last == null) return null;
  return Math.round(last - first);
}

/**
 * Assemble annual report cards from logged signals — never invent counts.
 */
export function assembleYearInReview(
  signals: YearInReviewSignals,
): YearInReviewReport {
  const yearKey = String(signals.year);
  const consistent = findMostConsistentMonth(signals.sessionsByMonth);
  const techDelta = techniqueDelta(
    signals.techniqueFirstAvg,
    signals.techniqueLastAvg,
  );

  const cards: YearInReviewCard[] = [];

  cards.push({
    id: "intro",
    kind: "intro",
    headline: `${signals.year}`,
    subline: `${signals.athleteDisplayName}'s training ledger`,
    stats: [],
    empty: false,
  });

  cards.push({
    id: "sessions",
    kind: "sessions",
    headline:
      signals.completedSessions > 0
        ? String(signals.completedSessions)
        : "—",
    subline:
      signals.completedSessions > 0
        ? "Completed training sessions"
        : "No completed sessions logged this year",
    stats:
      signals.completedSessions > 0
        ? [
            {
              label: "Months with training",
              value: String(
                signals.sessionsByMonth.filter((n) => n > 0).length,
              ),
            },
          ]
        : [],
    empty: signals.completedSessions === 0,
  });

  cards.push({
    id: "prs",
    kind: "prs",
    headline: signals.prCount > 0 ? String(signals.prCount) : "—",
    subline:
      signals.prCount > 0
        ? "Personal records detected"
        : "No PRs logged this year",
    stats: signals.prHighlights.slice(0, 3).map((p) => ({
      label: p.title,
      value: p.detail,
    })),
    empty: signals.prCount === 0,
  });

  const techHeadline =
    techDelta != null
      ? `${techDelta > 0 ? "+" : ""}${techDelta}`
      : signals.techniqueLastAvg != null
        ? String(Math.round(signals.techniqueLastAvg))
        : "—";
  cards.push({
    id: "technique",
    kind: "technique",
    headline: techHeadline,
    subline:
      techDelta != null
        ? "Technique score change (first→last half of year)"
        : signals.techniqueLastAvg != null
          ? "Technique average (insufficient span for a delta)"
          : "No completed technique scores this year",
    stats:
      signals.techniqueSampleCount > 0
        ? [
            {
              label: "Analyses",
              value: String(signals.techniqueSampleCount),
            },
          ]
        : [],
    empty: signals.techniqueSampleCount === 0,
  });

  cards.push({
    id: "top_exercises",
    kind: "top_exercises",
    headline:
      signals.topExercises.length > 0
        ? signals.topExercises[0]!.exerciseLabel
        : "—",
    subline:
      signals.topExercises.length > 0
        ? "Most logged exercise (by working sets)"
        : "No working sets logged this year",
    stats: signals.topExercises.slice(0, 5).map((e, i) => ({
      label: `#${i + 1} ${e.exerciseLabel}`,
      value: `${e.setCount} sets`,
    })),
    empty: signals.topExercises.length === 0,
  });

  cards.push({
    id: "most_consistent_month",
    kind: "most_consistent_month",
    headline: consistent ? consistent.label : "—",
    subline: consistent
      ? "Most consistent month by completed sessions"
      : "No month had completed sessions",
    stats: consistent
      ? [{ label: "Sessions", value: String(consistent.sessions) }]
      : [],
    empty: consistent == null,
  });

  cards.push({
    id: "competition",
    kind: "competition",
    headline:
      signals.competitions.length > 0
        ? String(signals.competitions.length)
        : "—",
    subline:
      signals.competitions.length > 0
        ? "Competition prep records"
        : "No competition prep logged this year",
    stats: signals.competitions.slice(0, 4).map((c) => ({
      label: c.name,
      value: [c.dateLabel, c.status, c.weightClassLabel]
        .filter(Boolean)
        .join(" · "),
    })),
    empty: signals.competitions.length === 0,
  });

  cards.push({
    id: "closer",
    kind: "closer",
    headline: "Logged. Not invented.",
    subline: `The ${signals.year} ledger closes here — share only what you earned.`,
    stats: [],
    empty: false,
  });

  return {
    engineVersion: YEAR_IN_REVIEW_ENGINE_VERSION,
    yearKey,
    yearLabel: `${signals.year} Year in Review`,
    athleteDisplayName: signals.athleteDisplayName,
    cards,
    honesty: YEAR_IN_REVIEW_HONESTY,
    mostConsistentMonth: consistent?.label ?? null,
  };
}

export function buildYearInReviewSharePayload(
  report: YearInReviewReport,
): YearInReviewSharePayload {
  return {
    yearKey: report.yearKey,
    yearLabel: report.yearLabel,
    athleteDisplayName: report.athleteDisplayName,
    cards: report.cards.map((c) => ({
      kind: c.kind,
      headline: c.headline,
      subline: c.subline,
      stats: c.stats,
      empty: c.empty,
    })),
    honestyNote: YEAR_IN_REVIEW_HONESTY[0],
    engineVersion: report.engineVersion,
  };
}
