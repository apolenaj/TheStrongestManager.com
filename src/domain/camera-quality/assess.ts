import { assessDeadliftCameraSuitability } from "@/domain/movement/camera-suitability";
import {
  CAMERA_QUALITY_CHECK_LABELS,
  CAMERA_QUALITY_EDGE_MARGIN,
  CAMERA_QUALITY_ENGINE_VERSION,
  CAMERA_QUALITY_GOOD_MIN,
  CAMERA_QUALITY_HONESTY,
  CAMERA_QUALITY_LUMA_BRIGHT_MIN,
  CAMERA_QUALITY_LUMA_DARK_MAX,
  CAMERA_QUALITY_MIN_EXTREMITY_COVERAGE,
  CAMERA_QUALITY_MIN_FPS,
  CAMERA_QUALITY_PREFERRED_ANGLES,
  CAMERA_QUALITY_WEIGHTS,
  DEFAULT_RECORDING_INSTRUCTIONS,
  type CameraQualityCheckId,
} from "@/domain/camera-quality/constants";
import type {
  CameraQualityCheck,
  CameraQualityResult,
  CameraQualitySignals,
  CameraQualityVerdict,
} from "@/domain/camera-quality/types";
import type { ConfidenceLevel } from "@/domain/scoring/types";
import type { PoseFrame } from "@/domain/movement/types";
import { getLandmark, midHip } from "@/domain/movement/geometry";
import { LANDMARK_VISIBILITY_MIN } from "@/domain/movement/constants";

/**
 * Assess whether a clip is ready for technique analysis.
 * Unknown checks are not invented as passes.
 */
export function assessCameraQuality(
  signals: CameraQualitySignals,
): CameraQualityResult {
  const usedPoseEvidence = Boolean(signals.pose && signals.pose.frameCount > 0);
  const checks: CameraQualityCheck[] = [
    checkCameraAngle(signals),
    checkSubjectVisibility(signals),
    checkLighting(signals),
    checkOcclusion(signals),
    checkFrameRate(signals),
    checkFullMovement(signals),
  ];

  const readinessScore = weightedScore(checks);
  const fails = checks.filter((c) => c.status === "fail");
  const verdict: CameraQualityVerdict =
    readinessScore != null &&
    readinessScore >= CAMERA_QUALITY_GOOD_MIN &&
    fails.length === 0
      ? "good_for_analysis"
      : "record_again";

  const reason = primaryReason(checks, verdict, readinessScore);
  const recordingInstructions = buildInstructions(checks, signals);

  return {
    engineVersion: CAMERA_QUALITY_ENGINE_VERSION,
    readinessScore,
    verdict,
    verdictLabel:
      verdict === "good_for_analysis"
        ? "GOOD FOR ANALYSIS"
        : "RECORD AGAIN",
    reason,
    checks,
    recordingInstructions,
    confidence: resultConfidence(checks, usedPoseEvidence),
    honesty: CAMERA_QUALITY_HONESTY,
    usedPoseEvidence,
  };
}

/**
 * Derive pose signals for camera quality from extracted frames.
 * Returns nulls when evidence is missing — never invents edge clipping.
 */
export function derivePoseQualitySignals(frames: PoseFrame[]): NonNullable<
  CameraQualitySignals["pose"]
