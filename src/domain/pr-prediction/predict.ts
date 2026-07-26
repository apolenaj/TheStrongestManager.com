import { estimate1rmKg } from "@/domain/scoring/strength/e1rm";
import {
  PR_HARD_SET_RPE_MIN,
  PR_HIGH_FATIGUE,
  PR_LOOKBACK_DAYS,
  PR_LOW_READINESS,
  PR_MAX_OPTIMISTIC_UPLIFT,
  PR_MAX_REPS_WITHOUT_RPE,
  PR_MIN_QUALIFYING_SETS,
  PR_RANGE_HALF_WIDTH_PCT,
  PR_ROUND_KG,
  PR_SINGLE_SET_MAX_REPS,
  PR_SINGLE_SET_MIN_RPE,
} from "@/domain/pr-prediction/constants";
import type {
  PrPrediction,
  PrPredictionConfidence,
  PrPredictionContext,
  PrPredictionResult,
  PrPredictionWithheld,
  WorkingSetInput,
} from "@/domain/pr-prediction/types";

type QualifiedSet = {
  set: WorkingSetInput;
  e1rmKg: number;
  isHard: boolean;
  hasRpe: boolean;
};

function roundKg(kg: number): number {
  const stepped = Math.round(kg / PR_ROUND_KG) * PR_ROUND_KG;
  return Math.round(stepped * 10) / 10;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1]! + sorted[mid]!) / 2;
  }
  return sorted[mid]!;
}

/**
 * Per-set effort estimate. Singles use load; multi-rep uses Epley.
 * Missing RPE applies a conservative discount (unknown proximity to failure).
 * Low RPE applies a capped, half-strength RIR uplift — still conservative.
 */
export function estimateSetE1rmKg(set: WorkingSetInput): number | null {
  if (!(set.loadKg > 0) || !Number.isFinite(set.loadKg)) return null;
  if (!Number.isInteger(set.reps) || set.reps < 1) return null;

  let base: number | null;
  if (set.reps === 1) {
    base = set.loadKg;
  } else {
    base = estimate1rmKg(set.loadKg, set.reps);
  }
  if (base == null) return null;

  if (set.rpe == null) {
    // Unknown proximity — discount so we do not overclaim.
    return base * 0.95;
  }

  const rpe = Math.min(10, Math.max(0, set.rpe));
  if (rpe >= 9.5) return base;

  // Remaining reps in reserve — mild uplift only, capped.
  const rir = Math.max(0, 10 - rpe);
  const uplift = Math.min(PR_MAX_OPTIMISTIC_UPLIFT, rir * 0.012);
  return base * (1 + uplift);
}

function qualifySets(
  sets: WorkingSetInput[],
  now: Date,
): { qualified: QualifiedSet[]; rejectReason: string | null } {
  const since = now.getTime() - PR_LOOKBACK_DAYS * 24 * 60 * 60 * 1000;
  const recent = sets.filter((s) => s.completedAt.getTime() >= since);

  if (recent.length === 0) {
    return {
      qualified: [],
      rejectReason: `No working sets in the last ${PR_LOOKBACK_DAYS} days.`,
    };
  }

  const qualified: QualifiedSet[] = [];
  for (const set of recent) {
    if (set.reps > 12) continue;
    if (set.rpe == null && set.reps > PR_MAX_REPS_WITHOUT_RPE) continue;

    const e1rmKg = estimateSetE1rmKg(set);
    if (e1rmKg == null) continue;

    const hasRpe = set.rpe != null;
    const isHard =
      (hasRpe && set.rpe! >= PR_HARD_SET_RPE_MIN) ||
      (!hasRpe && set.reps <= 5) ||
      set.reps === 1;

    // Soft volume sets without RPE are excluded from the primary pool.
    if (!isHard && !hasRpe) continue;

    qualified.push({ set, e1rmKg, isHard, hasRpe });
  }

  if (qualified.length === 0) {
    return {
      qualified: [],
      rejectReason:
        "No qualifying working sets (need load + reps ≤12; prefer RPE ≥7 or heavy singles).",
    };
  }

  return { qualified, rejectReason: null };
}

