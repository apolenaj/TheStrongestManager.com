import {
  GOAL_AGGRESSIVE_RATE_FACTOR,
  GOAL_MIN_TRAJECTORY_SAMPLES,
  GOAL_ON_TRACK_PROJECTION_RATIO,
  GOAL_REASONABLE_KG_PER_WEEK,
  GOAL_ROUND_KG,
} from "@/domain/goal-probability/constants";
import {
  inferLiftFromTitle,
  inferTargetDateFromTitle,
  resolveTargetKg,
} from "@/domain/goal-probability/parse-goal";
import type {
  EstimateRangeKg,
  GoalProgressAssessment,
  GoalProgressInput,
  GoalProgressResult,
  GoalTrajectoryStatus,
  TrajectorySample,
} from "@/domain/goal-probability/types";

const HONESTY_NOTE =
  "Qualitative trajectory only — no precise probability. A validated probability model is not available.";

function roundKg(kg: number): number {
  return Math.round(kg / GOAL_ROUND_KG) * GOAL_ROUND_KG;
}

function statusLabel(status: GoalTrajectoryStatus): string {
  switch (status) {
    case "on_track":
      return "On track";
    case "possible_but_aggressive":
      return "Possible but aggressive";
    case "below_target":
      return "Current trajectory below target";
    case "target_reached":
      return "Target already within current estimate";
    case "past_deadline":
      return "Past deadline — target not yet within estimate";
    case "insufficient_data":
      return "Insufficient data for trajectory";
  }
}

function daysBetween(a: Date, b: Date): number {
  return (b.getTime() - a.getTime()) / (24 * 60 * 60 * 1000);
}

function formatTimeRemaining(days: number): string {
  if (days < 1) return "Less than a day";
  if (days < 14) return `${Math.round(days)} day${Math.round(days) === 1 ? "" : "s"}`;
  const weeks = days / 7;
  if (weeks < 10) {
    const w = Math.round(weeks * 10) / 10;
    return `${w} weeks`;
  }
  return `${Math.round(weeks)} weeks`;
}

/**
 * Simple two-window slope (kg/week). Returns null when samples are too thin
 * or span is too short for an honest rate.
 */
export function estimateKgPerWeek(samples: TrajectorySample[]): number | null {
  if (samples.length < GOAL_MIN_TRAJECTORY_SAMPLES) return null;

  const sorted = [...samples].sort((a, b) => a.at.getTime() - b.at.getTime());
  const spanDays = daysBetween(sorted[0]!.at, sorted[sorted.length - 1]!.at);
  if (spanDays < 14) return null;

  const mid = Math.floor(sorted.length / 2);
  const earlier = sorted.slice(0, mid);
  const later = sorted.slice(mid);
  if (earlier.length === 0 || later.length === 0) return null;

  const mean = (xs: TrajectorySample[]) =>
    xs.reduce((s, x) => s + x.estimateKg, 0) / xs.length;

  const earlyMean = mean(earlier);
  const lateMean = mean(later);
  const earlyMid = earlier[Math.floor(earlier.length / 2)]!.at;
  const lateMid = later[Math.floor(later.length / 2)]!.at;
  const weeks = daysBetween(earlyMid, lateMid) / 7;
  if (weeks < 1.5) return null;

  return (lateMean - earlyMean) / weeks;
}

function midEstimate(range: EstimateRangeKg): number {
  return (range.low + range.high) / 2;
}

