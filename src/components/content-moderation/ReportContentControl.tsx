"use client";

import { useActionState, useState } from "react";
import { Alert, Button, Label } from "@/design-system";
import {
  CONTENT_MODERATION_REPORT_REASONS,
  CONTENT_MODERATION_REPORT_REASON_LABELS,
  type ContentModerationRelatedType,
} from "@/domain/content-moderation";
import {
  submitContentReportAction,
  type ContentModerationActionState,
} from "@/services/content-moderation/actions";

const initial: ContentModerationActionState = { ok: false };

/**
 * Compact report control for community, marketplace, coach profiles, and UGC.
 */
export function ReportContentControl({
  relatedType,
  relatedId,
}: {
  relatedType: ContentModerationRelatedType;
  relatedId: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(
    submitContentReportAction,
    initial,
  );

  if (!open) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
      >
        Report
      </Button>
    );
  }

  return (
    <div className="grid max-w-sm gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-3">
      <p className="text-sm font-medium">Report content</p>
      {state.error ? (
        <Alert tone="danger" title="Could not report">
          {state.error}
        </Alert>
      ) : null}
      {state.message ? (
        <Alert tone="success" title="Submitted">
          {state.message}
        </Alert>
      ) : null}
      <form action={action} className="grid gap-3">
        <input type="hidden" name="relatedType" value={relatedType} />
        <input type="hidden" name="relatedId" value={relatedId} />
        <div>
          <Label htmlFor={`reason-${relatedId}`}>Reason</Label>
          <select
            id={`reason-${relatedId}`}
            name="reason"
            required
            defaultValue=""
            className="mt-1 flex h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-transparent px-3 text-sm"
          >
            <option value="" disabled>
              Select reason
            </option>
            {CONTENT_MODERATION_REPORT_REASONS.map((r) => (
              <option key={r} value={r}>
                {CONTENT_MODERATION_REPORT_REASON_LABELS[r]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor={`details-${relatedId}`}>Details (optional)</Label>
          <textarea
            id={`details-${relatedId}`}
            name="details"
            rows={2}
            maxLength={2000}
            className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-transparent px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" size="sm" loading={pending}>
            Submit report
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