function dataQualityAllowsPrediction(qualified: QualifiedSet[]): {
  ok: boolean;
  reason: string | null;
} {
  if (qualified.length >= PR_MIN_QUALIFYING_SETS) {
    return { ok: true, reason: null };
  }

  const sole = qualified[0];
  if (
    sole &&
    sole.hasRpe &&
    sole.set.rpe! >= PR_SINGLE_SET_MIN_RPE &&
    sole.set.reps <= PR_SINGLE_SET_MAX_REPS
  ) {
    return { ok: true, reason: null };
  }

  return {
    ok: false,
    reason: `Insufficient data quality — need at least ${PR_MIN_QUALIFYING_SETS} qualifying working sets (or one ≤${PR_SINGLE_SET_MAX_REPS}-rep set at RPE ≥${PR_SINGLE_SET_MIN_RPE}).`,
  };
}

function resolveConfidence(parts: {
  qualifyingCount: number;
  hardCount: number;
  setsWithRpe: number;
  trendKnown: boolean;
  phaseKnown: boolean;
  fatigueKnown: boolean;
  singleSetException: boolean;
  missRateHigh: boolean;
}): PrPredictionConfidence {
  if (parts.singleSetException || parts.missRateHigh) return "low";

  let score = 0;
  if (parts.qualifyingCount >= 4) score += 2;
  else if (parts.qualifyingCount >= 2) score += 1;
  if (parts.hardCount >= 2) score += 1;
  if (parts.setsWithRpe >= 2) score += 2;
  else if (parts.setsWithRpe >= 1) score += 1;
  if (parts.trendKnown) score += 1;
  if (parts.phaseKnown) score += 1;
  if (parts.fatigueKnown) score += 1;

  if (score >= 7) return "high";
  if (score >= 4) return "moderate";
  return "low";
}

/**
 * Predict a conservative estimated 1RM range for one lift.
 * Returns null when data quality is insufficient (caller should withhold).
 */
