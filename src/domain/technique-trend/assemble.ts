import type { ConfidenceLevel } from "@/domain/scoring/types";
import {
  TECHNIQUE_TREND_DELTA_THRESHOLD,
  TECHNIQUE_TREND_ENGINE_VERSION,
  TECHNIQUE_TREND_HONESTY,
  TECHNIQUE_TREND_ISSUE_MAX,
  TECHNIQUE_TREND_MIN_SAMPLES,
  TECHNIQUE_TREND_PREFERRED_SAMPLES,
} from "@/domain/technique-trend/constants";
import {
  areCameraAnglesComparable,
  techniqueTrendSeriesKey,
} from "@/domain/technique-trend/camera";
import type {
  ComponentTrend,
  MetricTrendStatus,
  TechniqueScorePoint,
  TechniqueTrendDirection,
  TechniqueTrendHighlight,
  TechniqueTrendResult,
  TechniqueTrendSample,
  TechniqueTrendSeries,
} from "@/domain/technique-trend/types";

/**
 * Build longitudinal technique trends from scored analyses.
 * Never mixes incompatible camera angles unless an explicit pair is supported.
 */
export function assembleTechniqueTrends(
  samples: TechniqueTrendSample[],
): TechniqueTrendResult {
  let skippedNoScore = 0;
  let skippedAngle = 0;

  const usable: TechniqueTrendSample[] = [];
  for (const s of samples) {
    if (!Number.isFinite(s.overallScore)) {
      skippedNoScore += 1;
      continue;
    }
    if (!areCameraAnglesComparable(s.cameraAngle, s.cameraAngle)) {
      skippedAngle += 1;
      continue;
    }
    usable.push(s);
  }

  const groups = new Map<string, TechniqueTrendSample[]>();
  for (const s of usable) {
    const key = techniqueTrendSeriesKey(s.exerciseSlug, s.cameraAngle);
    const list = groups.get(key) ?? [];
    list.push(s);
    groups.set(key, list);
  }

  const series: TechniqueTrendSeries[] = [];
  for (const [, group] of groups) {
    const sorted = [...group].sort(
      (a, b) =>
        new Date(a.createdAtIso).getTime() - new Date(b.createdAtIso).getTime(),
    );
    const angle = sorted[0]?.cameraAngle;
    if (!angle) continue;

    const comparable = sorted.filter((s) =>
      areCameraAnglesComparable(s.cameraAngle, angle),
    );
    const excludedIncompatibleCount = sorted.length - comparable.length;
    if (comparable.length < TECHNIQUE_TREND_MIN_SAMPLES) continue;

    series.push(buildSeries(comparable, excludedIncompatibleCount));
  }

  series.sort((a, b) => {
    const aLast = a.overallScores.at(-1)?.createdAtIso ?? "";
    const bLast = b.overallScores.at(-1)?.createdAtIso ?? "";
    return bLast.localeCompare(aLast);
  });

  const skippedParts: string[] = [];
  if (skippedNoScore > 0) {
    skippedParts.push(`${skippedNoScore} without a Technique Score`);
  }
  if (skippedAngle > 0) {
    skippedParts.push(
      `${skippedAngle} with ineligible/incompatible camera angles`,
    );
  }

  return {
    engineVersion: TECHNIQUE_TREND_ENGINE_VERSION,
    series,
    honesty: TECHNIQUE_TREND_HONESTY,
    emptyReason:
      series.length === 0
        ? `Need ≥${TECHNIQUE_TREND_MIN_SAMPLES} scored analyses for the same exercise and compatible camera angle (e.g. repeated side-view deadlifts).`
        : null,
    skippedSummary:
      skippedParts.length > 0 ? `Skipped: ${skippedParts.join("; ")}.` : null,
  };
}

function buildSeries(
  samples: TechniqueTrendSample[],
  excludedIncompatibleCount: number,
): TechniqueTrendSeries {
  const overallScores: TechniqueScorePoint[] = samples.map((s) => ({
    analysisId: s.analysisId,
    createdAtIso: s.createdAtIso,
    score: Math.round(s.overallScore),
    href: s.href,
  }));

  const first = overallScores[0].score;
  const latest = overallScores[overallScores.length - 1].score;
  const overallDelta = latest - first;
  const direction = classifyDirection(overallDelta);

  const componentTrends = buildComponentTrends(samples);
  const improved = componentTrends.filter((c) => c.status === "improved");
  const stable = componentTrends.filter((c) => c.status === "stable");
  const regressed = componentTrends.filter((c) => c.status === "regressed");

  const mostImproved = pickMostImproved(improved);
  const persistentIssue = pickPersistentIssue(samples);

  const missingInformation: string[] = [];
  if (samples.length < TECHNIQUE_TREND_PREFERRED_SAMPLES) {
    missingInformation.push(
      `${TECHNIQUE_TREND_PREFERRED_SAMPLES} comparable analyses preferred for stronger confidence`,
    );
  }

  return {
    id: techniqueTrendSeriesKey(
      samples[0].exerciseSlug,
      samples[0].cameraAngle,
    ),
    exerciseSlug: samples[0].exerciseSlug,
    exerciseName: samples[0].exerciseName,
    cameraAngle: samples[0].cameraAngle,
    overallScores,
    direction,
    overallDelta,
    confidence: seriesConfidence(samples.length),
    improved,
    stable,
    regressed,
    mostImproved,
    persistentIssue,
    excludedIncompatibleCount,
    missingInformation,
  };
}

