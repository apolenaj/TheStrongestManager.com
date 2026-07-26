"use client";

/**
 * Browser MediaPipe Pose Landmarker adapter (replaceable).
 * Loads WASM + model from Google's CDN. Fails honestly if unavailable.
 */

import type {
  PoseEstimationAdapter,
  PoseEstimationResult,
} from "@/services/movement/pose-adapter";
import type { LandmarkName, PoseFrame } from "@/domain/movement/types";

/** MediaPipe Pose Landmarker indices → canonical names (subset). */
const MP_INDEX_TO_NAME: Partial<Record<number, LandmarkName>> = {
  0: "nose",
  11: "left_shoulder",
  12: "right_shoulder",
  13: undefined, // elbow unused
  15: "left_wrist",
  16: "right_wrist",
  23: "left_hip",
  24: "right_hip",
  25: "left_knee",
  26: "right_knee",
  27: "left_ankle",
  28: "right_ankle",
};

type PoseLandmarkerLike = {
  detectForVideo: (
    video: HTMLVideoElement,
    timestampMs: number,
  ) => { landmarks?: Array<Array<{ x: number; y: number; visibility?: number }>> };
  close?: () => void;
};

let landmarkerPromise: Promise<PoseLandmarkerLike | null> | null = null;

async function loadPoseLandmarker(): Promise<PoseLandmarkerLike | null> {
  if (typeof window === "undefined") return null;
  try {
    const vision = await import("@mediapipe/tasks-vision");
    const fileset = await vision.FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm",
    );
    const landmarker = await vision.PoseLandmarker.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numPoses: 1,
    });
    return landmarker as PoseLandmarkerLike;
  } catch {
    return null;
  }
}

function getLandmarker(): Promise<PoseLandmarkerLike | null> {
  if (!landmarkerPromise) {
    landmarkerPromise = loadPoseLandmarker();
  }
  return landmarkerPromise;
}

function mapLandmarks(
  raw: Array<{ x: number; y: number; visibility?: number }>,
): PoseFrame["landmarks"] {
  const out: PoseFrame["landmarks"] = [];
  for (const [indexStr, name] of Object.entries(MP_INDEX_TO_NAME)) {
    if (!name) continue;
    const index = Number(indexStr);
    const point = raw[index];
    if (!point) continue;
    out.push({
      name,
      x: point.x,
      y: point.y,
      visibility: point.visibility ?? 0.5,
    });
  }
  return out;
}

export function createBrowserMediaPipeAdapter(): PoseEstimationAdapter {
  return {
    id: "browser_mediapipe",
    label: "MediaPipe Pose Landmarker (browser)",
    async estimate(request): Promise<PoseEstimationResult> {
      const video = request.video;
      if (!video) {
        return {
          ok: false,
          provider: "browser_mediapipe",
          error: "Video element required for browser pose estimation.",
        };
      }

      const landmarker = await getLandmarker();
      if (!landmarker) {
        return {
          ok: false,
          provider: "browser_mediapipe",
          error:
            "MediaPipe Pose Landmarker failed to load. Check network access to the model CDN, or submit landmarks from another adapter.",
        };
      }

      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      if (duration <= 0) {
        return {
          ok: false,
          provider: "browser_mediapipe",
          error: "Video duration unavailable.",
        };
      }

      const hz = request.sampleHz ?? 8;
      const frames: PoseFrame[] = [];
      const step = 1 / hz;
      let index = 0;

      for (let t = 0; t < duration; t += step) {
        if (request.signal?.aborted) {
          return {
            ok: false,
            provider: "browser_mediapipe",
            error: "Pose estimation cancelled.",
          };
        }
        video.currentTime = Math.min(t, duration - 0.001);
        await new Promise<void>((resolve, reject) => {
          const onSeeked = () => {
            video.removeEventListener("seeked", onSeeked);
            resolve();
          };
          const onError = () => {
            video.removeEventListener("error", onError);
            reject(new Error("Video seek failed."));
          };
          video.addEventListener("seeked", onSeeked, { once: true });
          video.addEventListener("error", onError, { once: true });
        });

        const result = landmarker.detectForVideo(video, t * 1000);
        const pose = result.landmarks?.[0];
        if (!pose) continue;
        frames.push({
          index,
          timeSeconds: t,
          landmarks: mapLandmarks(pose),
        });
        index += 1;
        if (frames.length >= 600) break;
      }

      if (frames.length === 0) {
        return {
          ok: false,
          provider: "browser_mediapipe",
          error: "No poses detected in sampled frames.",
        };
      }

      return {
        ok: true,
        provider: "browser_mediapipe",
        frames,
        notes: [
          `Sampled ~${hz} Hz`,
          "Landmarks are 2D image-plane estimates from MediaPipe lite.",
        ],
      };
    },
  };
}
