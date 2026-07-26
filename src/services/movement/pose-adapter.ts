import type { PoseFrame } from "@/domain/movement/types";

/**
 * Modular pose-estimation adapter.
 * Swap MediaPipe / MoveNet / custom models without changing the pipeline.
 */
export type PoseAdapterId =
  | "unavailable"
  | "browser_mediapipe"
  | "client_landmarks"
  | "diagnostics_fixture";

export type PoseEstimationRequest = {
  /** Opaque video handle for adapters that read media directly. */
  video?: HTMLVideoElement;
  /** Target sample rate. */
  sampleHz?: number;
  signal?: AbortSignal;
};

export type PoseEstimationResult =
  | {
      ok: true;
      provider: PoseAdapterId;
      frames: PoseFrame[];
      notes: string[];
    }
  | {
      ok: false;
      provider: PoseAdapterId;
      error: string;
    };

export interface PoseEstimationAdapter {
  readonly id: PoseAdapterId;
  readonly label: string;
  estimate(request: PoseEstimationRequest): Promise<PoseEstimationResult>;
}

export function createUnavailablePoseAdapter(): PoseEstimationAdapter {
  return {
    id: "unavailable",
    label: "Pose estimator unavailable",
    async estimate() {
      return {
        ok: false,
        provider: "unavailable",
        error:
          "No pose-estimation backend is configured. Landmarks can still be submitted from a replaceable client adapter.",
      };
    },
  };
}
