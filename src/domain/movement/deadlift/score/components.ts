import {
  BAR_PROXY_EXCELLENT,
  BAR_PROXY_POOR,
  HIP_RISE_MONOTONIC_EXCELLENT,
  HIP_RISE_MONOTONIC_POOR,
  LOCKOUT_DY_EXCELLENT,
  LOCKOUT_DY_POOR,
  REP_CONSISTENCY_MIN_CYCLES,
  SETUP_STDDEV_EXCELLENT,
  SETUP_STDDEV_POOR,
  START_HORIZ_OFFSET_IDEAL,
  START_HORIZ_OFFSET_POOR,
  START_VERT_MAX,
  START_VERT_MIN,
  TORSO_STDDEV_EXCELLENT,
  TORSO_STDDEV_POOR,
  type DeadliftTechniqueComponentId,
} from "@/domain/movement/deadlift/score/thresholds";
import {
  nominalWeight,
  scoreHigherIsBetter,
  scoreInBand,
  scoreLowerIsBetter,
  type DeadliftComponentResult,
} from "@/domain/movement/deadlift/score/types";
import {
  DEADLIFT_PULL_SCOPE_PHASES,
  isDeadliftPullScopePhase,
} from "@/domain/movement/phases/constants";
import {
  confidenceFromScore,
  midHip,
  midShoulder,
  stddev,
} from "@/domain/movement/geometry";
import type {
  CameraSuitability,
  MovementPhaseId,
  MovementPhaseSegment,
  ObservableMetric,
  PoseFrame,
} from "@/domain/movement/types";

function metricMap(metrics: ObservableMetric[]): Map<string, ObservableMetric> {
  return new Map(metrics.map((m) => [m.key, m]));
}

function framesInPhases(
  frames: PoseFrame[],
  phases: MovementPhaseSegment[],
  ids: readonly MovementPhaseId[],
): PoseFrame[] {
  const ranges = phases.filter((p) => ids.includes(p.phase));
  if (ranges.length === 0) return [];
  return frames.filter((frame) =>
    ranges.some(
      (r) => frame.index >= r.startFrame && frame.index <= r.endFrame,
    ),
  );
}

function framesInPhase(
  frames: PoseFrame[],
  phases: MovementPhaseSegment[],
  phase: MovementPhaseId,
): PoseFrame[] {
  return framesInPhases(frames, phases, [phase]);
}

function unavailable(
  id: DeadliftTechniqueComponentId,
  label: string,
  reason: string,
  sourceMetricKeys: string[] = [],
): DeadliftComponentResult {
  return {
    id,
    label,
    score: null,
    weight: nominalWeight(id),
    effectiveWeight: 0,
    status: "unavailable",
    unavailableReason: reason,
    confidence: "none",
    confidenceScore: 0,
    evidence: reason,
    sourceMetricKeys,
  };
}

function observed(
  id: DeadliftTechniqueComponentId,
  label: string,
  score: number,
  confidenceScore: number,
  evidence: string,
  sourceMetricKeys: string[],
): DeadliftComponentResult {
  return {
    id,
    label,
    score: Math.max(0, Math.min(100, Math.round(score))),
    weight: nominalWeight(id),
    effectiveWeight: 0, // filled after renormalization
    status: "observed",
    confidence: confidenceFromScore(confidenceScore),
    confidenceScore,
    evidence,
    sourceMetricKeys,
  };
}

function cameraBlocks(
  suitability: CameraSuitability,
  metricKeys: string[],
): boolean {
  if (!suitability.suitable) return true;
  return metricKeys.some((k) => suitability.limitedMetricKeys.includes(k));
}

