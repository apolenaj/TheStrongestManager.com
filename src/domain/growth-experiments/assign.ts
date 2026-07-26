import {
  GROWTH_ALLOWLIST_SURFACES,
  GROWTH_DENYLIST_CATEGORIES,
  GROWTH_EXPERIMENTS,
  GROWTH_MIN_SAMPLE_PER_ARM,
  type GrowthAllowlistSurface,
  type GrowthDenylistCategory,
  type GrowthExperimentArm,
  type GrowthExperimentDefinition,
} from "@/domain/growth-experiments/constants";

export function getGrowthExperiment(
  id: string,
): GrowthExperimentDefinition | undefined {
  return GROWTH_EXPERIMENTS.find((e) => e.id === id);
}

export function listRunningGrowthExperiments(): GrowthExperimentDefinition[] {
  return GROWTH_EXPERIMENTS.filter((e) => e.status === "running");
}

export function isAllowlistedSurface(
  surface: string,
): surface is GrowthAllowlistSurface {
  return (GROWTH_ALLOWLIST_SURFACES as readonly string[]).includes(surface);
}

export function isDenylistedCategory(
  category: string,
): category is GrowthDenylistCategory {
  return (GROWTH_DENYLIST_CATEGORIES as readonly string[]).includes(category);
}

/**
 * Refuse experiments that target denylisted categories.
 * Call before registering or activating an experiment definition.
 */
export function assertExperimentSurfaceAllowed(
  surface: string,
): { ok: true } | { ok: false; error: string } {
  if (!isAllowlistedSurface(surface)) {
    return {
      ok: false,
      error: `Surface "${surface}" is not allowlisted for growth experiments.`,
    };
  }
  return { ok: true };
}

export function assertCategoryNotDenied(
  category: string,
): { ok: true } | { ok: false; error: string } {
  if (isDenylistedCategory(category)) {
    return {
      ok: false,
      error: `Category "${category}" must never be experimented on.`,
    };
  }
  return { ok: true };
}

/** Stable 0–99 bucket from experiment + subject. */
export function assignmentBucket(
  experimentId: string,
  subjectKey: string,
): number {
  const input = `${experimentId}::${subjectKey}`;
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash) % 100;
}

export function assignArm(
  experiment: GrowthExperimentDefinition,
  subjectKey: string,
): GrowthExperimentArm {
  const bucket = assignmentBucket(experiment.id, subjectKey);
  let cursor = 0;
  for (const arm of experiment.arms) {
    cursor += arm.weight;
    if (bucket < cursor) return arm;
  }
  return experiment.arms[experiment.arms.length - 1]!;
}

/**
 * Wilson score interval for a binomial rate (approx. 95%).
 * Used for honest interval display — not a significance badge.
 */
export function wilsonInterval(
  successes: number,
  trials: number,
  z = 1.96,
): { low: number; high: number; rate: number } | null {
  if (trials <= 0) return null;
  const p = successes / trials;
  const z2 = z * z;
  const denom = 1 + z2 / trials;
  const center = p + z2 / (2 * trials);
  const margin =
    z * Math.sqrt((p * (1 - p) + z2 / (4 * trials)) / trials);
  return {
    rate: p,
    low: Math.max(0, (center - margin) / denom),
    high: Math.min(1, (center + margin) / denom),
  };
}

export type ArmOutcomeStats = {
  armId: string;
  exposures: number;
  conversions: number;
  rate: number | null;
  interval: { low: number; high: number } | null;
  sampleAdequate: boolean;
};

export type ExperimentOutcomeReport = {
  experimentId: string;
  minSamplePerArm: number;
  arms: ArmOutcomeStats[];
  /** Never invents a winner under sample threshold. */
  declaredWinnerArmId: string | null;
  status:
    | "insufficient_sample"
    | "estimate_only"
    | "no_data";
  note: string;
};

/**
 * Summarize arm outcomes with sample gates.
 * Overlapping Wilson intervals ⇒ no declared winner (honest underpowered guard).
 */
export function summarizeExperimentOutcomes(input: {
  experimentId: string;
  arms: Array<{ armId: string; exposures: number; conversions: number }>;
  minSamplePerArm?: number;
}): ExperimentOutcomeReport {
  const min = input.minSamplePerArm ?? GROWTH_MIN_SAMPLE_PER_ARM;
  const arms: ArmOutcomeStats[] = input.arms.map((a) => {
    const interval = wilsonInterval(a.conversions, a.exposures);
    return {
      armId: a.armId,
      exposures: a.exposures,
      conversions: a.conversions,
      rate: interval?.rate ?? null,
      interval: interval
        ? { low: interval.low, high: interval.high }
        : null,
      sampleAdequate: a.exposures >= min,
    };
  });

  if (arms.every((a) => a.exposures === 0)) {
    return {
      experimentId: input.experimentId,
      minSamplePerArm: min,
      arms,
      declaredWinnerArmId: null,
      status: "no_data",
      note: "No exposures recorded in this process yet.",
    };
  }

  if (!arms.every((a) => a.sampleAdequate)) {
    return {
      experimentId: input.experimentId,
      minSamplePerArm: min,
      arms,
      declaredWinnerArmId: null,
      status: "insufficient_sample",
      note: `Need ≥${min} exposures per arm before estimating a winner.`,
    };
  }

  // Estimate-only: pick higher rate only if Wilson intervals do not overlap.
  const ranked = [...arms].sort(
    (a, b) => (b.rate ?? 0) - (a.rate ?? 0),
  );
  const top = ranked[0]!;
  const second = ranked[1];
  let winner: string | null = null;
  if (
    top.interval &&
    second?.interval &&
    top.interval.low > second.interval.high
  ) {
    winner = top.armId;
  }

  return {
    experimentId: input.experimentId,
    minSamplePerArm: min,
    arms,
    declaredWinnerArmId: winner,
    status: "estimate_only",
    note: winner
      ? "Non-overlapping Wilson intervals favor one arm — still review seasonality before shipping."
      : "Intervals overlap; no winner declared (no fake significance).",
  };
}
