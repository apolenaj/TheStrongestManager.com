"use client";

import { useEffect, useRef, type RefObject } from "react";
import type { VideoCompareLandmarkFrame } from "@/domain/video-comparison";
import type { VideoCompareSide } from "@/domain/video-comparison";

const SKELETON_EDGES: Array<[string, string]> = [
  ["left_shoulder", "right_shoulder"],
  ["left_shoulder", "left_hip"],
  ["right_shoulder", "right_hip"],
  ["left_hip", "right_hip"],
  ["left_hip", "left_knee"],
  ["right_hip", "right_knee"],
  ["left_knee", "left_ankle"],
  ["right_knee", "right_ankle"],
  ["left_shoulder", "left_wrist"],
  ["right_shoulder", "right_wrist"],
];

/**
 * Draws stored pose landmarks when available; otherwise phase time ticks.
 */
export function LandmarkOverlayCanvas({
  videoRef,
  frames,
  phases,
  enabled,
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
  frames: VideoCompareLandmarkFrame[];
  phases: VideoCompareSide["phases"];
  enabled: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    let raf = 0;
    const draw = () => {
      const w = video.clientWidth;
      const h = video.clientHeight;
      if (w > 0 && h > 0) {
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
        }
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, w, h);
          const t = video.currentTime;

          if (frames.length > 0) {
            let best = frames[0];
            let bestDist = Math.abs(best.timeSeconds - t);
            for (const f of frames) {
              const d = Math.abs(f.timeSeconds - t);
              if (d < bestDist) {
                best = f;
                bestDist = d;
              }
            }
            if (bestDist < 0.2) {
              const byName = new Map(
                best.points.map((p) => [p.name, p] as const),
              );
              ctx.strokeStyle = "rgba(250, 204, 21, 0.85)";
              ctx.fillStyle = "rgba(250, 204, 21, 0.95)";
              ctx.lineWidth = 2;
              for (const [a, b] of SKELETON_EDGES) {
                const pa = byName.get(a);
                const pb = byName.get(b);
                if (!pa || !pb) continue;
                if (pa.visibility < 0.35 || pb.visibility < 0.35) continue;
                ctx.beginPath();
                ctx.moveTo(pa.x * w, pa.y * h);
                ctx.lineTo(pb.x * w, pb.y * h);
                ctx.stroke();
              }
              for (const p of best.points) {
                if (p.visibility < 0.35) continue;
                ctx.beginPath();
                ctx.arc(p.x * w, p.y * h, 3, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          } else if (phases.length > 0) {
            // Honest fallback: phase band indicators, not invented landmarks
            for (const phase of phases) {
              if (t >= phase.startTimeSeconds && t <= phase.endTimeSeconds) {
                ctx.fillStyle = "rgba(56, 189, 248, 0.12)";
                ctx.fillRect(0, 0, w, h);
                ctx.fillStyle = "rgba(56, 189, 248, 0.95)";
                ctx.font = "12px system-ui, sans-serif";
                ctx.fillText(phase.label, 8, 20);
                break;
              }
            }
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [enabled, frames, phases, videoRef]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}
