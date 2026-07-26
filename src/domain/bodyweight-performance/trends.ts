/**
 * Classify bodyweight / strength / relative-strength trends.
 */

import {
  BODYWEIGHT_PERFORMANCE_STABLE_PCT,
  BODYWEIGHT_PERFORMANCE_STABLE_STRENGTH_KG,
} from "@/domain/bodyweight-performance/constants";
import type {
  BwPerfSample,
  BwPerfTrendDirection,
  BwPerfWindowSummary,
} from "@/domain/bodyweight-performance/types";

export function sortSamples(samples: BwPerfSample[]): BwPerfSample[] {
  return [...samples].sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
  );
}

export function classifyDeltaTrend(input: {
  start: number | null;
  end: number | null;
  /** Prefer absolute kg band for strength; use % for bodyweight / ratios. */
  mode: "percent" | "strength_kg" | "ratio";
}): BwPerfTrendDirection {
  if (input.start == null || input.end == null) return "unknown";
  if (!(input.start > 0) || !Number.isFinite(input.end)) return "unknown";

  const delta = input.end - input.start;

  if (input.mode === "strength_kg") {
    if (Math.abs(delta) <= BODYWEIGHT_PERFORMANCE_STABLE_STRENGTH_KG) {
      return "stable";
    }
    return delta > 0 ? "up" : "down";
  }

  const pct = (delta / input.start) * 100;
  if (Math.abs(pct) <= BODYWEIGHT_PERFORMANCE_STABLE_PCT) return "stable";
  return pct > 0 ? "up" : "down";
}

export function formatSignedKg(deltaKg: number): string {
  const rounded = Math.round(deltaKg * 10) / 10;
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded} kg`;
}

export function summarizeWindow(
  samples: BwPerfSample[],
  mode: "percent" | "strength_kg",
): BwPerfWindowSummary {
  const sorted = sortSamples(samples).filter((s) => s.valueKg > 0);
  if (sorted.length === 0) {
    return {
      startKg: null,
      endKg: null,
      deltaKg: null,
      deltaDisplay: null,
      trend: "unknown",
      sampleCount: 0,
    };
  }
  const startKg = sorted[0]!.valueKg;
  const endKg = sorted[sorted.length - 1]!.valueKg;
  const deltaKg = endKg - startKg;
  const trend = classifyDeltaTrend({
    start: startKg,
    end: endKg,
    mode,
  });
  return {
    startKg,
    endKg,
    deltaKg,
    deltaDisplay: formatSignedKg(deltaKg),
    trend,
    sampleCount: sorted.length,
  };
}

/**
 * Pair bodyweight nearest to a strength sample (same day preferred, else closest prior).
 */
export function nearestBodyweightKg(
  at: string,
  bodyweights: BwPerfSample[],
): number | null {
  const t = new Date(at).getTime();
  if (Number.isNaN(t)) return null;
  const sorted = sortSamples(bodyweights);
  let best: BwPerfSample | null = null;
  let bestDist = Infinity;
  for (const bw of sorted) {
    const bt = new Date(bw.at).getTime();
    if (Number.isNaN(bt)) continue;
    const dist = Math.abs(bt - t);
    // Prefer same-day or prior within 14 days
    if (dist < bestDist && dist <= 14 * 24 * 60 * 60 * 1000) {
      best = bw;
      bestDist = dist;
    }
  }
  return best?.valueKg ?? null;
}

export function relativeStrengthAt(
  strengthKg: number | null,
  bodyweightKg: number | null,
): number | null {
  if (strengthKg == null || bodyweightKg == null || !(bodyweightKg > 0)) {
    return null;
  }
  return strengthKg / bodyweightKg;
}
