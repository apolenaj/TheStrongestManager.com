"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { Badge, Button } from "@/design-system";
import {
  VIDEO_COMPARE_FRAME_STEP_SECONDS,
  VIDEO_COMPARE_SPEEDS,
  type VideoCompareSide,
  type VideoComparisonResult,
} from "@/domain/video-comparison";
import { VideoCompareMetricsPanel } from "@/components/video-comparison/VideoCompareMetricsPanel";
import { LandmarkOverlayCanvas } from "@/components/video-comparison/LandmarkOverlayCanvas";

function useSyncVideos(
  leftRef: RefObject<HTMLVideoElement | null>,
  rightRef: RefObject<HTMLVideoElement | null>,
) {
  const syncing = useRef(false);

  const applyBoth = useCallback(
    (fn: (video: HTMLVideoElement) => void) => {
      const left = leftRef.current;
      const right = rightRef.current;
      if (left) fn(left);
      if (right) fn(right);
    },
    [leftRef, rightRef],
  );

  const seekBoth = useCallback(
    (time: number) => {
      syncing.current = true;
      applyBoth((v) => {
        const max = Number.isFinite(v.duration) ? v.duration : time;
        v.currentTime = Math.max(0, Math.min(time, max || time));
      });
      syncing.current = false;
    },
    [applyBoth],
  );

  return { applyBoth, seekBoth, syncing };
}

function SidePane({
  side,
  videoRef,
  overlay,
  showLandmarks,
  muted,
}: {
  side: VideoCompareSide;
  videoRef: RefObject<HTMLVideoElement | null>;
  overlay: boolean;
  showLandmarks: boolean;
  muted: boolean;
}) {
  return (
    <div
      className={`relative min-w-0 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-black/50 ${
        overlay ? "absolute inset-0" : ""
      }`}
      style={overlay ? { opacity: side.label.startsWith("New") ? 0.55 : 1 } : undefined}
    >
      <div className="pointer-events-none absolute left-2 top-2 z-10 flex flex-wrap gap-1">
        <Badge variant="neutral">{side.label}</Badge>
        {side.overallScore != null ? (
          <Badge variant="accent">{Math.round(side.overallScore)}</Badge>
        ) : null}
      </div>
      {side.signedMediaPath ? (
        <div className="relative">
          <video
            ref={videoRef}
            playsInline
            muted={muted}
            preload="metadata"
            className="aspect-[9/16] max-h-[50vh] w-full object-contain sm:aspect-video sm:max-h-[42vh]"
            src={side.signedMediaPath}
          >
            Your browser cannot play this video.
          </video>
          <LandmarkOverlayCanvas
            videoRef={videoRef}
            frames={side.landmarkFrames}
            enabled={showLandmarks}
            phases={side.phases}
          />
        </div>
      ) : (
        <div className="flex aspect-video max-h-[42vh] items-center justify-center p-4 text-sm text-[var(--color-muted)]">
          No private video on file for this analysis.
        </div>
      )}
      <p className="truncate px-2 py-1 text-xs text-[var(--color-muted)]">
        {side.createdAtIso.slice(0, 10)}
        {side.cameraAngle ? ` · ${side.cameraAngle}` : ""}
        {side.exerciseName ? ` · ${side.exerciseName}` : ""}
      </p>
    </div>
  );
}

