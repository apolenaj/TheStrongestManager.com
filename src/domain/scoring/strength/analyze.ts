import {
  contextScoreFromRatio,
  experienceContextLabel,
  normalizeExperienceContext,
  normalizeSportContext,
  referenceMultiple,
  SPORT_LIFT_WEIGHTS,
  type ExperienceContext,
  type MajorLiftMetricKey,
  type SportContext,
} from "@/domain/scoring/strength/context";
import {
  resolveLiftEffort,
  type ResolvedEffort,
  type StrengthEvidenceLabel,
} from "@/domain/scoring/strength/e1rm";
import {
  STRENGTH_MIN_CONTEXT_LIFTS_FOR_HIGH,
  STRENGTH_MIN_CONTEXT_LIFTS_FOR_MEDIUM,
  STRENGTH_PRIOR_WINDOW_DAYS,
  STRENGTH_RECENT_WINDOW_DAYS,
  STRENGTH_WEIGHT_CONTEXT,
  STRENGTH_WEIGHT_TREND,
} from "@/domain/scoring/strength/thresholds";
import { SCORE_DEFINITIONS } from "@/domain/scoring/definitions";
import { buildResult, daysAgo } from "@/domain/scoring/result";
import type {
  LiftSample,
  ScoreResult,
  ScoringSnapshot,
} from "@/domain/scoring/types";

const LIFT_LABELS: Record<MajorLiftMetricKey, string> = {
  lift_squat: "Back squat",
  lift_bench: "Bench press",
  lift_deadlift: "Deadlift",
  lift_press: "Overhead press",
};

const MAJOR_KEYS = Object.keys(LIFT_LABELS) as MajorLiftMetricKey[];

export type StrengthLiftBreakdown = {
  metricKey: MajorLiftMetricKey;
  label: string;
  /** Best observed single/unspecified load — never an e1RM. */
  verifiedBest: {
    kg: number;
    recordedAt: Date;
    label: StrengthEvidenceLabel;
  } | null;
  /** Best Epley estimate from multi-rep work — always Estimated. */
  estimated1rm: {
    kg: number;
    fromLoadKg: number;
    fromReps: number;
    recordedAt: Date;
    label: "Estimated";
  } | null;
  /** Best reported (non-observed) load claim. */
  reportedBest: {
    kg: number;
    recordedAt: Date;
    label: "Reported";
  } | null;
  /** Effort used for context/trend (prefer verified, else estimated, else reported). */
  scoringEffort: ResolvedEffort | null;
  bodyweightRatio: number | null;
  contextScore: number | null;
  referenceMultiple: number;
  /** All resolved efforts for trend windows. */
  efforts: ResolvedEffort[];
  sampleCount: number;
};

export type StrengthTrend = {
  direction: "up" | "down" | "flat";
  /** Percent change recent vs prior (effort kg). */
  percentChange: number;
  recentBestKg: number;
  priorBestKg: number;
  /** Whether trend used any estimated 1RM efforts. */
  includesEstimates: boolean;
  explanation: string;
};

export type StrengthAssessment = {
  result: ScoreResult;
  experienceContext: ExperienceContext;
  experienceLabel: string;
  sportContext: SportContext;
  bodyweightKg: number | null;
  /** Displayable current strength score (confidence-gated by caller via displayableScore). */
  currentEstimatedStrength: number | null;
  trend: StrengthTrend | null;
  lifts: StrengthLiftBreakdown[];
  disclaimers: string[];
};

function isMajorKey(key: string): key is MajorLiftMetricKey {
  return (MAJOR_KEYS as string[]).includes(key);
}

function bestEffort(
  efforts: ResolvedEffort[],
  predicate: (e: ResolvedEffort) => boolean,
): ResolvedEffort | null {
  const matched = efforts.filter(predicate);
  if (matched.length === 0) return null;
  return matched.reduce((max, e) => (e.effortKg > max.effortKg ? e : max));
}