export function scoreSetupConsistency(
  frames: PoseFrame[],
  phases: MovementPhaseSegment[],
  suitability: CameraSuitability,
): DeadliftComponentResult {
  const id = "setup_consistency";
  const label = "Setup consistency";
  if (cameraBlocks(suitability, ["approx_hip_y_pull_mean"])) {
    return unavailable(
      id,
      label,
      "Camera angle limits hip-height observations needed for setup consistency.",
      ["approx_hip_y_pull_mean"],
    );
  }
  const setupFrames = framesInPhase(frames, phases, "setup");
  const ys = setupFrames
    .map((f) => midHip(f)?.y)
    .filter((y): y is number => y != null);
  if (ys.length < 3) {
    return unavailable(
      id,
      label,
      "Need ≥3 setup-phase frames with visible hips.",
    );
  }
  const spread = stddev(ys);
  if (spread == null) {
    return unavailable(id, label, "Could not compute setup hip-height variance.");
  }
  const score = scoreLowerIsBetter(
    spread,
    SETUP_STDDEV_EXCELLENT,
    SETUP_STDDEV_POOR,
  );
  return observed(
    id,
    label,
    score,
    Math.min(0.85, 0.4 + ys.length * 0.05),
    `Setup mid-hip y stddev=${spread.toFixed(4)} (image plane).`,
    [],
  );
}

export function scoreStartPosition(
  frames: PoseFrame[],
  phases: MovementPhaseSegment[],
  metrics: ObservableMetric[],
  suitability: CameraSuitability,
): DeadliftComponentResult {
  const id = "start_position";
  const label = "Start position";
  const keys = [
    "shoulder_hip_horizontal_offset",
    "shoulder_hip_vertical_relation",
  ];
  if (cameraBlocks(suitability, keys)) {
    return unavailable(
      id,
      label,
      "Camera angle limits shoulder–hip start-position observations.",
      keys,
    );
  }

  // Prefer last setup frame / first pull frame.
  const setup = framesInPhase(frames, phases, "setup");
  const pull = framesInPhases(frames, phases, DEADLIFT_PULL_SCOPE_PHASES);
  const startFrame =
    setup[setup.length - 1] ?? pull[0] ?? null;
  if (!startFrame) {
    return unavailable(id, label, "No setup/pull frame available for start position.");
  }
  const hip = midHip(startFrame);
  const shoulder = midShoulder(startFrame);
  if (!hip || !shoulder) {
    return unavailable(
      id,
      label,
      "Hips/shoulders not visible at start.",
      keys,
    );
  }
  const horiz = Math.abs(shoulder.x - hip.x);
  const vert = hip.y - shoulder.y;
  const horizScore = scoreLowerIsBetter(
    Math.abs(horiz - START_HORIZ_OFFSET_IDEAL),
    0,
    START_HORIZ_OFFSET_POOR - START_HORIZ_OFFSET_IDEAL,
  );
  const vertScore = scoreInBand(vert, START_VERT_MIN, START_VERT_MAX);
  const score = Math.round(0.55 * horizScore + 0.45 * vertScore);
  const byKey = metricMap(metrics);
  const conf = Math.min(
    byKey.get("shoulder_hip_horizontal_offset")?.confidenceScore ?? 0.5,
    byKey.get("shoulder_hip_vertical_relation")?.confidenceScore ?? 0.5,
    hip.visibility,
    shoulder.visibility,
  );
  return observed(
    id,
    label,
    score,
    conf,
    `Start horiz offset=${horiz.toFixed(3)}, vertical hip−shoulder=${vert.toFixed(3)} (image plane).`,
    keys,
  );
}

export function scoreBracingIndicators(
  suitability: CameraSuitability,
): DeadliftComponentResult {
  const id = "bracing_indicators";
  const label = "Bracing indicators";
  if (!suitability.suitable) {
    return unavailable(
      id,
      label,
      "Camera unsuitable — bracing still not observable from 2D pose.",
    );
  }
  return unavailable(
    id,
    label,
    "Bracing (breath / IAP) is not observable from 2D pose landmarks alone. Not scored.",
  );
}

