"use client";

import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  ButtonLink,
  Label,
  ProgressBar,
  Select,
} from "@/design-system";
import {
  CAMERA_ANGLES,
  TECHNIQUE_ALLOWED_MIME_TYPES,
  TECHNIQUE_MAX_DURATION_SECONDS,
  TECHNIQUE_MAX_FILE_BYTES,
  TECHNIQUE_MIN_DURATION_SECONDS,
  type CameraAngleId,
} from "@/domain/technique/constants";
import { validateTechniqueVideo } from "@/domain/technique/validation";
import { runMovementPipeline } from "@/domain/movement/pipeline";
import {
  TECHNIQUE_CHECK_FUNNEL_STEPS,
  TECHNIQUE_CHECK_PRIVACY_COPY,
  TECHNIQUE_CHECK_SIGNUP_HREF,
  buildLimitedTechniqueInsight,
  type LimitedTechniqueInsight,
} from "@/domain/technique-check";
import { createBrowserMediaPipeAdapter } from "@/services/movement/browser-mediapipe-adapter";

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

function EvidenceBadge({
  evidence,
}: {
  evidence: "observed" | "estimated" | "recommended";
}) {
  return (
    <Badge variant="neutral">
      {evidence}
    </Badge>
  );
}

export function TechniqueCheckFunnel() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [cameraAngle, setCameraAngle] = useState<CameraAngleId>("side");
  const [consent, setConsent] = useState(false);
  const [ticket, setTicket] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [insight, setInsight] = useState<LimitedTechniqueInsight | null>(null);
  const [stepNote, setStepNote] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  async function onFileChange(next: File | null) {
    setError(null);
    setInsight(null);
    setTicket(null);
    setStepNote(null);
    setObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setFile(null);
    if (!next) return;

    if (
      !(TECHNIQUE_ALLOWED_MIME_TYPES as readonly string[]).includes(next.type) &&
      !next.name.match(/\.(mp4|webm|mov)$/i)
    ) {
      setError(
        `Unsupported file type. Allowed: ${TECHNIQUE_ALLOWED_MIME_TYPES.join(", ")}.`,
      );
      return;
    }
    if (next.size > TECHNIQUE_MAX_FILE_BYTES) {
      setError(
        `File is too large. Maximum size is ${Math.floor(TECHNIQUE_MAX_FILE_BYTES / (1024 * 1024))} MB.`,
      );
      return;
    }

    try {
      const meta = await readVideoMeta(next);
      const full = validateTechniqueVideo({
        mimeType: next.type || "video/mp4",
        fileSizeBytes: next.size,
        durationSeconds: meta.durationSeconds,
        widthPx: meta.widthPx,
        heightPx: meta.heightPx,
        fileName: next.name,
      });
      if (!full.ok) {
        setError(full.error);
        return;
      }
      if (
        meta.durationSeconds < TECHNIQUE_MIN_DURATION_SECONDS ||
        meta.durationSeconds > TECHNIQUE_MAX_DURATION_SECONDS
      ) {
        setError(
          `Duration must be ${TECHNIQUE_MIN_DURATION_SECONDS}–${TECHNIQUE_MAX_DURATION_SECONDS} seconds.`,
        );
        return;
      }
      const url = URL.createObjectURL(next);
      setObjectUrl(url);
      setFile(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read video.");
    }
  }

  async function claimTicket() {
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/technique-check/claim", { method: "POST" });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        token?: string;
        privacy?: string;
      };
      if (!res.ok || !json.ok || !json.token) {
        throw new Error(json.error ?? "Could not claim a free check.");
      }
      setTicket(json.token);
      setStepNote(json.privacy ?? "Ticket claimed. Video still has not left your browser.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Claim failed.");
    } finally {
      setPending(false);
    }
  }

  async function runAnalysis() {
    setError(null);
    setInsight(null);
    if (!file || !ticket || !consent) {
      setError("Choose a video, consent, and claim a free-check ticket first.");
      return;
    }
    if (!videoRef.current || !objectUrl) {
      setError("Local video preview is required for in-browser analysis.");
      return;
    }

    setPending(true);
    setProgress(10);
    try {
      const video = videoRef.current;
      if (video.readyState < 1) {
        await new Promise<void>((resolve, reject) => {
          video.onloadedmetadata = () => resolve();
          video.onerror = () => reject(new Error("Could not load local video."));
        });
      }

      setProgress(25);
      const adapter = createBrowserMediaPipeAdapter();
      const result = await adapter.estimate({
        video,
        sampleHz: 6,
      });
      setProgress(70);
      if (!result.ok) {
        throw new Error(result.error);
      }

      const report = runMovementPipeline({
        exerciseSlug: "deadlift",
        cameraAngle,
        frames: result.frames,
        poseProvider: "browser_mediapipe",
      });
      setProgress(95);
      const limited = buildLimitedTechniqueInsight(report);
      setInsight(limited);
      setProgress(100);
      setStepNote(
        "Limited insight ready. Your video was not uploaded. Create an account to save a full private report.",
      );
      try {
        sessionStorage.setItem(
          "ts_technique_check_insight",
          JSON.stringify({
            at: Date.now(),
            exerciseSlug: limited.exerciseSlug,
            summary: limited.summary,
            scoreShown: limited.score.shown,
            scoreValue: limited.score.value,
          }),
        );
      } catch {
        // sessionStorage optional
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "In-browser analysis failed. You can still create an account and upload privately in the app.",
      );
      setProgress(null);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-10">
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {TECHNIQUE_CHECK_FUNNEL_STEPS.map((step, i) => (
          <li
            key={step.id}
            className="border-t border-[var(--color-border)] pt-3"
          >
            <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
              Step {i + 1}
            </p>
            <p className="mt-1 text-sm font-medium">{step.label}</p>
            <p className="mt-1 text-xs text-[var(--color-muted)]">{step.detail}</p>
          </li>
        ))}
      </ol>

      <Alert tone="info" title="Privacy">
        {TECHNIQUE_CHECK_PRIVACY_COPY}
      </Alert>

      <section className="space-y-4 max-w-2xl">
        <h2 className="font-[family-name:var(--font-display)] text-xl">
          1. Upload one lift
        </h2>
        <p className="text-sm text-[var(--color-muted)]">
          Conventional deadlift · side view preferred · clip stays on this device.
        </p>
        <div>
          <Label htmlFor="tc-angle">Camera angle</Label>
          <Select
            id="tc-angle"
            className="mt-1 min-h-12"
            value={cameraAngle}
            onChange={(e) => setCameraAngle(e.target.value as CameraAngleId)}
          >
            {CAMERA_ANGLES.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="tc-file">Video file</Label>
          <input
            id="tc-file"
            type="file"
            accept={TECHNIQUE_ALLOWED_MIME_TYPES.join(",")}
            className="mt-2 block w-full text-sm text-[var(--color-muted)]"
            onChange={(e) => void onFileChange(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <p className="mt-2 text-xs text-[var(--color-muted)]">
              Selected: {file.name} ({Math.round(file.size / 1024)} KB) — local only
            </p>
          ) : null}
        </div>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          <span>
            I understand this free check runs pose estimation in my browser, does
            not upload my video, and is not medical advice.
          </span>
        </label>
      </section>

      {objectUrl ? (
        <video
          ref={videoRef}
          src={objectUrl}
          className="hidden"
          preload="metadata"
          muted
          playsInline
        />
      ) : null}

      <section className="space-y-3 max-w-2xl">
        <h2 className="font-[family-name:var(--font-display)] text-xl">
          2–3. Claim ticket & analyze
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => void claimTicket()}
            loading={pending && !insight}
            disabled={pending || !file || !consent}
          >
            Claim free check
          </Button>
          <Button
            type="button"
            onClick={() => void runAnalysis()}
            loading={pending}
            disabled={pending || !file || !consent || !ticket}
          >
            Run basic analysis
          </Button>
        </div>
        {ticket ? (
          <p className="text-xs text-[var(--color-muted)]">
            Ticket ready · expires after a short window · rate-limited per network
          </p>
        ) : null}
        {progress != null ? (
          <ProgressBar value={progress} label="Analyzing in browser" />
        ) : null}
        {stepNote ? (
          <p className="text-sm text-[var(--color-muted)]">{stepNote}</p>
        ) : null}
      </section>

      {error ? (
        <Alert tone="warning" title="Could not complete">
          {error}
        </Alert>
      ) : null}

      {insight ? (
        <section className="max-w-3xl space-y-6 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-xl">
              4. Limited insight
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
              {insight.summary}
            </p>
          </div>

          {insight.score.shown && insight.score.value != null ? (
            <p className="font-[family-name:var(--font-display)] text-3xl">
              {insight.score.value}
              <span className="ml-2 text-base text-[var(--color-muted)]">
                /100 Technique Score
                {insight.score.confidence
                  ? ` · ${insight.score.confidence} confidence`
                  : ""}
              </span>
            </p>
          ) : (
            <Alert tone="info" title="Score withheld">
              No Technique Score was invented. Observable components were
              insufficient, or the camera angle limited the scorer.
            </Alert>
          )}

          <ul className="space-y-4">
            {insight.bullets.map((b) => (
              <li key={b.id} className="border-t border-[var(--color-border)] pt-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{b.title}</p>
                  <EvidenceBadge evidence={b.evidence} />
                </div>
                <p className="mt-1 text-sm text-[var(--color-muted)]">{b.detail}</p>
              </li>
            ))}
          </ul>

          {insight.phasePreview.length > 0 ? (
            <div>
              <p className="text-sm font-medium">Phase preview</p>
              <p className="mt-1 text-xs text-[var(--color-muted)]">
                Estimated from 2D landmarks — not a force-plate timeline.
              </p>
              <ul className="mt-2 flex flex-wrap gap-2 text-sm">
                {insight.phasePreview.map((p) => (
                  <li
                    key={`${p.phase}-${p.label}`}
                    className="text-[var(--color-muted)]"
                  >
                    {p.label} ({p.confidence})
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div>
            <p className="text-sm font-medium">Locked until you save</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
              {insight.lockedSections.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-3">
            <ButtonLink href={TECHNIQUE_CHECK_SIGNUP_HREF} size="lg">
              Create account to save full report
            </ButtonLink>
            <ButtonLink href="/app/technique" variant="secondary" size="lg">
              I already have an account
            </ButtonLink>
          </div>

          <ul className="list-disc space-y-1 pl-5 text-xs text-[var(--color-muted)]">
            {insight.disclaimers.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