function analyzeLift(
  metricKey: MajorLiftMetricKey,
  samples: LiftSample[],
  bodyweightKg: number | null,
  experience: ExperienceContext,
): StrengthLiftBreakdown {
  const efforts = samples
    .map((s) =>
      resolveLiftEffort({
        valueKg: s.valueKg,
        reps: s.reps,
        source: s.source,
        recordedAt: s.recordedAt,
      }),
    )
    .filter((e): e is ResolvedEffort => e != null);

  const verifiedBest = bestEffort(
    efforts,
    (e) => e.label === "Verified" && !e.isEstimated1rm,
  );
  const estimated1rmEffort = bestEffort(efforts, (e) => e.isEstimated1rm);
  const reportedBest = bestEffort(efforts, (e) => e.label === "Reported");

  const scoringEffort =
    verifiedBest ?? estimated1rmEffort ?? reportedBest ?? null;

  const reference = referenceMultiple(experience, metricKey);
  let bodyweightRatio: number | null = null;
  let contextScore: number | null = null;
  if (scoringEffort && bodyweightKg && bodyweightKg > 0) {
    bodyweightRatio = scoringEffort.effortKg / bodyweightKg;
    contextScore = contextScoreFromRatio(bodyweightRatio, reference);
  }

  return {
    metricKey,
    label: LIFT_LABELS[metricKey],
    verifiedBest: verifiedBest
      ? {
          kg: verifiedBest.loadKg,
          recordedAt: verifiedBest.recordedAt,
          label: "Verified",
        }
      : null,
    estimated1rm: estimated1rmEffort
      ? {
          kg: estimated1rmEffort.effortKg,
          fromLoadKg: estimated1rmEffort.loadKg,
          fromReps: estimated1rmEffort.reps as number,
          recordedAt: estimated1rmEffort.recordedAt,
          label: "Estimated",
        }
      : null,
    reportedBest: reportedBest
      ? {
          kg: reportedBest.loadKg,
          recordedAt: reportedBest.recordedAt,
          label: "Reported",
        }
      : null,
    scoringEffort,
    bodyweightRatio,
    contextScore,
    referenceMultiple: reference,
    efforts,
    sampleCount: samples.length,
  };
}

function computeTrend(
  lifts: StrengthLiftBreakdown[],
  now: Date,
): StrengthTrend | null {
  const recentStart = daysAgo(now, STRENGTH_RECENT_WINDOW_DAYS);
  const priorStart = daysAgo(
    now,
    STRENGTH_RECENT_WINDOW_DAYS + STRENGTH_PRIOR_WINDOW_DAYS,
  );

  const recentEfforts: ResolvedEffort[] = [];
  const priorEfforts: ResolvedEffort[] = [];
  let includesEstimates = false;

  for (const lift of lifts) {
    for (const effort of lift.efforts) {
      if (effort.isEstimated1rm) includesEstimates = true;
      if (effort.recordedAt >= recentStart) recentEfforts.push(effort);
      else if (
        effort.recordedAt >= priorStart &&
        effort.recordedAt < recentStart
      ) {
        priorEfforts.push(effort);
      }
    }
  }

  if (recentEfforts.length === 0 || priorEfforts.length === 0) return null;

  const recentBestKg = Math.max(...recentEfforts.map((e) => e.effortKg));
  const priorBestKg = Math.max(...priorEfforts.map((e) => e.effortKg));
  if (!(priorBestKg > 0)) return null;

  const percentChange = ((recentBestKg - priorBestKg) / priorBestKg) * 100;
  const direction: StrengthTrend["direction"] =
    percentChange > 1 ? "up" : percentChange < -1 ? "down" : "flat";

  return {
    direction,
    percentChange: Math.round(percentChange * 10) / 10,
    recentBestKg,
    priorBestKg,
    includesEstimates,
    explanation: includesEstimates
      ? `Trend compares recent vs prior best efforts over ${STRENGTH_RECENT_WINDOW_DAYS}d windows. Includes Estimated 1RM values — not verified PRs.`
      : `Trend compares recent vs prior best logged loads over ${STRENGTH_RECENT_WINDOW_DAYS}d windows.`,
  };
}

function trendComponentScore(trend: StrengthTrend | null): number | null {
  if (!trend) return null;
  // Map ±20% change onto 0–100 centered at 50 (transparent linear map).
  const capped = Math.max(-20, Math.min(20, trend.percentChange));
  return 50 + (capped / 20) * 50;
}

/**
 * Full strength assessment: ScoreResult + lift breakdown for UI.
 */