export function predictOneRmRange(
  ctx: PrPredictionContext,
  now: Date = new Date(),
): { prediction: PrPrediction } | { withheld: PrPredictionWithheld } {
  const { qualified, rejectReason } = qualifySets(ctx.workingSets, now);
  if (rejectReason) {
    return {
      withheld: {
        exerciseKey: ctx.exerciseKey,
        exerciseLabel: ctx.exerciseLabel,
        reason: rejectReason,
      },
    };
  }

  const quality = dataQualityAllowsPrediction(qualified);
  if (!quality.ok) {
    return {
      withheld: {
        exerciseKey: ctx.exerciseKey,
        exerciseLabel: ctx.exerciseLabel,
        reason: quality.reason!,
      },
    };
  }

  // Prefer hard sets for the center; fall back to all qualified.
  const hard = qualified.filter((q) => q.isHard);
  const pool = hard.length > 0 ? hard : qualified;
  const e1rms = pool.map((q) => q.e1rmKg);
  const center = median(e1rms);

  const setsWithRpe = qualified.filter((q) => q.hasRpe).length;
  const singleSetException = qualified.length < PR_MIN_QUALIFYING_SETS;
  const missRate =
    qualified.filter((q) => q.set.hitRepTarget === false).length /
    qualified.length;
  const missRateHigh = missRate >= 0.5;

  // Deload under-represents max — withhold rather than invent a peak.
  if (ctx.trainingPhase === "deload" && hard.length < 2) {
    return {
      withheld: {
        exerciseKey: ctx.exerciseKey,
        exerciseLabel: ctx.exerciseLabel,
        reason:
          "Training phase looks like a deload with too few hard sets — loads likely underrepresent current max. Wait for heavier work.",
      },
    };
  }

  const confidence = resolveConfidence({
    qualifyingCount: qualified.length,
    hardCount: hard.length,
    setsWithRpe,
    trendKnown: ctx.trend !== "unknown",
    phaseKnown: ctx.trainingPhase !== "unknown",
    fatigueKnown: ctx.fatigue != null || ctx.readiness != null,
    singleSetException,
    missRateHigh,
  });

  const half = PR_RANGE_HALF_WIDTH_PCT[confidence];
  let low = center * (1 - half);
  let high = center * (1 + half);

  const assumptions: string[] = [
    "Estimated 1RM uses Epley for multi-rep sets; singles use logged load.",
    "Output is a range, not a guaranteed competition attempt.",
    `Center from median of ${pool.length} qualifying set estimate(s) over ${PR_LOOKBACK_DAYS} days.`,
  ];

  if (setsWithRpe === 0) {
    assumptions.push(
      "No RPE logged — estimates discounted 5% and confidence capped lower.",
    );
  } else {
    assumptions.push(
      "RPE adjusts proximity to failure mildly; low RPE does not invent large headroom.",
    );
  }

  // Fatigue / readiness — pull both bounds down when stressed.
  if (ctx.fatigue != null && ctx.fatigue >= PR_HIGH_FATIGUE) {
    const factor = 0.97;
    low *= factor;
    high *= factor;
    assumptions.push(
      `Elevated fatigue (${ctx.fatigue}/10) — range shifted down ~3% (not a medical reading).`,
    );
  } else if (ctx.readiness != null && ctx.readiness <= PR_LOW_READINESS) {
    const factor = 0.98;
    low *= factor;
    high *= factor;
    assumptions.push(
      `Low readiness (${Math.round(ctx.readiness)}) — range shifted down slightly.`,
    );
  } else if (ctx.fatigue == null && ctx.readiness == null) {
    assumptions.push("No recent fatigue/readiness log — not used as a signal.");
  }

  // Trend — conservative: declining pulls down; improving adds tiny high-side only.
  if (ctx.trend === "declining") {
    low *= 0.98;
    high *= 0.98;
    assumptions.push(
      "Recent performance trend declining — range biased slightly down.",
    );
  } else if (ctx.trend === "improving") {
    high *= 1 + Math.min(0.015, PR_MAX_OPTIMISTIC_UPLIFT / 2);
    assumptions.push(
      "Recent performance trend improving — upper bound nudged slightly; lower bound unchanged.",
    );
  } else if (ctx.trend === "stable") {
    assumptions.push("Performance trend stable — no trend bias applied.");
  } else {
    assumptions.push("Performance trend unknown — no trend bias applied.");
  }

  // Training phase
  if (ctx.trainingPhase === "accumulation") {
    high *= 0.99;
    assumptions.push(
      "Accumulation/volume phase — intensity underrepresents max; upper bound tempered.",
    );
  } else if (ctx.trainingPhase === "peaking") {
    assumptions.push(
      "Peaking/taper phase — intensity more representative; still a range, not a meet attempt.",
    );
  } else if (ctx.trainingPhase === "intensification") {
    assumptions.push("Intensification phase — hard sets weighted for the estimate.");
  } else if (ctx.trainingPhase === "deload") {
    assumptions.push(
      "Deload phase with enough hard-set history — treat as conservative floor, not a peak claim.",
    );
  } else {
    assumptions.push("Training phase unknown — no phase bias beyond set selection.");
  }

  if (missRateHigh) {
    assumptions.push(
      "Many missed rep targets recently — confidence lowered; range stays conservative.",
    );
  }

  if (singleSetException) {
    assumptions.push(
      "Only one hard set met the exception rule — confidence is low.",
    );
  }

  // Ensure ordering after adjustments; enforce minimum width of one round step.
  low = roundKg(low);
  high = roundKg(high);
  if (high <= low) {
    high = roundKg(low + PR_ROUND_KG);
  }

  return {
    prediction: {
      exerciseKey: ctx.exerciseKey,
      exerciseLabel: ctx.exerciseLabel,
      rangeKg: { low, high },
      confidence,
      assumptions,
      inputsUsed: {
        qualifyingSetCount: qualified.length,
        hardSetCount: hard.length,
        setsWithRpe,
        medianE1rmKg: roundKg(center),
        trend: ctx.trend,
        trainingPhase: ctx.trainingPhase,
        fatigue: ctx.fatigue,
        readiness: ctx.readiness,
      },
    },
  };
}

/**
 * Run predictions for multiple lifts; withhold when data quality is insufficient.
 */
export function predictPrRanges(
  contexts: PrPredictionContext[],
  now: Date = new Date(),
): PrPredictionResult {
  const predictions: PrPrediction[] = [];
  const withheld: PrPredictionWithheld[] = [];

  for (const ctx of contexts) {
    const result = predictOneRmRange(ctx, now);
    if ("prediction" in result) {
      predictions.push(result.prediction);
    } else {
      withheld.push(result.withheld);
    }
  }

  return {
    predictions,
    withheld,
    generatedAt: now.toISOString(),
  };
}
