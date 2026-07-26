import { LANDMARK_VISIBILITY_MIN } from "@/domain/movement/constants";
import type {
  ConfidenceLevel,
  LandmarkName,
  LandmarkPoint,
  PoseFrame,
} from "@/domain/movement/types";

export function getLandmark(
  frame: PoseFrame,
  name: LandmarkName,
): LandmarkPoint | null {
  const point = frame.landmarks.find((l) => l.name === name);
  if (!point) return null;
  if (point.visibility < LANDMARK_VISIBILITY_MIN) return null;
  if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) return null;
  return point;
}

export function midHip(frame: PoseFrame): { x: number; y: number; visibility: number } | null {
  const left = getLandmark(frame, "left_hip");
  const right = getLandmark(frame, "right_hip");
  if (left && right) {
    return {
      x: (left.x + right.x) / 2,
      y: (left.y + right.y) / 2,
      visibility: Math.min(left.visibility, right.visibility),
    };
  }
  if (left) return { x: left.x, y: left.y, visibility: left.visibility };
  if (right) return { x: right.x, y: right.y, visibility: right.visibility };
  return null;
}

export function midShoulder(
  frame: PoseFrame,
): { x: number; y: number; visibility: number } | null {
  const left = getLandmark(frame, "left_shoulder");
  const right = getLandmark(frame, "right_shoulder");
  if (left && right) {
    return {
      x: (left.x + right.x) / 2,
      y: (left.y + right.y) / 2,
      visibility: Math.min(left.visibility, right.visibility),
    };
  }
  if (left) return { x: left.x, y: left.y, visibility: left.visibility };
  if (right) return { x: right.x, y: right.y, visibility: right.visibility };
  return null;
}

export function midKnee(
  frame: PoseFrame,
): { x: number; y: number; visibility: number } | null {
  const left = getLandmark(frame, "left_knee");
  const right = getLandmark(frame, "right_knee");
  if (left && right) {
    return {
      x: (left.x + right.x) / 2,
      y: (left.y + right.y) / 2,
      visibility: Math.min(left.visibility, right.visibility),
    };
  }
  if (left) return { x: left.x, y: left.y, visibility: left.visibility };
  if (right) return { x: right.x, y: right.y, visibility: right.visibility };
  return null;
}

export function midWrist(
  frame: PoseFrame,
): { x: number; y: number; visibility: number } | null {
  const left = getLandmark(frame, "left_wrist");
  const right = getLandmark(frame, "right_wrist");
  if (left && right) {
    return {
      x: (left.x + right.x) / 2,
      y: (left.y + right.y) / 2,
      visibility: Math.min(left.visibility, right.visibility),
    };
  }
  if (left) return { x: left.x, y: left.y, visibility: left.visibility };
  if (right) return { x: right.x, y: right.y, visibility: right.visibility };
  return null;
}

/** Image-plane torso angle from vertical (degrees). 0 ≈ upright in the frame. */
export function torsoAngleFromVerticalDeg(frame: PoseFrame): number | null {
  const hip = midHip(frame);
  const shoulder = midShoulder(frame);
  if (!hip || !shoulder) return null;
  const dx = shoulder.x - hip.x;
  const dy = shoulder.y - hip.y;
  // Vertical in image coords points toward decreasing y.
  const angleRad = Math.atan2(dx, -dy);
  return (angleRad * 180) / Math.PI;
}

export function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function stddev(values: number[]): number | null {
  if (values.length < 2) return null;
  const m = mean(values);
  if (m == null) return null;
  const variance =
    values.reduce((acc, v) => acc + (v - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

export function confidenceFromScore(score: number): ConfidenceLevel {
  if (score < 0.15) return "none";
  if (score < 0.4) return "low";
  if (score < 0.7) return "medium";
  return "high";
}

export function blendConfidence(
  base: number,
  cameraLevel: ConfidenceLevel,
  limited: boolean,
): { score: number; level: ConfidenceLevel } {
  let score = clamp01(base);
  if (cameraLevel === "none") score = 0;
  else if (cameraLevel === "low") score *= 0.45;
  else if (cameraLevel === "medium") score *= 0.75;
  if (limited) score *= 0.35;
  return { score, level: confidenceFromScore(score) };
}
