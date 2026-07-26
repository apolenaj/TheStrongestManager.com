import {
  BAR_PATH_DISPLAY_CONFIDENCE_MIN,
  BAR_PATH_ENGINE_VERSION,
  BAR_PATH_HONESTY,
  BAR_PATH_HORIZ_STD_EXCELLENT,
  BAR_PATH_HORIZ_STD_POOR,
  BAR_PATH_MIN_SAMPLES,
  BAR_PATH_MIN_WRIST_COVERAGE,
  type BarPathLiftKind,
} from "@/domain/movement/bar-path/constants";
import type {
  BarPathAnalysis,
  BarPathMetric,
  BarPathPoint,
} from "@/domain/movement/bar-path/types";
import {
  confidenceFromScore,
  midWrist,
  stddev,
} from "@/domain/movement/geometry";
import type { PoseFrame } from "@/domain/movement/types";

export type AnalyzeBarPathInput = {
  exerciseSlug: string;
  cameraAngle: string | null;
  frames: PoseFrame[];
};

/**
 * Track bar path via mid-wrist proxy when confidence allows.
 * Returns displayable=false (metrics/path hidden) when detection is poor — never fabricates.
 */
export function analyzeBarPath(input: AnalyzeBarPathInput): BarPathAnalysis {
  const liftKind = resolveLiftKind(input.exerciseSlug);
  const base = (
    partial: Partial<BarPathAnalysis> &
      Pick<BarPathAnalysis, "displayable" | "unavailableReason" | "confidence" | "confidenceScore">,
  ): BarPathAnalysis => ({
    engineVersion: BAR_PATH_ENGINE_VERSION,
    liftKind,
    proxy: "mid_wrist",
    horizontalDeviation: null,
    verticalPath: null,
    repConsistency: null,
    pathPoints: [],
    sampleCount: 0,
    wristCoverage: 0,
    honesty: BAR_PATH_HONESTY,
    ...partial,
  });

  if (!liftKind) {
    return base({
      displayable: false,
      unavailableReason: `Bar-path tracking is not attempted for “${input.exerciseSlug}”. Supported: deadlift, squat (side), bench (side).`,
      confidence: "none",
      confidenceScore: 0,
    });
  }

  if (
    (liftKind === "squat" || liftKind === "bench") &&
    input.cameraAngle !== "side"
  ) {
    return base({
      displayable: false,
      unavailableReason: `${capitalize(liftKind)} bar-path requires a side-view camera (got “${input.cameraAngle ?? "unknown"}”). Metric hidden.`,
      confidence: "none",
      confidenceScore: 0,
    });
  }

  if (input.cameraAngle === "overhead" || input.cameraAngle === "other") {
    return base({
      displayable: false,
      unavailableReason:
        "Camera angle is unsuitable for wrist/bar-proxy path tracking. Metric hidden.",
      confidence: "none",
      confidenceScore: 0,
    });
  }

  const samples: BarPathPoint[] = [];
  for (const frame of input.frames) {
    const w = midWrist(frame);
    if (!w) continue;
    samples.push({
      frameIndex: frame.index,
      timeSeconds: frame.timeSeconds,
      x: w.x,
      y: w.y,
      visibility: w.visibility,
    });
  }

  const wristCoverage =
    input.frames.length === 0 ? 0 : samples.length / input.frames.length;
  const meanVis =
    samples.length === 0
      ? 0
      : samples.reduce((a, s) => a + s.visibility, 0) / samples.length;

  // Side view boosts confidence; front/45° lower for sagittal path claims
  let angleFactor = 0.75;
  if (input.cameraAngle === "side") angleFactor = 1;
  else if (input.cameraAngle === "forty_five") angleFactor = 0.7;
  else if (input.cameraAngle === "front" || input.cameraAngle === "rear") {
    angleFactor = 0.45;
  }

  const coverageScore = Math.min(1, wristCoverage / BAR_PATH_MIN_WRIST_COVERAGE);
  const confidenceScore = clamp01(
    coverageScore * 0.55 + meanVis * 0.3 + angleFactor * 0.15,
  );
  const confidence = confidenceFromScore(confidenceScore);

  if (
    samples.length < BAR_PATH_MIN_SAMPLES ||
    wristCoverage < BAR_PATH_MIN_WRIST_COVERAGE ||
    confidenceScore < BAR_PATH_DISPLAY_CONFIDENCE_MIN ||
    confidence === "none" ||
    confidence === "low"
  ) {
    return base({
      displayable: false,
      unavailableReason:
        samples.length < BAR_PATH_MIN_SAMPLES
          ? `Wrist/bar proxy samples insufficient (${samples.length}/${BAR_PATH_MIN_SAMPLES}). Metric hidden — not fabricated.`
          : wristCoverage < BAR_PATH_MIN_WRIST_COVERAGE
            ? `Wrist coverage ${(wristCoverage * 100).toFixed(0)}% below ${(BAR_PATH_MIN_WRIST_COVERAGE * 100).toFixed(0)}% threshold. Metric hidden.`
            : "Bar-path detection confidence is poor. Metric and path visualization hidden.",
      confidence,
      confidenceScore,
      sampleCount: samples.length,
      wristCoverage,
    });
  }

  const xs = samples.map((s) => s.x);
  const ys = samples.map((s) => s.y);
  const horizStd = stddev(xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const yRange = yMax - yMin;

  const horizontalDeviation: BarPathMetric | null =
    horizStd == null
      ? null
      : {
          key: "bar_path_horizontal_deviation",
          label: "Horizontal deviation",
          value: Math.round(horizStd * 1000) / 1000,
          unit: "norm_x_stddev",
          basis:
            "Sample stddev of mid-wrist x across the clip (image plane). Lower ≈ tighter lateral path in frame.",
        };

  const verticalPath: BarPathMetric | null =
    yRange < 0.02
      ? null
      : {
          key: "bar_path_vertical_range",
          label: "Vertical path range",
          value: Math.round(yRange * 1000) / 1000,
          unit: "norm_y",
          basis:
            "Max − min mid-wrist y (image plane). Describes vertical travel of the wrist/bar proxy.",
        };

  const repConsistency = computeRepConsistency(samples);

  // If core metrics cannot be formed, hide rather than show a hollow path
  if (!horizontalDeviation && !verticalPath) {
    return base({
      displayable: false,
      unavailableReason:
        "Wrist samples present but path metrics could not be formed honestly. Metric hidden.",
      confidence,
      confidenceScore,
      sampleCount: samples.length,
      wristCoverage,
    });
  }

  return {
    engineVersion: BAR_PATH_ENGINE_VERSION,
    liftKind,
    proxy: "mid_wrist",
    confidence,
    confidenceScore,
    displayable: true,
    unavailableReason: null,
    horizontalDeviation,
    verticalPath,
    repConsistency,
    pathPoints: downsample(samples, 48),
    sampleCount: samples.length,
    wristCoverage,
    honesty: BAR_PATH_HONESTY,
  };
}

export function resolveLiftKind(slug: string): BarPathLiftKind | null {
  const s = slug.toLowerCase();
  if (s === "deadlift" || s.includes("deadlift")) return "deadlift";
  if (s.includes("squat")) return "squat";
  if (s.includes("bench")) return "bench";
  return null;
}

/**
 * Rep consistency: compare horizontal shape across vertical cycles.
 * Returns null when fewer than 2 cycles — do not invent multi-rep consistency.
 */
function computeRepConsistency(
  samples: BarPathPoint[],
): BarPathMetric | null {
  if (samples.length < BAR_PATH_MIN_SAMPLES) return null;
  const ys = samples.map((s) => s.y);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const range = yMax - yMin;
  if (range < 0.04) return null;

  // Local maxima in y ≈ lowest points in frame (bottoms of pulls / bottoms of squats)
  const bottoms: number[] = [];
  for (let i = 2; i < samples.length - 2; i += 1) {
    const y = samples[i].y;
    if (
      y >= samples[i - 1].y &&
      y >= samples[i + 1].y &&
      y >= samples[i - 2].y &&
      y >= samples[i + 2].y &&
      y > yMin + range * 0.55
    ) {
      bottoms.push(i);
    }
  }

  // Deduplicate nearby bottoms
  const reps: number[] = [];
  for (const idx of bottoms) {
    if (reps.length === 0 || idx - reps[reps.length - 1] >= 4) {
      reps.push(idx);
    }
  }

  if (reps.length < 2) {
    return null;
  }

  // Segment between consecutive bottoms; compare x stddev of each segment
  const segmentStds: number[] = [];
  for (let r = 0; r < reps.length - 1; r += 1) {
    const slice = samples.slice(reps[r], reps[r + 1] + 1).map((s) => s.x);
    const s = stddev(slice);
    if (s != null) segmentStds.push(s);
  }
  if (segmentStds.length < 1) return null;

  // Consistency: how similar segment horizontal deviations are (inverse of stddev-of-stddevs)
  const meta = stddev(segmentStds) ?? 0;
  const meanStd =
    segmentStds.reduce((a, b) => a + b, 0) / segmentStds.length;
  // Score 0–100: tight similar reps score higher
  const spreadPenalty = Math.min(1, meta / Math.max(meanStd, 0.001));
  const levelPenalty = Math.min(
    1,
    Math.max(0, (meanStd - BAR_PATH_HORIZ_STD_EXCELLENT) /
      (BAR_PATH_HORIZ_STD_POOR - BAR_PATH_HORIZ_STD_EXCELLENT)),
  );
  const score = Math.round(100 * (1 - 0.55 * spreadPenalty - 0.45 * levelPenalty));

  return {
    key: "bar_path_rep_consistency",
    label: "Rep consistency",
    value: Math.max(0, Math.min(100, score)),
    unit: "score_0_100",
    basis: `Compared horizontal path shape across ${reps.length} detected vertical cycles (wrist/bar proxy).`,
  };
}

function downsample(points: BarPathPoint[], max: number): BarPathPoint[] {
  if (points.length <= max) return points;
  const out: BarPathPoint[] = [];
  const step = (points.length - 1) / (max - 1);
  for (let i = 0; i < max; i += 1) {
    out.push(points[Math.round(i * step)]);
  }
  return out;
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