export function analyzeStrength(snapshot: ScoringSnapshot): StrengthAssessment {
  const def = SCORE_DEFINITIONS.strength;
  const experience = normalizeExperienceContext(snapshot.experienceLevel);
  const sport = normalizeSportContext(snapshot.primaryDiscipline);
  const bodyweightKg = snapshot.bodyweightKg;
  const weights = SPORT_LIFT_WEIGHTS[sport];

  const byLift = new Map<MajorLiftMetricKey, LiftSample[]>();
  for (const sample of snapshot.lifts) {
    if (!isMajorKey(sample.metricKey)) continue;
    const list = byLift.get(sample.metricKey) ?? [];
    list.push(sample);
    byLift.set(sample.metricKey, list);
  }

  const liftsWithData = MAJOR_KEYS.map((key) =>
    analyzeLift(key, byLift.get(key) ?? [], bodyweightKg, experience),
  ).filter((l) => l.sampleCount > 0);

  const trend = computeTrend(liftsWithData, snapshot.now);

  const contextParts: { score: number; weight: number; key: string; observed: boolean }[] =
    [];
  for (const lift of liftsWithData) {
    if (lift.contextScore == null) continue;
    const weight = weights[lift.metricKey];
    if (weight == null || weight <= 0) continue;
    contextParts.push({
      score: lift.contextScore,
      weight,
      key: lift.metricKey,
      observed: lift.scoringEffort?.label === "Verified",
    });
  }

  const disclaimers = [
    "Estimated 1RM (Epley) is never shown as a verified personal record.",
    "Bodyweight-relative scores use your experience level — beginners are not compared to competition standards.",
    "Until set-by-set session logging ships, lift history comes from ProgressMetric training logs.",
  ];

  const missingInputs: string[] = [];
  if (bodyweightKg == null || bodyweightKg <= 0) {
    missingInputs.push("Bodyweight (for bodyweight-relative performance)");
  }
  if (contextParts.length < STRENGTH_MIN_CONTEXT_LIFTS_FOR_MEDIUM) {
    missingInputs.push(
      `≥${STRENGTH_MIN_CONTEXT_LIFTS_FOR_MEDIUM} sport-relevant lifts with usable efforts (have ${contextParts.length})`,
    );
  }

  const inputs = [
    {
      key: "experienceContext",
      label: "Experience context",
      value: experienceContextLabel(experience),
      source: "reported" as const,
    },
    {
      key: "sportContext",
      label: "Sport context",
      value: sport,
      source: "reported" as const,
    },
    {
      key: "bodyweightKg",
      label: "Bodyweight",
      value: bodyweightKg,
      unit: "kg",
      source: "reported" as const,
    },
    ...contextParts.map((p) => ({
      key: `context:${p.key}`,
      label: `${p.key} context score`,
      value: Math.round(p.score),
      unit: "points",
      source: p.observed ? ("observed" as const) : ("heuristic" as const),
    })),
  ];

  const weightSum = contextParts.reduce((s, p) => s + p.weight, 0);
  const contextScore =
    weightSum > 0
      ? contextParts.reduce((s, p) => s + p.score * p.weight, 0) / weightSum
      : null;
  const trendScore = trendComponentScore(trend);

  let blended: number | null = null;
  if (contextScore != null && trendScore != null) {
    blended =
      STRENGTH_WEIGHT_CONTEXT * contextScore +
      STRENGTH_WEIGHT_TREND * trendScore;
  } else if (contextScore != null) {
    blended = contextScore;
  } else if (trendScore != null) {
    blended = trendScore;
  }

  const observedContextLifts = contextParts.filter((p) => p.observed).length;

  let confidence: ScoreResult["confidence"] = "none";
  if (
    contextScore != null &&
    observedContextLifts >= STRENGTH_MIN_CONTEXT_LIFTS_FOR_HIGH &&
    bodyweightKg != null
  ) {
    confidence = "high";
  } else if (
    contextScore != null &&
    contextParts.length >= STRENGTH_MIN_CONTEXT_LIFTS_FOR_MEDIUM &&
    bodyweightKg != null
  ) {
    // Reported efforts can reach medium only if we have BW + enough lifts —
    // but product honesty: reported-only stays low for display gate.
    confidence =
      observedContextLifts >= STRENGTH_MIN_CONTEXT_LIFTS_FOR_MEDIUM
        ? "medium"
        : "low";
  } else if (blended != null) {
    confidence = "low";
  }

  const result = buildResult({
    scoreKey: "strength",
    score: blended,
    confidence,
    inputs,
    missingInputs,
    explanation:
      blended == null
        ? "Strength Score not computed — need bodyweight and sport-relevant lift history for level-relative scoring."
        : `Strength Score blends level-relative bodyweight performance (${Math.round(STRENGTH_WEIGHT_CONTEXT * 100)}%) with recent trend (${Math.round(STRENGTH_WEIGHT_TREND * 100)}%) for a ${experienceContextLabel(experience).toLowerCase()} ${sport} context. Estimated 1RMs are labeled Estimated, never Verified PRs.`,
    formulaId: "strength.context_trend.v2",
    formulaDescription: def.formula,
    minimumData: def.requiredMinimumData,
    notes: [
      `experience=${experience}`,
      `sport=${sport}`,
      `contextLifts=${contextParts.length}`,
      `observedContextLifts=${observedContextLifts}`,
      `hasTrend=${trend != null}`,
    ],
    timestamp: snapshot.now,
  });

  return {
    result,
    experienceContext: experience,
    experienceLabel: experienceContextLabel(experience),
    sportContext: sport,
    bodyweightKg,
    currentEstimatedStrength: blended,
    trend,
    lifts: liftsWithData,
    disclaimers,
  };
}

/** Score engine entry used by computeAthleteScores. */
export function computeStrengthScore(snapshot: ScoringSnapshot): ScoreResult {
  return analyzeStrength(snapshot).result;
}

export { LIFT_LABELS, MAJOR_KEYS };
