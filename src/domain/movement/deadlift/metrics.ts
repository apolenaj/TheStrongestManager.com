import type { CameraSuitability } from "@/domain/movement/types";
import { DEADLIFT_PULL_SCOPE_PHASES } from "@/domain/movement/phases/constants";
import {
  blendConfidence,
  getLandmark,
  mean,
  midHip,
  midShoulder,
  stddev,
  torsoAngleFromVerticalDeg,
} from "@/domain/movement/geometry";
import type {
  MovementPhaseSegment,
  ObservableMetric,
  PoseFrame,
} from "@/domain/movement/types";

const PULL_IDS = [...DEADLIFT_PULL_SCOPE_PHASES];

function framesInPhases(
  frames: PoseFrame[],
  phases: MovementPhaseSegment[],
  ids: Array<MovementPhaseSegment["phase"]>,
): PoseFrame[] {
  const ranges = phases.filter((p) => ids.includes(p.phase));
  if (ranges.length === 0) return frames;
  return frames.filter((frame) =>
    ranges.some(
      (r) => frame.index >= r.startFrame && frame.index <= r.endFrame,
    ),
  );
}

function limited(
  suitability: CameraSuitability,
  key: string,
): boolean {
  return suitability.limitedMetricKeys.includes(key);
}

/**
 * Observable deadlift metrics from 2D landmarks.
 * Values are image-plane only; each includes confidence.
 */
