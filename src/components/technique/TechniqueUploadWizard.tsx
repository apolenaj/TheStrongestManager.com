"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Input,
  Label,
  Select,
  ProgressBar,
} from "@/design-system";
import {
  CAMERA_ANGLES,
  TECHNIQUE_ALLOWED_MIME_TYPES,
  TECHNIQUE_MAX_DURATION_SECONDS,
  TECHNIQUE_MAX_FILE_BYTES,
  TECHNIQUE_MIN_DURATION_SECONDS,
  TECHNIQUE_MIN_HEIGHT_PX,
  TECHNIQUE_MIN_WIDTH_PX,
  TECHNIQUE_PRIVACY_COPY,
  type CameraAngleId,
} from "@/domain/technique/constants";
import { featureFlags } from "@/config/feature-flags";
import { VIDEO_PRIVACY_OPTIONS } from "@/domain/video-privacy";
import { validateTechniqueVideo } from "@/domain/technique/validation";
import {
  assessCameraQuality,
  type CameraQualityResult,
} from "@/domain/camera-quality";
import { sampleVideoQualityFromFile } from "@/lib/camera-quality-sample";
import { CameraQualityPanel } from "@/components/technique/CameraQualityPanel";
import { SmartVideoRecordingGuide } from "@/components/technique/SmartVideoRecordingGuide";
import { getRecordingGuide } from "@/domain/recording-guide";

type ExerciseOption = { id: string; name: string; slug: string };

function readVideoMeta(
  file: File,
): Promise<{ durationSeconds: number; widthPx: number; heightPx: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const meta = {
        durationSeconds: video.duration,
        widthPx: video.videoWidth,
        heightPx: video.videoHeight,
      };
      URL.revokeObjectURL(url);
      resolve(meta);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read video metadata."));
    };
    video.src = url;
  });
}