> {
  if (frames.length === 0) {
    return {
      frameCount: 0,
      framesWithMidHip: 0,
      meanLandmarkVisibility: null,
      ankleCoverage: null,
      wristCoverage: null,
      anklesNearEdge: null,
      wristsNearEdge: null,
    };
  }

  let hipFrames = 0;
  let ankleFrames = 0;
  let wristFrames = 0;
  let anklesNearEdge = false;
  let wristsNearEdge = false;
  const vis: number[] = [];

  for (const frame of frames) {
    if (midHip(frame)) hipFrames += 1;
    const la = getLandmark(frame, "left_ankle");
    const ra = getLandmark(frame, "right_ankle");
    const lw = getLandmark(frame, "left_wrist");
    const rw = getLandmark(frame, "right_wrist");
    if (la || ra) ankleFrames += 1;
    if (lw || rw) wristFrames += 1;
    for (const p of [la, ra]) {
      if (p && nearEdge(p.x, p.y)) anklesNearEdge = true;
    }
    for (const p of [lw, rw]) {
      if (p && nearEdge(p.x, p.y)) wristsNearEdge = true;
    }
    for (const lm of frame.landmarks) {
      if (lm.visibility >= LANDMARK_VISIBILITY_MIN) vis.push(lm.visibility);
    }
  }

  return {
    frameCount: frames.length,
    framesWithMidHip: hipFrames,
    meanLandmarkVisibility:
      vis.length === 0
        ? null
        : vis.reduce((a, b) => a + b, 0) / vis.length,
    ankleCoverage: ankleFrames / frames.length,
    wristCoverage: wristFrames / frames.length,
    anklesNearEdge,
    wristsNearEdge,
  };
}

function nearEdge(x: number, y: number): boolean {
  const m = CAMERA_QUALITY_EDGE_MARGIN;
  return x < m || x > 1 - m || y < m || y > 1 - m;
}

function checkCameraAngle(signals: CameraQualitySignals): CameraQualityCheck {
  const id: CameraQualityCheckId = "camera_angle";
  const label = CAMERA_QUALITY_CHECK_LABELS[id];
  const angle = signals.declaredCameraAngle;
  if (!angle) {
    return {
      id,
      label,
      status: "fail",
      score: 20,
      detail: "Camera angle was not declared. Choose side or 45° before analysis.",
    };
  }

  const suitability = assessDeadliftCameraSuitability(angle);
  const preferred = (CAMERA_QUALITY_PREFERRED_ANGLES as readonly string[]).includes(
    angle,
  );

  if (!suitability.suitable) {
    return {
      id,
      label,
      status: "fail",
      score: 10,
      detail: suitability.message,
    };
  }
  if (preferred) {
    return {
      id,
      label,
      status: "pass",
      score: 100,
      detail: `Declared ${angle} view — preferred for sagittal technique analysis.`,
    };
  }
  return {
    id,
    label,
    status: "pass",
    score: 65,
    detail: `Declared ${angle} view is usable with reduced confidence for some metrics.`,
  };
}

function checkSubjectVisibility(
  signals: CameraQualitySignals,
): CameraQualityCheck {
  const id: CameraQualityCheckId = "subject_visibility";
  const label = CAMERA_QUALITY_CHECK_LABELS[id];
  const pose = signals.pose;
  if (!pose || pose.frameCount === 0) {
    return {
      id,
      label,
      status: "unknown",
      score: 55,
      detail:
        "Subject visibility not verified yet — confirm the full body stays in frame. Pose check runs before analysis.",
    };
  }

  const hipRatio = pose.framesWithMidHip / pose.frameCount;
  const meanVis = pose.meanLandmarkVisibility ?? 0;
  if (hipRatio < 0.5 || meanVis < 0.4) {
    return {
      id,
      label,
      status: "fail",
      score: 25,
      detail:
        "Subject landmarks are weakly visible across the clip. Re-record with the athlete fully in frame and clearly lit.",
    };
  }
  return {
    id,
    label,
    status: "pass",
    score: Math.round(40 + 60 * Math.min(1, meanVis)),
    detail: `Pose landmarks visible (mean visibility ${(meanVis * 100).toFixed(0)}%, hips in ${(hipRatio * 100).toFixed(0)}% of frames).`,
  };
}

