"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, ProgressBar } from "@/design-system";
import { createBrowserMediaPipeAdapter } from "@/services/movement/browser-mediapipe-adapter";
import {
  assessCameraQuality,
  derivePoseQualitySignals,
  type CameraQualityResult,
} from "@/domain/camera-quality";
import { sampleVideoQualityFromUrl } from "@/lib/camera-quality-sample";
import { CameraQualityPanel } from "@/components/technique/CameraQualityPanel";
import type { PoseFrame } from "@/domain/movement/types";

export function MovementAnalysisRunner({
  analysisId,
  signedMediaPath,
  exerciseSlug,
  cameraAngle,
  canRunFixture,
}: {
  analysisId: string;
  signedMediaPath: string | null;
  exerciseSlug: string | null;
  cameraAngle: string | null;
  canRunFixture: boolean;
}) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [quality, setQuality] = useState<CameraQualityResult | null>(null);
  const [pendingFrames, setPendingFrames] = useState<PoseFrame[] | null>(null);

  const isDeadlift = exerciseSlug === "deadlift";

  async function submitFrames(
    frames: unknown[],
    poseProvider: string,
    useFixture = false,
  ) {
    const response = await fetch(
      `/api/technique/analyses/${analysisId}/movement`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frames: useFixture ? undefined : frames,
          poseProvider,
          useFixture,
        }),
      },
    );
    const json = (await response.json()) as {
      ok?: boolean;
      error?: string;
      overallTechniqueScore?: number | null;
    };
    if (!response.ok || !json.ok) {
      throw new Error(json.error ?? "Movement analysis failed.");
    }
    if (
      json.overallTechniqueScore != null &&
      (json.overallTechniqueScore < 0 || json.overallTechniqueScore > 100)
    ) {
      throw new Error("Honesty violation: Technique Score out of range.");
    }
  }

  async function finishAnalysis(frames: PoseFrame[]) {
    setPending(true);
    setProgress(85);
    try {
      await submitFrames(frames, "browser_mediapipe");
      setProgress(100);
      setPendingFrames(null);
      setQuality(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Movement analysis failed.");
      setProgress(null);
    } finally {
      setPending(false);
    }
  }

  async function runMediaPipe() {
    setError(null);
    setNote(null);
    setQuality(null);
    setPendingFrames(null);
    if (!signedMediaPath || !videoRef.current) {
      setError("Private video is required to extract poses.");
      return;
    }
    setPending(true);
    setProgress(5);
    try {
      const video = videoRef.current;
      if (video.readyState < 1) {
        await new Promise<void>((resolve, reject) => {
          video.onloadedmetadata = () => resolve();
          video.onerror = () => reject(new Error("Could not load video."));
        });
      }

      let meanLuma: number | null = null;
      let estimatedFps: number | null = null;
      try {
        const sample = await sampleVideoQualityFromUrl(signedMediaPath);
        meanLuma = sample.meanLuma;
        estimatedFps = sample.estimatedFps;
      } catch {
        // Lighting sample optional
      }

      setProgress(15);
      const adapter = createBrowserMediaPipeAdapter();
      const result = await adapter.estimate({
        video,
        sampleHz: 6,
      });
      setProgress(70);
      if (!result.ok) {
        throw new Error(result.error);
      }
      setNote(result.notes.join(" · "));

      const frames = result.frames as PoseFrame[];
      const poseSignals = derivePoseQualitySignals(frames);
      const readiness = assessCameraQuality({
        exerciseSlug,
        declaredCameraAngle: cameraAngle,
        widthPx: video.videoWidth || null,
        heightPx: video.videoHeight || null,
        durationSeconds: Number.isFinite(video.duration) ? video.duration : null,
        estimatedFps,
        meanLuma,
        pose: poseSignals,
      });
      setQuality(readiness);

      if (readiness.verdict === "record_again") {
        setPendingFrames(frames);
        setProgress(null);
        setPending(false);
        return;
      }

      await finishAnalysis(frames);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pose extraction failed.");
      setProgress(null);
      setPending(false);
    }
  }

  async function runFixture() {
    setError(null);
    setNote(null);
    setPending(true);
    setProgress(40);
    try {
      await submitFrames([], "diagnostics_fixture", true);
      setNote("Developer fixture landmarks processed (not athlete video).");
      setProgress(100);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fixture run failed.");
      setProgress(null);
    } finally {
      setPending(false);
    }
  }

  if (!isDeadlift) {
    return (
      <Alert tone="info" title="Movement MVP scope">
        Pose / movement analysis MVP currently supports conventional deadlift
        only. This upload stays private; no metrics were invented for other
        lifts. Camera quality still applies at upload for recording guidance.
      </Alert>
    );
  }

  return (
    <div className="grid gap-3">
      <Alert tone="info" title="Movement analysis">
        Camera quality is checked before analysis to reduce inaccurate results.
        Pipeline: video → quality → poses → phases → metrics → report.
      </Alert>

      {signedMediaPath ? (
        <video
          ref={videoRef}
          src={signedMediaPath}
          className="hidden"
          preload="metadata"
          muted
          playsInline
          crossOrigin="anonymous"
        />
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={() => void runMediaPipe()}
          loading={pending}
          disabled={pending || !signedMediaPath}
        >
          Extract poses & analyze
        </Button>
        {canRunFixture ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() => void runFixture()}
            loading={pending}
            disabled={pending}
          >
            Run diagnostics fixture
          </Button>
        ) : null}
      </div>

      {quality ? (
        <CameraQualityPanel
          result={quality}
          proceedPending={pending}
          onProceedAnyway={
            quality.verdict === "record_again" && pendingFrames
              ? () => void finishAnalysis(pendingFrames)
              : undefined
          }
        />
      ) : null}

      {progress != null ? (
        <ProgressBar value={progress} label="Analysis progress" tone="accent" />
      ) : null}
      {note ? (
        <p className="text-xs text-[var(--color-subtle)]">{note}</p>
      ) : null}
      {error ? (
        <Alert tone="danger" title="Analysis blocked" role="alert">
          {error}
        </Alert>
      ) : null}
    </div>
  );
}
