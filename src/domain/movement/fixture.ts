import { FIXTURE_SAMPLE_HZ } from "@/domain/movement/constants";
import type { LandmarkName, PoseFrame } from "@/domain/movement/types";

/**
 * Deterministic deadlift-like landmark trajectory for developer diagnostics.
 * Clearly labeled fixture — must never be presented as athlete video analysis
 * without the diagnostics.fixture flag.
 */
export function buildDeadliftFixtureFrames(
  durationSeconds = 3,
  hz = FIXTURE_SAMPLE_HZ,
): PoseFrame[] {
  const frames: PoseFrame[] = [];
  const count = Math.max(8, Math.round(durationSeconds * hz));

  for (let i = 0; i < count; i += 1) {
    const t = i / Math.max(count - 1, 1);
    // Hip rises (y decreases) through mid lift, holds, then descends slightly.
    let hipY: number;
    if (t < 0.2) hipY = 0.72;
    else if (t < 0.55) hipY = 0.72 - (t - 0.2) * (0.32 / 0.35);
    else if (t < 0.75) hipY = 0.4;
    else hipY = 0.4 + (t - 0.75) * (0.2 / 0.25);

    const shoulderY = hipY - 0.22;
    // Knees stay relatively fixed in the image (side-view conventional).
    const kneeY = 0.68;
    const ankleY = 0.92;
    // Wrists track the bar: start near the floor, rise through the knee, finish near the hip.
    let wristY: number;
    if (t < 0.2) wristY = 0.9;
    else if (t < 0.55) wristY = 0.9 - (t - 0.2) * (0.45 / 0.35);
    else if (t < 0.75) wristY = 0.45;
    else wristY = 0.45 + (t - 0.75) * (0.08 / 0.25);
    const sway = Math.sin(t * Math.PI) * 0.01;

    const mk = (
      name: LandmarkName,
      x: number,
      y: number,
      visibility = 0.9,
    ) => ({ name, x, y, visibility });

    frames.push({
      index: i,
      timeSeconds: (i / hz) * 1,
      landmarks: [
        mk("nose", 0.5 + sway, shoulderY - 0.12),
        mk("left_shoulder", 0.46 + sway, shoulderY),
        mk("right_shoulder", 0.54 + sway, shoulderY),
        mk("left_hip", 0.47, hipY),
        mk("right_hip", 0.53, hipY),
        mk("left_knee", 0.47, kneeY),
        mk("right_knee", 0.53, kneeY),
        mk("left_ankle", 0.47, ankleY),
        mk("right_ankle", 0.53, ankleY),
        mk("left_wrist", 0.42, wristY),
        mk("right_wrist", 0.58, wristY),
      ],
    });
  }

  return frames;
}