function checkLighting(signals: CameraQualitySignals): CameraQualityCheck {
  const id: CameraQualityCheckId = "lighting";
  const label = CAMERA_QUALITY_CHECK_LABELS[id];
  if (signals.meanLuma == null) {
    return {
      id,
      label,
      status: "unknown",
      score: 55,
      detail:
        "Lighting not sampled from frames yet. Prefer even, bright light without strong backlight.",
    };
  }
  const luma = signals.meanLuma;
  if (luma < CAMERA_QUALITY_LUMA_DARK_MAX) {
    return {
      id,
      label,
      status: "fail",
      score: 20,
      detail: `Scene looks too dark (mean luma ${Math.round(luma)}/255). Add light facing the athlete.`,
    };
  }
  if (luma > CAMERA_QUALITY_LUMA_BRIGHT_MIN) {
    return {
      id,
      label,
      status: "fail",
      score: 30,
      detail: `Scene looks overexposed (mean luma ${Math.round(luma)}/255). Reduce glare or bright backlight.`,
    };
  }
  return {
    id,
    label,
    status: "pass",
    score: 90,
    detail: `Lighting sample looks usable (mean luma ${Math.round(luma)}/255).`,
  };
}

function checkOcclusion(signals: CameraQualitySignals): CameraQualityCheck {
  const id: CameraQualityCheckId = "occlusion";
  const label = CAMERA_QUALITY_CHECK_LABELS[id];
  const pose = signals.pose;
  if (!pose || pose.frameCount === 0) {
    return {
      id,
      label,
      status: "unknown",
      score: 55,
      detail:
        "Occlusion not measured yet. Keep rack posts, plates, and people from covering the athlete.",
    };
  }
  const meanVis = pose.meanLandmarkVisibility ?? 0;
  const wrist = pose.wristCoverage ?? 0;
  const ankle = pose.ankleCoverage ?? 0;
  if (meanVis < 0.45 || wrist < 0.25 || ankle < 0.25) {
    return {
      id,
      label,
      status: "fail",
      score: 30,
      detail:
        "Key landmarks are often missing — likely occlusion or framing. Clear the view of hips, wrists, and feet.",
    };
  }
  return {
    id,
    label,
    status: "pass",
    score: 85,
    detail: "Landmark coverage does not suggest heavy occlusion.",
  };
}

function checkFrameRate(signals: CameraQualitySignals): CameraQualityCheck {
  const id: CameraQualityCheckId = "frame_rate";
  const label = CAMERA_QUALITY_CHECK_LABELS[id];
  if (signals.estimatedFps == null) {
    // Resolution + duration still give a weak proxy
    if (
      signals.widthPx != null &&
      signals.heightPx != null &&
      signals.widthPx >= 640 &&
      signals.heightPx >= 360
    ) {
      return {
        id,
        label,
        status: "unknown",
        score: 60,
        detail: `FPS not measured. Resolution ${signals.widthPx}×${signals.heightPx} is acceptable — prefer ≥${CAMERA_QUALITY_MIN_FPS} fps.`,
      };
    }
    return {
      id,
      label,
      status: "unknown",
      score: 45,
      detail: `Frame rate not measured. Prefer ≥${CAMERA_QUALITY_MIN_FPS} fps for smoother pose sampling.`,
    };
  }
  if (signals.estimatedFps < CAMERA_QUALITY_MIN_FPS) {
    return {
      id,
      label,
      status: "fail",
      score: 35,
      detail: `Estimated ~${signals.estimatedFps.toFixed(0)} fps is below ${CAMERA_QUALITY_MIN_FPS} fps. Re-record at a higher frame rate.`,
    };
  }
  return {
    id,
    label,
    status: "pass",
    score: 95,
    detail: `Estimated ~${signals.estimatedFps.toFixed(0)} fps meets the ≥${CAMERA_QUALITY_MIN_FPS} fps guideline.`,
  };
}