function classifyStatus(parts: {
  targetKg: number;
  current: EstimateRangeKg;
  weeksLeft: number | null;
  pastDeadline: boolean;
  kgPerWeek: number | null;
  requiredKgPerWeek: number | null;
  projectedKg: number | null;
}): { status: GoalTrajectoryStatus; reasons: string[] } {
  const reasons: string[] = [];
  const { targetKg, current } = parts;

  if (current.high >= targetKg) {
    reasons.push(
      `Current estimate high (${roundKg(current.high)} kg) already meets or exceeds the ${roundKg(targetKg)} kg target.`,
    );
    return { status: "target_reached", reasons };
  }

  if (parts.pastDeadline) {
    reasons.push(
      `Deadline has passed and current estimate (${roundKg(current.low)}–${roundKg(current.high)} kg) is still below ${roundKg(targetKg)} kg.`,
    );
    return { status: "past_deadline", reasons };
  }

  if (parts.weeksLeft == null || parts.weeksLeft <= 0) {
    reasons.push("No usable target date — cannot judge trajectory against a deadline.");
    return { status: "insufficient_data", reasons };
  }

  if (parts.requiredKgPerWeek == null) {
    reasons.push("Could not compute required improvement rate.");
    return { status: "insufficient_data", reasons };
  }

  const required = parts.requiredKgPerWeek;
  const observed = parts.kgPerWeek;
  const projected = parts.projectedKg;

  reasons.push(
    `Need about ${roundKg(required)} kg/week from the current mid-estimate to hit ${roundKg(targetKg)} kg in time.`,
  );

  if (projected != null && projected >= targetKg * GOAL_ON_TRACK_PROJECTION_RATIO) {
    reasons.push(
      `Projected ${roundKg(projected)} kg by the deadline from recent trajectory — within an on-track band (not a probability).`,
    );
    if (observed != null) {
      reasons.push(
        `Recent trajectory ≈ ${roundKg(observed)} kg/week vs required ≈ ${roundKg(required)} kg/week.`,
      );
    }
    return { status: "on_track", reasons };
  }

  // No reliable slope — judge by absolute required rate only.
  if (observed == null) {
    if (required <= GOAL_REASONABLE_KG_PER_WEEK * 0.85) {
      reasons.push(
        "Not enough history for a slope; required rate looks modest for strength work, but confirmation needs more logged sets.",
      );
      return { status: "possible_but_aggressive", reasons };
    }
    if (required <= GOAL_REASONABLE_KG_PER_WEEK * 1.15) {
      reasons.push(
        `Not enough history for a slope; required rate (~${roundKg(required)} kg/week) is aggressive without a matching trend.`,
      );
      return { status: "possible_but_aggressive", reasons };
    }
    reasons.push(
      `Required rate (~${roundKg(required)} kg/week) exceeds a conservative soft ceiling (~${GOAL_REASONABLE_KG_PER_WEEK} kg/week) with no supporting trajectory.`,
    );
    return { status: "below_target", reasons };
  }

  reasons.push(
    `Recent trajectory ≈ ${roundKg(observed)} kg/week; projection ≈ ${projected != null ? `${roundKg(projected)} kg` : "n/a"} by deadline.`,
  );

  if (required <= 0) {
    return { status: "on_track", reasons };
  }

  const aggressiveVsHistory =
    observed > 0
      ? required > observed * GOAL_AGGRESSIVE_RATE_FACTOR
      : required > GOAL_REASONABLE_KG_PER_WEEK * 0.5;

  const beyondSoftCeiling = required > GOAL_REASONABLE_KG_PER_WEEK;

  if (!aggressiveVsHistory && !beyondSoftCeiling) {
    reasons.push(
      "Required rate is close to recent progress and under a conservative weekly ceiling.",
    );
    return { status: "on_track", reasons };
  }

  if (beyondSoftCeiling && (observed <= 0 || required > observed * 2)) {
    reasons.push(
      "Required gain is far above recent trajectory and a conservative weekly ceiling — current path does not support the target date.",
    );
    return { status: "below_target", reasons };
  }

  reasons.push(
    "Target may still be reachable, but it would need a clearly faster rate of improvement than recent training shows.",
  );
  return { status: "possible_but_aggressive", reasons };
}

/**
 * Assess one goal's progress — qualitative trajectory, never a % probability.
 */