export function SideBySideComparePlayer({
  result,
}: {
  result: VideoComparisonResult;
}) {
  const leftRef = useRef<HTMLVideoElement>(null);
  const rightRef = useRef<HTMLVideoElement>(null);
  const { applyBoth, seekBoth } = useSyncVideos(leftRef, rightRef);

  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [overlay, setOverlay] = useState(false);
  const [showLandmarks, setShowLandmarks] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const left = leftRef.current;
    if (!left) return;
    const onTime = () => setCurrent(left.currentTime);
    const onMeta = () => {
      if (Number.isFinite(left.duration)) setDuration(left.duration);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    left.addEventListener("timeupdate", onTime);
    left.addEventListener("loadedmetadata", onMeta);
    left.addEventListener("play", onPlay);
    left.addEventListener("pause", onPause);
    return () => {
      left.removeEventListener("timeupdate", onTime);
      left.removeEventListener("loadedmetadata", onMeta);
      left.removeEventListener("play", onPlay);
      left.removeEventListener("pause", onPause);
    };
  }, [result.oldSide.signedMediaPath, result.newSide.signedMediaPath]);

  useEffect(() => {
    applyBoth((v) => {
      v.playbackRate = speed;
    });
  }, [speed, applyBoth]);

  // Keep right video roughly locked to left while playing
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      const left = leftRef.current;
      const right = rightRef.current;
      if (!left || !right) return;
      if (Math.abs(left.currentTime - right.currentTime) > 0.08) {
        right.currentTime = left.currentTime;
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [playing]);

  const togglePlay = () => {
    const left = leftRef.current;
    if (!left) return;
    if (left.paused) {
      applyBoth((v) => {
        v.playbackRate = speed;
        void v.play().catch(() => undefined);
      });
    } else {
      applyBoth((v) => v.pause());
    }
  };

  const step = (dir: -1 | 1) => {
    applyBoth((v) => v.pause());
    seekBoth(current + dir * VIDEO_COMPARE_FRAME_STEP_SECONDS);
    setCurrent((c) =>
      Math.max(0, c + dir * VIDEO_COMPARE_FRAME_STEP_SECONDS),
    );
  };

  const total = duration > 0 ? duration : 1;

  return (
    <div className="grid gap-4">
      {/* Videos: stacked on mobile, side-by-side from sm */}
      <div
        className={
          overlay
            ? "relative mx-auto w-full max-w-xl"
            : "grid gap-3 sm:grid-cols-2"
        }
      >
        {overlay ? (
          <div className="relative">
            <SidePane
              side={result.oldSide}
              videoRef={leftRef}
              overlay={false}
              showLandmarks={showLandmarks}
              muted={false}
            />
            <SidePane
              side={result.newSide}
              videoRef={rightRef}
              overlay
              showLandmarks={showLandmarks}
              muted
            />
          </div>
        ) : (
          <>
            <SidePane
              side={result.oldSide}
              videoRef={leftRef}
              overlay={false}
              showLandmarks={showLandmarks}
              muted={false}
            />
            <SidePane
              side={result.newSide}
              videoRef={rightRef}
              overlay={false}
              showLandmarks={showLandmarks}
              muted
            />
          </>
        )}
      </div>

      {/* Shared scrubber */}
      <div className="grid gap-2">
        <input
          type="range"
          min={0}
          max={total}
          step={VIDEO_COMPARE_FRAME_STEP_SECONDS}
          value={Math.min(current, total)}
          aria-label="Synchronized playback position"
          className="w-full accent-[var(--color-accent)]"
          onChange={(e) => {
            const t = Number(e.target.value);
            setCurrent(t);
            seekBoth(t);
          }}
        />
        <p className="text-center text-xs tabular-nums text-[var(--color-muted)]">
          {current.toFixed(2)}s / {duration > 0 ? duration.toFixed(2) : "—"}s
        </p>
      </div>

      {/* Sticky mobile-friendly transport */}
      <div className="sticky bottom-2 z-20 grid gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]/95 p-3 shadow-[var(--shadow-md)] backdrop-blur-sm sm:static sm:shadow-none">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button type="button" variant="secondary" onClick={() => step(-1)}>
            −Frame
          </Button>
          <Button type="button" variant="primary" onClick={togglePlay}>
            {playing ? "Pause" : "Play"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => step(1)}>
            +Frame
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-[var(--color-muted)]">Speed</span>
          {VIDEO_COMPARE_SPEEDS.map((s) => (
            <Button
              key={s}
              type="button"
              size="sm"
              variant={speed === s ? "primary" : "ghost"}
              className="!min-h-9 !px-2.5"
              onClick={() => setSpeed(s)}
            >
              {s}×
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
          <label className="flex min-h-11 cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={overlay}
              onChange={(e) => setOverlay(e.target.checked)}
              className="h-4 w-4 accent-[var(--color-accent)]"
            />
            Overlay
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={showLandmarks}
              onChange={(e) => setShowLandmarks(e.target.checked)}
              className="h-4 w-4 accent-[var(--color-accent)]"
            />
            Landmarks
          </label>
        </div>

        {showLandmarks && !result.landmarksAvailable ? (
          <p className="text-center text-xs text-[var(--color-subtle)]">
            Pose landmarks were not stored for these analyses — phase markers
            show when available; full skeleton overlay is unavailable.
          </p>
        ) : null}
      </div>

      {/* Phase jump chips */}
      {(result.oldSide.phases.length > 0 ||
        result.newSide.phases.length > 0) && (
        <div className="flex flex-wrap gap-2">
          <span className="w-full text-xs uppercase tracking-[0.12em] text-[var(--color-muted)] sm:w-auto sm:self-center">
            Jump to phase
          </span>
          {[...result.newSide.phases, ...result.oldSide.phases]
            .filter(
              (p, i, arr) =>
                arr.findIndex((x) => x.phase === p.phase) === i,
            )
            .map((phase) => (
              <Button
                key={phase.phase}
                type="button"
                variant="secondary"
                className="!px-2.5 !py-1 text-xs"
                onClick={() => {
                  applyBoth((v) => v.pause());
                  seekBoth(phase.startTimeSeconds);
                  setCurrent(phase.startTimeSeconds);
                }}
              >
                {phase.label}
              </Button>
            ))}
        </div>
      )}

      <VideoCompareMetricsPanel result={result} />
    </div>
  );
}
