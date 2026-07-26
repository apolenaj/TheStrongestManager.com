import { describe, expect, it } from "vitest";
import {
  assessCameraQuality,
  derivePoseQualitySignals,
  CAMERA_QUALITY_ENGINE_VERSION,
} from "@/domain/camera-quality";
import type { PoseFrame } from "@/domain/movement/types";

function frame(
  index: number,
  opts: {
    hipY?: number;
    ankleX?: number;
    wristX?: number;
    visibility?: number;
  } = {},
): PoseFrame {
  const v = opts.visibility ?? 0.9;
  const hipY = opts.hipY ?? 0.6;
  const ankleX = opts.ankleX ?? 0.5;
  const wristX = opts.wristX ?? 0.5;
  return {
    index,
    timeSeconds: index * 0.1,
    landmarks: [
      { name: "left_hip", x: 0.48, y: hipY, visibility: v },
      { name: "right_hip", x: 0.52, y: hipY, visibility: v },
      { name: "left_ankle", x: ankleX, y: 0.92, visibility: v },
      { name: "right_ankle", x: ankleX + 0.04, y: 0.92, visibility: v },
      { name: "left_wrist", x: wristX, y: 0.7, visibility: v },
      { name: "right_wrist", x: wristX + 0.04, y: 0.7, visibility: v },
      { name: "left_shoulder", x: 0.46, y: 0.35, visibility: v },
      { name: "right_shoulder", x: 0.54, y: 0.35, visibility: v },
    ],
  };
}

describe("Camera Quality Validation", () => {
  it("exports engine version", () => {
    expect(CAMERA_QUALITY_ENGINE_VERSION).toBe("camera_quality.v1");
  });

  it("returns GOOD FOR ANALYSIS for side view with solid pose evidence", () => {
    const frames = Array.from({ length: 20 }, (_, i) => frame(i));
    const pose = derivePoseQualitySignals(frames);
    const result = assessCameraQuality({
      exerciseSlug: "deadlift",
      declaredCameraAngle: "side",
      widthPx: 1280,
      heightPx: 720,
      durationSeconds: 4,
      estimatedFps: 30,
      meanLuma: 120,
      pose,
    });
    expect(result.verdict).toBe("good_for_analysis");
    expect(result.verdictLabel).toBe("GOOD FOR ANALYSIS");
    expect(result.readinessScore).toBeGreaterThanOrEqual(70);
    expect(result.checks.every((c) => c.status !== "fail")).toBe(true);
  });

  it("returns RECORD AGAIN for overhead angle", () => {
    const result = assessCameraQuality({
      exerciseSlug: "deadlift",
      declaredCameraAngle: "overhead",
      widthPx: 1280,
      heightPx: 720,
      durationSeconds: 4,
      estimatedFps: 30,
      meanLuma: 120,
      pose: null,
    });
    expect(result.verdict).toBe("record_again");
    expect(result.verdictLabel).toBe("RECORD AGAIN");
    expect(result.reason).toMatch(/overhead|unsuitable|side/i);
    expect(result.recordingInstructions.length).toBeGreaterThan(0);
  });

  it("flags feet and barbell partially outside the frame", () => {
    const frames = Array.from({ length: 16 }, (_, i) =>
      frame(i, { ankleX: 0.01, wristX: 0.99 }),
    );
    const pose = derivePoseQualitySignals(frames);
    expect(pose.anklesNearEdge).toBe(true);
    expect(pose.wristsNearEdge).toBe(true);

    const result = assessCameraQuality({
      exerciseSlug: "deadlift",
      declaredCameraAngle: "side",
      widthPx: 1280,
      heightPx: 720,
      durationSeconds: 3,
      estimatedFps: 30,
      meanLuma: 110,
      pose,
    });
    expect(result.verdict).toBe("record_again");
    expect(result.reason).toMatch(/feet/i);
    expect(result.reason).toMatch(/barbell|outside the frame/i);
    expect(
      result.recordingInstructions.some((i) => /frame/i.test(i)),
    ).toBe(true);
  });

  it("fails dark lighting when luma is sampled", () => {
    const result = assessCameraQuality({
      exerciseSlug: "deadlift",
      declaredCameraAngle: "side",
      widthPx: 1280,
      heightPx: 720,
      durationSeconds: 3,
      estimatedFps: 30,
      meanLuma: 20,
      pose: null,
    });
    expect(result.verdict).toBe("record_again");
    expect(
      result.checks.find((c) => c.id === "lighting")?.status,
    ).toBe("fail");
  });

  it("does not invent pose framing without landmarks", () => {
    const result = assessCameraQuality({
      exerciseSlug: "deadlift",
      declaredCameraAngle: "side",
      widthPx: 1280,
      heightPx: 720,
      durationSeconds: 3,
      estimatedFps: null,
      meanLuma: 100,
      pose: null,
    });
    expect(
      result.checks.find((c) => c.id === "full_movement_visibility")?.status,
    ).toBe("unknown");
    expect(result.usedPoseEvidence).toBe(false);
  });
});
