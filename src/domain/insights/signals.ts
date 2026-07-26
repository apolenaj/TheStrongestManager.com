/**
 * Pure helpers to derive cross-domain signal trends (Prompt 32).
 */

export type DatedKg = { at: Date; kg: number };

/**
 * Simple linear slope → kg per week from chronological bodyweight points.
 * Needs ≥3 samples spanning ≥7 days.
 */
export function estimateBodyweightTrendKgPerWeek(
  points: DatedKg[],
): number | null {
  if (points.length < 3) return null;
  const sorted = [...points].sort((a, b) => a.at.getTime() - b.at.getTime());
  const first = sorted[0]!;
  const last = sorted[sorted.length - 1]!;
  const spanDays =
    (last.at.getTime() - first.at.getTime()) / (1000 * 60 * 60 * 24);
  if (spanDays < 7) return null;

  const xs = sorted.map(
    (p) => (p.at.getTime() - first.at.getTime()) / (1000 * 60 * 60 * 24),
  );
  const ys = sorted.map((p) => p.kg);
  const n = xs.length;
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i]! - meanX) * (ys[i]! - meanY);
    den += (xs[i]! - meanX) ** 2;
  }
  if (den === 0) return null;
  const slopePerDay = num / den;
  return Math.round(slopePerDay * 7 * 100) / 100;
}

/** Recent mean − prior mean; null if either side empty. */
export function meanDelta(
  recent: number[],
  prior: number[],
): number | null {
  if (recent.length === 0 || prior.length === 0) return null;
  const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
  return Math.round((avg(recent) - avg(prior)) * 10) / 10;
}

export function volumeTrendPct(
  recentVolumeKg: number,
  priorVolumeKg: number,
): number | null {
  if (priorVolumeKg <= 0 || recentVolumeKg < 0) return null;
  return Math.round(((recentVolumeKg - priorVolumeKg) / priorVolumeKg) * 1000) / 10;
}

export function classifyPerformanceTrend(
  recentProxy: number | null,
  priorProxy: number | null,
): "up" | "down" | "flat" | "unknown" {
  if (recentProxy == null || priorProxy == null || priorProxy === 0) {
    return "unknown";
  }
  const pct = (recentProxy - priorProxy) / Math.abs(priorProxy);
  if (pct <= -0.08) return "down";
  if (pct >= 0.08) return "up";
  return "flat";
}
