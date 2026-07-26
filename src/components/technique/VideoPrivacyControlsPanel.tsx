"use client";

import { useActionState } from "react";
import { Alert, Button } from "@/design-system";
import { featureFlags } from "@/config/feature-flags";
import {
  VIDEO_PRIVACY_HONESTY,
  VIDEO_PRIVACY_OPTIONS,
} from "@/domain/video-privacy";
import {
  updateVideoPrivacyAction,
  type TechniqueActionState,
} from "@/services/technique/actions";

const initial: TechniqueActionState = { ok: false };

export function VideoPrivacyControlsPanel({
  analysisId,
  allowExpertReview,
  modelImprovementOptIn,
  privacyNote,
}: {
  analysisId: string;
  allowExpertReview: boolean;
  modelImprovementOptIn: boolean;
  privacyNote: string | null;
}) {
  const [state, action, pending] = useActionState(
    updateVideoPrivacyAction,
    initial,
  );

  if (!featureFlags.videoPrivacyControls) {
    return (
      <Alert tone="info" title="Video privacy">
        {privacyNote}
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Alert tone="info" title="Private by default">
        {privacyNote ?? VIDEO_PRIVACY_HONESTY[0]} Optional sharing stays off
        unless you opt in — no hidden consent.
      </Alert>
      <ul className="list-disc space-y-1 pl-5 text-xs text-[var(--color-muted)]">
        {VIDEO_PRIVACY_HONESTY.slice(1).map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <form action={action} className="space-y-3">
        <input type="hidden" name="analysisId" value={analysisId} />
        <p className="text-sm font-medium text-[var(--color-foreground)]">
          {VIDEO_PRIVACY_OPTIONS[0]!.title} — already consented at upload
        </p>
        <label className="flex items-start gap-2 text-sm text-[var(--color-muted)]">
          <input
            type="checkbox"
            name="allowExpertReview"
            defaultChecked={allowExpertReview}
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
            name="allowAnonymousModelImprovement"
            defaultChecked={modelImprovementOptIn}
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
        {state.error ? (
          <Alert tone="danger" title="Could not update" role="alert">
            {state.error}
          </Alert>
        ) : null}
        {state.ok && state.message ? (
          <Alert tone="success" title="Saved" role="status">
            {state.message}
          </Alert>
        ) : null}
        <Button type="submit" variant="secondary" size="sm" loading={pending}>
          Save privacy options
        </Button>
      </form>
    </div>
  );
}
