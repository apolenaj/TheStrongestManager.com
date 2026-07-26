"use client";

import { useActionState } from "react";
import { Alert, Button, Input, Label } from "@/design-system";
import {
  deleteAllVideosAction,
  requestDataExportAction,
  type PrivacyActionState,
} from "@/services/privacy/actions";

const initial: PrivacyActionState = { ok: false };

export function DataControlPanel() {
  const [videoState, videoAction, videoPending] = useActionState(
    deleteAllVideosAction,
    initial,
  );

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm text-[var(--color-muted)]">
          Download a JSON copy of account, profile, training, technique metadata,
          and related records you own. Raw video files are not embedded — delete
          videos separately below.
        </p>
        <form action={requestDataExportAction}>
          <Button type="submit" variant="secondary">
            Export my data
          </Button>
        </form>
      </div>

      <div className="space-y-4 border-t border-[var(--color-border)] pt-6">
        <Alert tone="warning" title="Delete all technique videos">
          Removes every uploaded technique video from private storage for this
          account. Analysis records are marked deleted. This cannot be undone.
        </Alert>
        <form action={videoAction} className="space-y-4">
          <div>
            <Label htmlFor="delete-videos-confirmation">Confirmation</Label>
            <Input
              id="delete-videos-confirmation"
              name="confirmation"
              autoComplete="off"
              placeholder="DELETE VIDEOS"
              required
            />
          </div>
          {videoState.error ? (
            <Alert tone="danger" title="Could not delete videos" role="alert">
              {videoState.error}
            </Alert>
          ) : null}
          {videoState.ok && videoState.message ? (
            <Alert tone="success" title="Videos updated" role="status">
              {videoState.message}
            </Alert>
          ) : null}
          <Button type="submit" variant="danger" loading={videoPending}>
            Delete all uploaded videos
          </Button>
        </form>
      </div>
    </div>
  );
}