function classifyDirection(delta: number): TechniqueTrendDirection {
  if (delta >= TECHNIQUE_TREND_DELTA_THRESHOLD) return "up";
  if (delta <= -TECHNIQUE_TREND_DELTA_THRESHOLD) return "down";
  return "flat";
}

function statusFromDelta(delta: number): MetricTrendStatus {
  if (delta >= TECHNIQUE_TREND_DELTA_THRESHOLD) return "improved";
  if (delta <= -TECHNIQUE_TREND_DELTA_THRESHOLD) return "regressed";
  return "stable";
}

function seriesConfidence(n: number): ConfidenceLevel {
  if (n >= TECHNIQUE_TREND_PREFERRED_SAMPLES) return "medium";
  if (n >= TECHNIQUE_TREND_MIN_SAMPLES) return "low";
  return "none";
}

function buildComponentTrends(
  samples: TechniqueTrendSample[],
): ComponentTrend[] {
  const byId = new Map<string, { label: string; scores: number[] }>();

  for (const sample of samples) {
    for (const c of sample.components) {
      const row = byId.get(c.id) ?? { label: c.label, scores: [] };
      row.scores.push(c.score);
      row.label = c.label;
      byId.set(c.id, row);
    }
  }

  const trends: ComponentTrend[] = [];
  for (const [id, row] of byId) {
    if (row.scores.length < TECHNIQUE_TREND_MIN_SAMPLES) continue;
    const firstScore = row.scores[0];
    const latestScore = row.scores[row.scores.length - 1];
    const delta = latestScore - firstScore;
    trends.push({
      id,
      label: row.label,
      status: statusFromDelta(delta),
      scores: row.scores,
      delta,
      firstScore,
      latestScore,
    });
  }

  return trends.sort((a, b) => b.delta - a.delta);
}

function pickMostImproved(
  improved: ComponentTrend[],
): TechniqueTrendHighlight | null {
  if (improved.length === 0) return null;
  const best = [...improved].sort((a, b) => b.delta - a.delta)[0];
  return {
    id: best.id,
    label: best.label,
    detail: `Most improved technical element: ${best.label} (${best.firstScore} → ${best.latestScore}, Δ${best.delta > 0 ? "+" : ""}${best.delta}). Score change only — cause not attributed.`,
    scores: best.scores,
    delta: best.delta,
  };
}

/**
 * Persistent issue: component that stays in the issue band across samples
 * (including the latest). Does not invent a biomechanical cause.
 */
function pickPersistentIssue(
  samples: TechniqueTrendSample[],
): TechniqueTrendHighlight | null {
  if (samples.length < TECHNIQUE_TREND_MIN_SAMPLES) return null;

  const latest = samples[samples.length - 1];
  const weakLatest = latest.components
    .filter((c) => c.score <= TECHNIQUE_TREND_ISSUE_MAX)
    .sort((a, b) => a.score - b.score);

  for (const candidate of weakLatest) {
    const history: number[] = [];
    for (const sample of samples) {
      const hit = sample.components.find((c) => c.id === candidate.id);
      if (hit) history.push(hit.score);
    }
    if (history.length < TECHNIQUE_TREND_MIN_SAMPLES) continue;
    const weakCount = history.filter(
      (s) => s <= TECHNIQUE_TREND_ISSUE_MAX,
    ).length;
    if (weakCount >= Math.ceil(history.length / 2)) {
      return {
        id: candidate.id,
        label: candidate.label,
        detail: `Current persistent issue: ${candidate.label} (latest ${candidate.score}/100; ${weakCount}/${history.length} comparable analyses ≤${TECHNIQUE_TREND_ISSUE_MAX}). Observed score pattern only — cause not attributed.`,
        scores: history,
        delta: history[history.length - 1] - history[0],
      };
    }
  }

  return null;
}