export function computeDeadliftMetrics(
  frames: PoseFrame[],
  phases: MovementPhaseSegment[],
  suitability: CameraSuitability,
): ObservableMetric[] {
  const pullFrames = framesInPhases(frames, phases, PULL_IDS);
  const lockoutFrames = framesInPhases(frames, phases, ["lockout"]);
  const metrics: ObservableMetric[] = [];

  const hipYs = pullFrames
    .map((f) => midHip(f)?.y)
    .filter((y): y is number => y != null);
  {
    const key = "approx_hip_y_pull_mean";
    const value = mean(hipYs);
    const conf = blendConfidence(
      hipYs.length >= 3 ? 0.75 : hipYs.length > 0 ? 0.4 : 0,
      suitability.level,
      limited(suitability, key),
    );
    metrics.push({
      key,
      label: "Approximate hip height (pull mean)",
      value: value == null ? null : Math.round(value * 1000) / 1000,
      unit: "norm_y",
      confidence: conf.level,
      confidenceScore: conf.score,
      basis: "Mean mid-hip y during pull phases (image coords, 0=top).",
      caveats: [
        "Not a real-world height in meters.",
        "Depends on framing and camera tilt.",
      ],
      phase: "initial_pull",
    });
  }

  const horiz: number[] = [];
  const vert: number[] = [];
  for (const frame of pullFrames) {
    const hip = midHip(frame);
    const shoulder = midShoulder(frame);
    if (!hip || !shoulder) continue;
    horiz.push(Math.abs(shoulder.x - hip.x));
    vert.push(hip.y - shoulder.y);
  }
  {
    const key = "shoulder_hip_horizontal_offset";
    const value = mean(horiz);
    const conf = blendConfidence(
      horiz.length >= 3 ? 0.7 : 0,
      suitability.level,
      limited(suitability, key),
    );
    metrics.push({
      key,
      label: "Shoulder–hip horizontal offset",
      value: value == null ? null : Math.round(value * 1000) / 1000,
      unit: "norm_x",
      confidence: conf.level,
      confidenceScore: conf.score,
      basis:
        "Mean |mid-shoulder.x − mid-hip.x| during pull phases (image plane).",
      caveats: ["Not a 3D torso lean angle.", "Side view preferred."],
      phase: "initial_pull",
    });
  }
  {
    const key = "shoulder_hip_vertical_relation";
    const value = mean(vert);
    const conf = blendConfidence(
      vert.length >= 3 ? 0.7 : 0,
      suitability.level,
      limited(suitability, key),
    );
    metrics.push({
      key,
      label: "Shoulder–hip vertical relationship",
      value: value == null ? null : Math.round(value * 1000) / 1000,
      unit: "norm_y",
      confidence: conf.level,
      confidenceScore: conf.score,
      basis:
        "Mean (hip.y − shoulder.y) during pull phases. Positive ⇒ hip lower in frame.",
      caveats: ["Image-plane only — not hip/shoulder joint depth."],
      phase: "initial_pull",
    });
  }

  const angles = pullFrames
    .map((f) => torsoAngleFromVerticalDeg(f))
    .filter((a): a is number => a != null);
  {
    const key = "torso_angle_consistency_deg";
    const value = stddev(angles);
    const conf = blendConfidence(
      angles.length >= 5 ? 0.65 : angles.length >= 2 ? 0.35 : 0,
      suitability.level,
      limited(suitability, key),
    );
    metrics.push({
      key,
      label: "Torso angle consistency",
      value: value == null ? null : Math.round(value * 10) / 10,
      unit: "deg_stddev",
      confidence: conf.level,
      confidenceScore: conf.score,
      basis:
        "Sample stddev of image-plane shoulder–hip angle from vertical during pull phases.",
      caveats: [
        "Consistency ≠ safety or “good technique”.",
        "Not spine loading or injury risk.",
      ],
      phase: "initial_pull",
    });
  }

  const lockoutDy = lockoutFrames
    .map((f) => {
      const hip = midHip(f);
      const shoulder = midShoulder(f);
      if (!hip || !shoulder) return null;
      return Math.abs(hip.y - shoulder.y);
    })
    .filter((v): v is number => v != null);
  {
    const key = "lockout_hip_shoulder_dy";
    const value = mean(lockoutDy);
    const conf = blendConfidence(
      lockoutDy.length >= 2 ? 0.7 : 0,
      suitability.level,
      limited(suitability, key),
    );
    metrics.push({
      key,
      label: "Lockout hip–shoulder alignment",
      value: value == null ? null : Math.round(value * 1000) / 1000,
      unit: "norm_y",
      confidence: conf.level,
      confidenceScore: conf.score,
      basis: "Mean |hip.y − shoulder.y| in lockout region (closer to 0 ≈ more stacked in frame).",
      caveats: ["Does not prove hip/knee/shoulder extension completeness."],
      phase: "lockout",
    });
  }

  const symmetryFrames = framesInPhases(frames, phases, [
    ...PULL_IDS,
    "lockout",
  ]);
  const symmetry: number[] = [];
  for (const frame of symmetryFrames) {
    const lh = getLandmark(frame, "left_hip");
    const rh = getLandmark(frame, "right_hip");
    const ls = getLandmark(frame, "left_shoulder");
    const rs = getLandmark(frame, "right_shoulder");
    if (!lh || !rh || !ls || !rs) continue;
    const midX = (ls.x + rs.x) / 2;
    symmetry.push(Math.abs(Math.abs(lh.x - midX) - Math.abs(rh.x - midX)));
  }
  {
    const key = "left_right_hip_symmetry";
    const value = mean(symmetry);
    const conf = blendConfidence(
      symmetry.length >= 3 ? 0.65 : 0,
      suitability.level,
      limited(suitability, key),
    );
    metrics.push({
      key,
      label: "Left/right hip symmetry (camera-dependent)",
      value: value == null ? null : Math.round(value * 1000) / 1000,
      unit: "norm_x",
      confidence: conf.level,
      confidenceScore: conf.score,
      basis: "Mean absolute difference of hip distances from shoulder midline.",
      caveats: [
        "Only meaningful on front/rear views.",
        "Lens distortion and stance width affect this heavily.",
      ],
      phase: "initial_pull",
    });
  }

  const wristProxy: number[] = [];
  for (const frame of pullFrames) {
    const hip = midHip(frame);
    const lw = getLandmark(frame, "left_wrist");
    const rw = getLandmark(frame, "right_wrist");
    if (!hip) continue;
    const wrists = [lw, rw].filter((w): w is NonNullable<typeof w> => w != null);
    if (wrists.length === 0) continue;
    const wy =
      wrists.reduce((acc, w) => acc + w.y, 0) / wrists.length;
    wristProxy.push(wy - hip.y);
  }
  {
    const key = "wrist_hip_vertical_proxy";
    const value = mean(wristProxy);
    const conf = blendConfidence(
      wristProxy.length >= 3 ? 0.55 : 0,
      suitability.level,
      limited(suitability, key),
    );
    metrics.push({
      key,
      label: "Wrist–hip vertical proxy (bar/body where observable)",
      value: value == null ? null : Math.round(value * 1000) / 1000,
      unit: "norm_y",
      confidence: conf.level,
      confidenceScore: conf.score,
      basis:
        "Mean (wrist.y − hip.y) during pull phases. Proxy when wrists track the implement.",
      caveats: [
        "Not true bar-path tracking — wrists ≠ bar.",
        "Occlusion and grip width reduce reliability.",
      ],
      phase: "initial_pull",
    });
  }

  return metrics;
}