export function scoreBarProximity(
  metrics: ObservableMetric[],
  suitability: CameraSuitability,
): DeadliftComponentResult {
  const id = "bar_proximity";
  const label = "Bar proximity";
  const key = "wrist_hip_vertical_proxy";
  if (cameraBlocks(suitability, [key])) {
    return unavailable(
      id,
      label,
      "Camera angle limits wrist–hip (bar/body) proxy observations.",
      [key],
    );
  }
  const metric = metricMap(metrics).get(key);
  if (!metric || metric.value == null || metric.confidence === "none") {
    return unavailable(
      id,
      label,
      "Wrist–hip proxy unavailable (wrists not visible or low confidence).",
      [key],
    );
  }
  const absGap = Math.abs(metric.value);
  const score = scoreLowerIsBetter(
    absGap,
    BAR_PROXY_EXCELLENT,
    BAR_PROXY_POOR,
  );
  return observed(
    id,
    label,
    score,
    metric.confidenceScore,
    `|wrist.y − hip.y|=${absGap.toFixed(3)} during pull (wrist proxy, not true bar path).`,
    [key],
  );
}

export function scoreHipRisePattern(
  frames: PoseFrame[],
  phases: MovementPhaseSegment[],
  suitability: CameraSuitability,
): DeadliftComponentResult {
  const id = "hip_rise_pattern";
  const label = "Hip rise pattern";
  if (cameraBlocks(suitability, ["approx_hip_y_pull_mean"])) {
    return unavailable(
      id,
      label,
      "Camera angle limits hip-rise observations.",
      ["approx_hip_y_pull_mean"],
    );
  }
  const pullFrames = framesInPhases(frames, phases, DEADLIFT_PULL_SCOPE_PHASES);
  const ys = pullFrames
    .map((f) => midHip(f)?.y)
    .filter((y): y is number => y != null);
  if (ys.length < 4) {
    return unavailable(
      id,
      label,
      "Need ≥4 pull-phase frames with visible hips for rise pattern.",
    );
  }
  let risingSteps = 0;
  let steps = 0;
  for (let i = 1; i < ys.length; i += 1) {
    steps += 1;
    // y decreases ⇒ hip rises toward top of frame
    if (ys[i] <= ys[i - 1] + 0.002) risingSteps += 1;
  }
  const monotonic = steps === 0 ? 0 : risingSteps / steps;
  const score = scoreHigherIsBetter(
    monotonic,
    HIP_RISE_MONOTONIC_EXCELLENT,
    HIP_RISE_MONOTONIC_POOR,
  );
  return observed(
    id,
    label,
    score,
    Math.min(0.8, 0.35 + ys.length * 0.04),
    `Pull hip-rise monotonicity=${monotonic.toFixed(2)} (fraction of non-descending steps).`,
    ["approx_hip_y_pull_mean"],
  );
}

export function scoreBackAngleConsistency(
  metrics: ObservableMetric[],
  suitability: CameraSuitability,
): DeadliftComponentResult {
  const id = "back_angle_consistency";
  const label = "Back-angle consistency";
  const key = "torso_angle_consistency_deg";
  if (cameraBlocks(suitability, [key])) {
    return unavailable(
      id,
      label,
      "Camera angle limits image-plane torso-angle consistency.",
      [key],
    );
  }
  const metric = metricMap(metrics).get(key);
  if (!metric || metric.value == null || metric.confidence === "none") {
    return unavailable(
      id,
      label,
      "Torso-angle consistency metric unavailable.",
      [key],
    );
  }
  const score = scoreLowerIsBetter(
    metric.value,
    TORSO_STDDEV_EXCELLENT,
    TORSO_STDDEV_POOR,
  );
  return observed(
    id,
    label,
    score,
    metric.confidenceScore,
    `Torso angle stddev=${metric.value}° during pull (image plane; not spine load).`,
    [key],
  );
}

export function scoreLockout(
  metrics: ObservableMetric[],
  suitability: CameraSuitability,
): DeadliftComponentResult {
  const id = "lockout";
  const label = "Lockout";
  const key = "lockout_hip_shoulder_dy";
  if (cameraBlocks(suitability, [key])) {
    return unavailable(
      id,
      label,
      "Camera angle limits lockout hip–shoulder stacking observations.",
      [key],
    );
  }
  const metric = metricMap(metrics).get(key);
  if (!metric || metric.value == null || metric.confidence === "none") {
    return unavailable(id, label, "Lockout metric unavailable.", [key]);
  }
  const score = scoreLowerIsBetter(
    metric.value,
    LOCKOUT_DY_EXCELLENT,
    LOCKOUT_DY_POOR,
  );
  return observed(
    id,
    label,
    score,
    metric.confidenceScore,
    `Lockout |hip.y − shoulder.y|=${metric.value} (stacked-in-frame proxy).`,
    [key],
  );
}