export function TechniqueUploadWizard({
  exercises,
  units,
}: {
  exercises: ExerciseOption[];
  units: "kg" | "lb";
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [exerciseId, setExerciseId] = useState(exercises[0]?.id ?? "");
  const [cameraAngle, setCameraAngle] = useState<CameraAngleId>(
    CAMERA_ANGLES[0].id,
  );
  const [load, setLoad] = useState("");
  const [reps, setReps] = useState("");
  const [consent, setConsent] = useState(false);
  const [allowExpertReview, setAllowExpertReview] = useState(false);
  const [allowModelImprovement, setAllowModelImprovement] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [metaPreview, setMetaPreview] = useState<string | null>(null);
  const [quality, setQuality] = useState<CameraQualityResult | null>(null);
  const [qualityPending, setQualityPending] = useState(false);

  const accept = useMemo(
    () => TECHNIQUE_ALLOWED_MIME_TYPES.join(","),
    [],
  );

  const selectedSlug =
    exercises.find((e) => e.id === exerciseId)?.slug ?? null;

  const recordingGuide = useMemo(
    () => getRecordingGuide(selectedSlug).guide,
    [selectedSlug],
  );

  // Suggest the guide’s recommended angle when the exercise changes.
  useEffect(() => {
    setCameraAngle(recordingGuide.recommendedAngleId);
  }, [recordingGuide.recommendedAngleId, exerciseId]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!file) {
        setQuality(null);
        return;
      }
      setQualityPending(true);
      try {
        const sample = await sampleVideoQualityFromFile(file);
        if (cancelled) return;
        setQuality(
          assessCameraQuality({
            exerciseSlug: selectedSlug,
            declaredCameraAngle: cameraAngle,
            widthPx: sample.widthPx,
            heightPx: sample.heightPx,
            durationSeconds: sample.durationSeconds,
            estimatedFps: sample.estimatedFps,
            meanLuma: sample.meanLuma,
            pose: null,
          }),
        );
      } catch {
        if (cancelled) return;
        setQuality(
          assessCameraQuality({
            exerciseSlug: selectedSlug,
            declaredCameraAngle: cameraAngle,
            widthPx: null,
            heightPx: null,
            durationSeconds: null,
            estimatedFps: null,
            meanLuma: null,
            pose: null,
          }),
        );
      } finally {
        if (!cancelled) setQualityPending(false);
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [file, cameraAngle, selectedSlug]);

  async function onFileChange(next: File | null) {
    setError(null);
    setMetaPreview(null);
    setFile(next);
    if (!next) return;
    try {
      const meta = await readVideoMeta(next);
      const check = validateTechniqueVideo({
        mimeType: next.type,
        fileSizeBytes: next.size,
        durationSeconds: meta.durationSeconds,
        widthPx: meta.widthPx,
        heightPx: meta.heightPx,
        fileName: next.name,
      });
      if (!check.ok) {
        setError(check.error);
        setFile(null);
        return;
      }
      setMetaPreview(
        `${Math.round(meta.durationSeconds * 10) / 10}s · ${meta.widthPx}×${meta.heightPx} · ${(next.size / (1024 * 1024)).toFixed(1)} MB`,
      );
    } catch {
      setError("Could not read video metadata in this browser.");
      setFile(null);
    }
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!file) {
      setError("Choose a video file.");
      return;
    }
    if (!consent) {
      setError("Consent to analysis is required.");
      return;
    }
    if (!exerciseId) {
      setError("Choose an exercise.");
      return;
    }

    setPending(true);
    setProgress(0);

    try {
      const meta = await readVideoMeta(file);
      const form = new FormData();
      form.set("video", file);
      form.set("exerciseId", exerciseId);
      form.set("cameraAngle", cameraAngle);
      form.set("consent", "true");
      if (featureFlags.videoPrivacyControls) {
        if (allowExpertReview) form.set("allowExpertReview", "true");
        if (allowModelImprovement) {
          form.set("allowAnonymousModelImprovement", "true");
        }
      }
      form.set("durationSeconds", String(meta.durationSeconds));
      form.set("widthPx", String(meta.widthPx));
      form.set("heightPx", String(meta.heightPx));
      form.set("units", units);
      if (load.trim()) form.set("load", load.trim());
      if (reps.trim()) form.set("reps", reps.trim());

      const analysisId = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/technique/analyses");
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setProgress(Math.round((event.loaded / event.total) * 100));
          }
        };
        xhr.onload = () => {
          try {
            const json = JSON.parse(xhr.responseText) as {
              ok?: boolean;
              error?: string;
              analysisId?: string;
            };
            if (
              xhr.status >= 200 &&
              xhr.status < 300 &&
              json.ok &&
              json.analysisId
            ) {
              resolve(json.analysisId);
            } else {
              reject(new Error(json.error ?? "Upload failed."));
            }
          } catch {
            reject(new Error("Upload failed."));
          }
        };
        xhr.onerror = () => reject(new Error("Network error during upload."));
        xhr.send(form);
      });

      setProgress(100);
      router.push(`/app/technique/${analysisId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
      setProgress(null);
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5"
    >
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Upload for technique analysis
        </h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Limits: {TECHNIQUE_ALLOWED_MIME_TYPES.join(", ")}; max{" "}
          {Math.floor(TECHNIQUE_MAX_FILE_BYTES / (1024 * 1024))} MB;{" "}
          {TECHNIQUE_MIN_DURATION_SECONDS}–{TECHNIQUE_MAX_DURATION_SECONDS}s;
          min {TECHNIQUE_MIN_WIDTH_PX}×{TECHNIQUE_MIN_HEIGHT_PX}px.
        </p>
      </div>

      <Alert tone="info" title="Video privacy">
        {TECHNIQUE_PRIVACY_COPY}
      </Alert>

      {featureFlags.videoPrivacyControls ? (
        <div className="space-y-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-3">
          <p className="text-sm font-medium text-[var(--color-foreground)]">
            Privacy options — private by default; no pre-ticked extras
          </p>
          <label className="flex items-start gap-2 text-sm text-[var(--color-muted)]">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1"
            />
            <span>
              <span className="font-medium text-[var(--color-foreground)]">
                {VIDEO_PRIVACY_OPTIONS[0]!.title}
              </span>
              <span className="mt-1 block text-xs">
                {VIDEO_PRIVACY_OPTIONS[0]!.description}
              </span>
            </span>
          </label>
          <label className="flex items-start gap-2 text-sm text-[var(--color-muted)]">
            <input
              type="checkbox"
              checked={allowExpertReview}
              onChange={(e) => setAllowExpertReview(e.target.checked)}
              className="mt-1"
            />
            <span>
              <span className="font-medium text-[var(--color-foreground)]">
                {VIDEO_PRIVACY_OPTIONS[1]!.title}
              </span>
              <span className="mt-1 block text-xs">
                {VIDEO_PRIVACY_OPTIONS[1]!.description}
              </span>
            </span>
          </label>
          <label className="flex items-start gap-2 text-sm text-[var(--color-muted)]">
            <input
              type="checkbox"
              checked={allowModelImprovement}
              onChange={(e) => setAllowModelImprovement(e.target.checked)}
              className="mt-1"
            />
            <span>
              <span className="font-medium text-[var(--color-foreground)]">
                {VIDEO_PRIVACY_OPTIONS[2]!.title}
              </span>
              <span className="mt-1 block text-xs">
                {VIDEO_PRIVACY_OPTIONS[2]!.description}
              </span>
            </span>
          </label>
        </div>
      ) : (
        <label className="flex items-start gap-2 text-sm text-[var(--color-muted)]">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1"
          />
          I consent to private technique analysis of this video.
        </label>
      )}

      <div>
        <Label htmlFor="technique-exercise">Exercise</Label>
        <Select
          id="technique-exercise"
          value={exerciseId}
          onChange={(e) => setExerciseId(e.target.value)}
        >
          {exercises.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name}
            </option>
          ))}
        </Select>
      </div>

      <SmartVideoRecordingGuide guide={recordingGuide} />

      <div>
        <Label htmlFor="technique-angle">Camera angle</Label>
        <Select
          id="technique-angle"
          value={cameraAngle}
          onChange={(e) => setCameraAngle(e.target.value as CameraAngleId)}
        >
          {CAMERA_ANGLES.map((angle) => (
            <option key={angle.id} value={angle.id}>
              {angle.label}
            </option>
          ))}
        </Select>
        <p className="mt-1 text-xs text-[var(--color-subtle)]">
          Suggested from the guide — change if your goal needs another view.
        </p>
      </div>

      <div>
        <Label htmlFor="technique-video">Video</Label>
        <Input
          id="technique-video"
          type="file"
          accept={accept}
          onChange={(e) => void onFileChange(e.target.files?.[0] ?? null)}
        />
        {metaPreview ? (
          <p className="mt-1 text-xs text-[var(--color-muted)]">{metaPreview}</p>
        ) : null}
      </div>

      {qualityPending ? (
        <p className="text-sm text-[var(--color-muted)]">
          Checking camera quality…
        </p>
      ) : null}
      {quality ? <CameraQualityPanel result={quality} /> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="technique-load">Load ({units}) optional</Label>
          <Input
            id="technique-load"
            value={load}
            onChange={(e) => setLoad(e.target.value)}
            inputMode="decimal"
          />
        </div>
        <div>
          <Label htmlFor="technique-reps">Reps optional</Label>
          <Input
            id="technique-reps"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            inputMode="numeric"
          />
        </div>
      </div>

      {error ? (
        <Alert tone="danger" title="Upload blocked" role="alert">
          {error}
        </Alert>
      ) : null}

      {progress != null ? (
        <ProgressBar value={progress} label="Upload progress" tone="accent" />
      ) : null}

      <Button type="submit" loading={pending} disabled={pending || !file}>
        Upload video
      </Button>
    </form>
  );
}
