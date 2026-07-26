import type { CameraAngleId } from "@/domain/technique/constants";
import type { CameraSuitability, ConfidenceLevel } from "@/domain/movement/types";

const DEADLIFT_LIMITED_BY_ANGLE: Record<
  CameraAngleId,
  { suitable: boolean; level: ConfidenceLevel; message: string; limited: string[] }
> = {
  side: {
    suitable: true,
    level: "high",
    message:
      "Side view supports image-plane torso angle, hip–shoulder relationship, and lockout height observations.",
    limited: ["left_right_hip_symmetry"],
  },
  forty_five: {
    suitable: true,
    level: "medium",
    message:
      "45° view is usable but foreshortens sagittal angles — confidence is reduced for torso and hip–shoulder metrics.",
    limited: ["left_right_hip_symmetry", "torso_angle_consistency_deg"],
  },
  front: {
    suitable: true,
    level: "medium",
    message:
      "Front view supports left/right symmetry checks. Sagittal torso angle and true hip–shoulder depth relationship are limited.",
    limited: [
      "torso_angle_consistency_deg",
      "shoulder_hip_horizontal_offset",
      "approx_hip_y_pull_mean",
    ],
  },
  rear: {
    suitable: true,
    level: "medium",
    message:
      "Rear view supports symmetry when hips/shoulders are visible. Sagittal back-angle proxies are limited.",
    limited: [
      "torso_angle_consistency_deg",
      "shoulder_hip_horizontal_offset",
      "wrist_hip_vertical_proxy",
    ],
  },
  overhead: {
    suitable: false,
    level: "none",
    message:
      "Overhead camera angle is unsuitable for deadlift sagittal observations (hip–shoulder relationship, torso angle, lockout height). Re-record from the side or 45°.",
    limited: [
      "approx_hip_y_pull_mean",
      "shoulder_hip_horizontal_offset",
      "shoulder_hip_vertical_relation",
      "torso_angle_consistency_deg",
      "lockout_hip_shoulder_dy",
      "wrist_hip_vertical_proxy",
      "left_right_hip_symmetry",
    ],
  },
  other: {
    suitable: false,
    level: "low",
    message:
      "Camera angle “other” is not validated for deadlift movement metrics. Prefer a clear side view.",
    limited: [
      "torso_angle_consistency_deg",
      "shoulder_hip_horizontal_offset",
      "left_right_hip_symmetry",
    ],
  },
};

export function assessDeadliftCameraSuitability(
  angle: string | null | undefined,
): CameraSuitability {
  if (!angle || !(angle in DEADLIFT_LIMITED_BY_ANGLE)) {
    return {
      suitable: false,
      level: "none",
      angle: "unknown",
      message:
        "Camera angle was not set. Choose a side or 45° view before relying on movement metrics.",
      limitedMetricKeys: Object.keys(DEADLIFT_LIMITED_BY_ANGLE.overhead.limited),
    };
  }

  const id = angle as CameraAngleId;
  const row = DEADLIFT_LIMITED_BY_ANGLE[id];
  return {
    suitable: row.suitable,
    level: row.level,
    angle: id,
    message: row.message,
    limitedMetricKeys: row.limited,
  };
}
