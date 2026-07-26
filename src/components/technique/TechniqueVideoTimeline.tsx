"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Badge, Button } from "@/design-system";
import type { LiftPhaseInsight } from "@/domain/movement/phases";
import type { TechniqueTimelineMarker } from "@/domain/technique/report-presentation";
import { LiftPhaseDetailPanel } from "@/components/technique/LiftPhaseDetailPanel";

export function TechniqueVideoTimeline({
  src,
  markers,
  phaseInsights,
  phasesUnavailableReason,
  durationSeconds,
}: {
  src: string | null;
  markers: TechniqueTimelineMarker[];
  phaseInsights?: LiftPhaseInsight[];
  phasesUnavailableReason?: string | null;
  durationSeconds: number | null;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(durationSeconds ?? 0);
  const [selectedId, setSelectedId] = useState<string | null>(
    phaseInsights?.[0]?.id ?? markers[0]?.id ?? null,
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTime = () => setCurrent(video.currentTime);
    const onMeta = () => {
      if (Number.isFinite(video.duration)) setDuration(video.duration);
    };
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("loadedmetadata", onMeta);
    return () => {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("loadedmetadata", onMeta);
    };
  }, [src]);

  const insightById = useMemo(() => {
    const map = new Map<string, LiftPhaseInsight>();
    for (const insight of phaseInsights ?? []) {
      map.set(insight.id, insight);
    }
    return map;
  }, [phaseInsights]);

  const selectedInsight = selectedId
    ? (insightById.get(selectedId) ?? null)
    : null;

  const seekTo = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, time);
    void video.play().catch(() => undefined);
  }, []);

  const selectPhase = useCallback(
    (id: string, timeSeconds: number) => {
      setSelectedId(id);
      seekTo(timeSeconds);
    },
    [seekTo],
  );

  if (!src) {
    return (
      <p className="text-sm text-[var(--color-muted)]">No private video on file.</p>
    );
  }

  const total = duration > 0 ? duration : 1;

  return (
    <div className="grid gap-4">
      <video
        ref={videoRef}
        controls
        playsInline
        preload="metadata"
        className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-black/40"
        src={src}
        aria-label="Technique analysis video"
      >
        Your browser cannot play this video. Phase markers and recommendations
        below remain available as text.
      </video>

      <div
        className="relative h-4 rounded-[var(--radius-full)] bg-[var(--color-surface-elevated)]"
        role="group"
        aria-label="Technique phase timeline"
      >
        <div
          className="absolute inset-y-0 left-0 rounded-[var(--radius-full)] bg-[var(--color-accent)]/35 transition-[width] duration-150"
          style={{ width: `${Math.min(100, (current / total) * 100)}%` }}
        />
        {markers.map((marker) => {
          const left = Math.min(
            98,
            Math.max(0, (marker.timeSeconds / total) * 100),
          );
          const width = Math.max(
            1.5,
            ((marker.endTimeSeconds - marker.timeSeconds) / total) * 100,
          );
          const active = selectedId === marker.id;
          return (
            <button
              key={marker.id}
              type="button"
              title={`${marker.label} @ ${marker.timeSeconds.toFixed(1)}s`}
              aria-label={`Jump to ${marker.label} at ${marker.timeSeconds.toFixed(1)} seconds`}
              aria-pressed={active}
              aria-current={active ? "true" : undefined}
              className={`absolute top-0 h-full rounded-[var(--radius-sm)] border transition-opacity hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] ${
                active
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/45 opacity-100"
                  : "border-transparent bg-[var(--color-foreground)]/25 opacity-80"
              }`}
              style={{ left: `${left}%`, width: `${Math.min(100 - left, width)}%` }}
              onClick={() => selectPhase(marker.id, marker.timeSeconds)}
            />
          );
        })}
      </div>

      {markers.length > 0 ? (
        <div
          className="flex flex-wrap gap-2"
          role="list"
          aria-label="Technique phases"
        >
          {markers.map((marker) => {
            const active = selectedId === marker.id;
            return (
              <div key={marker.id} role="listitem">
                <Button
                  type="button"
                  variant={active ? "primary" : "secondary"}
                  className="!px-2.5 !py-1 text-xs"
                  aria-pressed={active}
                  onClick={() => selectPhase(marker.id, marker.timeSeconds)}
                >
                  <Badge variant="neutral" className="mr-1.5">
                    {marker.timeSeconds.toFixed(1)}s
                  </Badge>
                  {marker.label}
                </Button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-[var(--color-subtle)]">
          {phasesUnavailableReason ??
            "Timeline markers appear after movement phases are detected."}
        </p>
      )}

      {selectedInsight ? (
        <LiftPhaseDetailPanel
          insight={selectedInsight}
          currentTimeSeconds={current}
        />
      ) : markers.length > 0 ? (
        <p className="text-sm text-[var(--color-muted)]">
          Select a phase to see metric, issue, and recommendation.
        </p>
      ) : null}
    </div>
  );
}