function checkFullMovement(
  signals: CameraQualitySignals,
): CameraQualityCheck {
  const id: CameraQualityCheckId = "full_movement_visibility";
  const label = CAMERA_QUALITY_CHECK_LABELS[id];
  const pose = signals.pose;
  if (!pose || pose.frameCount === 0) {
    return {
      id,
      label,
      status: "unknown",
      score: 50,
      detail:
        "Full-movement framing not verified yet. Keep feet and barbell inside the frame for the whole lift.",
    };
  }

  const reasons: string[] = [];
  if (pose.anklesNearEdge === true) {
    reasons.push("feet");
  }
  if (pose.wristsNearEdge === true) {
    reasons.push("barbell (wrist/bar proxy)");
  }
  if (reasons.length > 0) {
    return {
      id,
      label,
      status: "fail",
      score: 15,
      detail: `${capitalizeList(reasons)} are partially outside the frame.`,
    };
  }

  const ankleOk =
    (pose.ankleCoverage ?? 0) >= CAMERA_QUALITY_MIN_EXTREMITY_COVERAGE;
  const wristOk =
    (pose.wristCoverage ?? 0) >= CAMERA_QUALITY_MIN_EXTREMITY_COVERAGE;
  if (!ankleOk || !wristOk) {
    return {
      id,
      label,
      status: "fail",
      score: 35,
      detail:
        "Feet and/or hands are not consistently visible — step back so the full movement stays in frame.",
    };
  }

  return {
    id,
    label,
    status: "pass",
    score: 95,
    detail:
      "Extremities stay inside the frame margins across sampled pose frames.",
  };
}

function weightedScore(checks: CameraQualityCheck[]): number | null {
  let sum = 0;
  let w = 0;
  for (const c of checks) {
    if (c.score == null) continue;
    const weight = CAMERA_QUALITY_WEIGHTS[c.id];
    sum += c.score * weight;
    w += weight;
  }
  if (w <= 0) return null;
  return Math.round(sum / w);
}

function primaryReason(
  checks: CameraQualityCheck[],
  verdict: CameraQualityVerdict,
  readinessScore: number | null,
): string {
  const fail = checks.find((c) => c.status === "fail");
  if (fail) return fail.detail;
  if (verdict === "good_for_analysis") {
    return `Readiness ${readinessScore ?? "—"}/100 — checks look good enough to run analysis.`;
  }
  const unknown = checks.filter((c) => c.status === "unknown");
  if (unknown.length > 0) {
    return `Readiness ${readinessScore ?? "—"}/100 — some checks are still unverified (${unknown.map((u) => u.label).join(", ")}). Re-record if unsure, or run pose check before analysis.`;
  }
  return `Readiness ${readinessScore ?? "—"}/100 — re-record for a clearer analysis.`;
}

function buildInstructions(
  checks: CameraQualityCheck[],
  signals: CameraQualitySignals,
): string[] {
  const out: string[] = [];
  const failIds = new Set(
    checks.filter((c) => c.status === "fail").map((c) => c.id),
  );

  if (failIds.has("camera_angle")) {
    out.push("Re-record from a clear side or 45° view — avoid overhead.");
  }
  if (failIds.has("full_movement_visibility")) {
    out.push(
      "Step the camera back so feet and the barbell stay fully inside the frame for the entire set.",
    );
  }
  if (failIds.has("lighting")) {
    out.push("Add even front/side light; avoid filming into a bright window.");
  }
  if (failIds.has("occlusion")) {
    out.push("Clear rack uprights, people, and plates from blocking the athlete.");
  }
  if (failIds.has("subject_visibility")) {
    out.push("Keep the full body in focus and in frame; avoid tight crops.");
  }
  if (failIds.has("frame_rate")) {
    out.push(`Set the camera to at least ${CAMERA_QUALITY_MIN_FPS} fps.`);
  }

  if (out.length === 0) {
    return [...DEFAULT_RECORDING_INSTRUCTIONS];
  }

  // Always append a general tip
  if (
    signals.declaredCameraAngle !== "side" &&
    signals.declaredCameraAngle !== "forty_five"
  ) {
    out.push("Side view is the most reliable angle for deadlift technique metrics.");
  }
  return out;
}

function resultConfidence(
  checks: CameraQualityCheck[],
  usedPose: boolean,
): ConfidenceLevel {
  const unknown = checks.filter((c) => c.status === "unknown").length;
  if (!usedPose && unknown >= 3) return "low";
  if (unknown >= 2) return "low";
  if (usedPose && unknown === 0) return "medium";
  return "medium";
}

function capitalizeList(parts: string[]): string {
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  }
  if (parts.length === 2) {
    return `${parts[0].charAt(0).toUpperCase()}${parts[0].slice(1)} and ${parts[1]}`;
  }
  return parts.join(", ");
}