export function assessGoalProgress(
  input: GoalProgressInput,
  now: Date = new Date(),
): GoalProgressAssessment {
  const { goal } = input;
  const liftSlug =
    goal.liftSlug !== undefined
      ? goal.liftSlug
      : inferLiftFromTitle(goal.title);
  const targetKg = resolveTargetKg(goal);
  const targetDate =
    goal.targetDate ?? inferTargetDateFromTitle(goal.title, now);

  const base = {
    goalId: goal.id,
    goalTitle: goal.title,
    targetKg: targetKg != null ? roundKg(targetKg) : null,
    targetDate: targetDate ? targetDate.toISOString() : null,
    liftSlug,
    honestyNote: HONESTY_NOTE,
  };

  if (goal.status !== "active" && goal.status !== "paused") {
    return {
      ...base,
      status: "insufficient_data",
      statusLabel: statusLabel("insufficient_data"),
      currentEstimateKg: input.currentEstimateKg,
      requiredImprovementKg: null,
      timeRemaining: null,
      trajectory: {
        kgPerWeek: null,
        projectedKgAtTarget: null,
        requiredKgPerWeek: null,
        sampleCount: input.trajectorySamples.length,
        summary: `Goal status is “${goal.status}” — progress estimation applies to active goals.`,
      },
      reasons: [`Goal is marked ${goal.status}; trajectory not evaluated.`],
    };
  }

  if (targetKg == null) {
    return {
      ...base,
      status: "insufficient_data",
      statusLabel: statusLabel("insufficient_data"),
      currentEstimateKg: input.currentEstimateKg,
      requiredImprovementKg: null,
      timeRemaining: null,
      trajectory: {
        kgPerWeek: null,
        projectedKgAtTarget: null,
        requiredKgPerWeek: null,
        sampleCount: input.trajectorySamples.length,
        summary: "No numeric target (kg) on the goal.",
      },
      reasons: [
        "Add a target value (e.g. 320 kg) or include it in the goal title so progress can be estimated.",
      ],
    };
  }

  if (!liftSlug && goal.category !== "strength" && goal.category !== "performance") {
    // Still allow if we have an estimate bound externally
  }

  if (input.currentEstimateKg == null) {
    return {
      ...base,
      status: "insufficient_data",
      statusLabel: statusLabel("insufficient_data"),
      currentEstimateKg: null,
      requiredImprovementKg: null,
      timeRemaining: targetDate
        ? (() => {
            const days = daysBetween(now, targetDate);
            return {
              days: Math.max(0, Math.round(days * 10) / 10),
              weeks: Math.max(0, Math.round((days / 7) * 10) / 10),
              label: days < 0 ? "Deadline passed" : formatTimeRemaining(days),
            };
          })()
        : null,
      trajectory: {
        kgPerWeek: estimateKgPerWeek(input.trajectorySamples),
        projectedKgAtTarget: null,
        requiredKgPerWeek: null,
        sampleCount: input.trajectorySamples.length,
        summary:
          "No current capacity estimate — log recent working sets (load, reps, RPE) for this lift.",
      },
      reasons: [
        "Current estimate unavailable. The PR prediction engine needs enough recent working sets before goal trajectory can be judged.",
      ],
    };
  }

  const current = {
    low: roundKg(input.currentEstimateKg.low),
    high: roundKg(input.currentEstimateKg.high),
  };
  const mid = midEstimate(current);
  const vsHigh = roundKg(targetKg - current.high);
  const vsLow = roundKg(targetKg - current.low);

  let timeRemaining: GoalProgressAssessment["timeRemaining"] = null;
  let weeksLeft: number | null = null;
  let pastDeadline = false;

  if (targetDate) {
    const days = daysBetween(now, targetDate);
    pastDeadline = days < -0.5;
    weeksLeft = Math.max(days / 7, 0);
    timeRemaining = {
      days: Math.round(days * 10) / 10,
      weeks: Math.round((days / 7) * 10) / 10,
      label: pastDeadline ? "Deadline passed" : formatTimeRemaining(Math.max(days, 0)),
    };
  }

  const kgPerWeek = estimateKgPerWeek(input.trajectorySamples);
  const gapFromMid = Math.max(0, targetKg - mid);
  const requiredKgPerWeek =
    weeksLeft != null && weeksLeft > 0.15
      ? gapFromMid / weeksLeft
      : null;

  const projectedKgAtTarget =
    kgPerWeek != null && weeksLeft != null && weeksLeft > 0
      ? mid + kgPerWeek * weeksLeft
      : null;

  const { status, reasons } = classifyStatus({
    targetKg,
    current,
    weeksLeft,
    pastDeadline,
    kgPerWeek,
    requiredKgPerWeek,
    projectedKg: projectedKgAtTarget,
  });

  let trajectorySummary: string;
  if (kgPerWeek == null) {
    trajectorySummary = `Not enough spaced samples (${input.trajectorySamples.length}) for a trustworthy kg/week slope.`;
  } else if (kgPerWeek > 0.05) {
    trajectorySummary = `Improving ≈ ${roundKg(kgPerWeek)} kg/week on estimated capacity.`;
  } else if (kgPerWeek < -0.05) {
    trajectorySummary = `Declining ≈ ${roundKg(Math.abs(kgPerWeek))} kg/week on estimated capacity.`;
  } else {
    trajectorySummary = "Recent estimated capacity is roughly flat.";
  }

  return {
    ...base,
    status,
    statusLabel: statusLabel(status),
    currentEstimateKg: current,
    requiredImprovementKg: {
      vsHigh: Math.max(0, vsHigh),
      vsLow: Math.max(0, vsLow),
    },
    timeRemaining,
    trajectory: {
      kgPerWeek: kgPerWeek != null ? roundKg(kgPerWeek) : null,
      projectedKgAtTarget:
        projectedKgAtTarget != null ? roundKg(projectedKgAtTarget) : null,
      requiredKgPerWeek:
        requiredKgPerWeek != null ? roundKg(requiredKgPerWeek) : null,
      sampleCount: input.trajectorySamples.length,
      summary: trajectorySummary,
    },
    reasons,
  };
}

export function assessGoalsProgress(
  inputs: GoalProgressInput[],
  now: Date = new Date(),
): GoalProgressResult {
  return {
    assessments: inputs.map((i) => assessGoalProgress(i, now)),
    generatedAt: now.toISOString(),
  };
}