/**
 * Count pull cycles via distinct pull phase segments, or multiple hip-rise peaks.
 */
export function scoreRepConsistency(
  frames: PoseFrame[],
  phases: MovementPhaseSegment[],
  suitability: CameraSuitability,
): DeadliftComponentResult {
  const id = "rep_consistency";
  const label = "Rep consistency";
  if (!suitability.suitable) {
    return unavailable(id, label, "Camera unsuitable for multi-rep comparison.");
  }

  const pullPhases = phases.filter((p) => isDeadliftPullScopePhase(p.phase));
  let cycles = pullPhases.length;

  // If phase detector merged into one pull, try counting hip-rise peaks.
  if (cycles < REP_CONSISTENCY_MIN_CYCLES) {
    const ys = frames
      .map((f) => midHip(f)?.y)
      .filter((y): y is number => y != null);
    if (ys.length >= 12) {
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      const range = maxY - minY;
      if (range > 0.05) {
        const threshold = minY + range * 0.35;
        let peaks = 0;
        let inPeak = false;
        for (const y of ys) {
          if (y <= threshold) {
            if (!inPeak) {
              peaks += 1;
              inPeak = true;
            }
          } else {
            inPeak = false;
          }
        }
        cycles = peaks;
      }
    }
  }

  if (cycles < REP_CONSISTENCY_MIN_CYCLES) {
    return unavailable(
      id,
      label,
      `Need ≥${REP_CONSISTENCY_MIN_CYCLES} detectable pull cycles (found ${cycles}). Single-rep clips do not invent rep consistency.`,
    );
  }

  // Compare mean hip-rise monotonicity across pull segments when multiple exist.
  if (pullPhases.length >= REP_CONSISTENCY_MIN_CYCLES) {
    const segmentScores: number[] = [];
    for (const phase of pullPhases) {
      const segFrames = frames.filter(
        (f) => f.index >= phase.startFrame && f.index <= phase.endFrame,
      );
      const ys = segFrames
        .map((f) => midHip(f)?.y)
        .filter((y): y is number => y != null);
      if (ys.length < 3) continue;
      let rising = 0;
      for (let i = 1; i < ys.length; i += 1) {
        if (ys[i] <= ys[i - 1] + 0.002) rising += 1;
      }
      segmentScores.push(rising / Math.max(ys.length - 1, 1));
    }
    if (segmentScores.length >= 2) {
      const spread = stddev(segmentScores);
      if (spread != null) {
        const score = scoreLowerIsBetter(spread, 0.05, 0.35);
        return observed(
          id,
          label,
          score,
          0.55,
          `Rep hip-rise pattern stddev=${spread.toFixed(3)} across ${segmentScores.length} pull segments.`,
          [],
        );
      }
    }
  }

  // Multiple cycles detected but not enough segmented pulls to compare finely.
  return observed(
    id,
    label,
    70,
    0.4,
    `Detected ${cycles} pull cycles; fine-grained inter-rep geometry comparison limited.`,
    [],
  );
}

export function evaluateDeadliftComponents(input: {
  frames: PoseFrame[];
  phases: MovementPhaseSegment[];
  metrics: ObservableMetric[];
  suitability: CameraSuitability;
}): DeadliftComponentResult[] {
  return [
    scoreSetupConsistency(input.frames, input.phases, input.suitability),
    scoreStartPosition(
      input.frames,
      input.phases,
      input.metrics,
      input.suitability,
    ),
    scoreBracingIndicators(input.suitability),
    scoreBarProximity(input.metrics, input.suitability),
    scoreHipRisePattern(input.frames, input.phases, input.suitability),
    scoreBackAngleConsistency(input.metrics, input.suitability),
    scoreLockout(input.metrics, input.suitability),
    scoreRepConsistency(input.frames, input.phases, input.suitability),
  ];
}
