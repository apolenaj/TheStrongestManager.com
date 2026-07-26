"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Alert, Badge, Button } from "@/design-system";
import {
  decideTechniqueExpertReviewAction,
  type TechniqueReviewActionState,
} from "@/services/technique-review/actions";
import type { TechniqueReviewDetail } from "@/services/technique-review";
import { TECHNIQUE_EXPERT_DECISION_LABELS } from "@/domain/technique-review";

const initial: TechniqueReviewActionState = { ok: false };

export function TechniqueExpertDecideForm({
  detail,
}: {
  detail: TechniqueReviewDetail;
}) {
  const [state, action, pending] = useActionState(
    decideTechniqueExpertReviewAction,
    initial,
  );
  const pendingReview = detail.status === "pending_review";

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap gap-2">
        <Badge variant={detail.authorship.isExpertReviewed ? "success" : "info"}>
          {detail.authorship.badge}
        </Badge>
        <Badge variant="neutral">{detail.status.replaceAll("_", " ")}</Badge>
        {detail.cameraAngle ? (
          <Badge variant="neutral">{detail.cameraAngle} view</Badge>
        ) : null}
      </div>

      <p className="text-sm text-[var(--color-muted)]">{detail.authorship.detail}</p>

      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[var(--color-muted)]">Exercise</dt>
          <dd>{detail.exerciseName ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-muted)]">AI score</dt>
          <dd>{detail.aiOverallScore ?? "—"}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-[var(--color-muted)]">AI summary</dt>
          <dd>{detail.aiSummary ?? "—"}</dd>
        </div>
      </dl>

      {detail.signedMediaPath ? (
        <video
          className="w-full max-w-xl rounded-[var(--radius-md)] border border-[var(--color-border)]"
          controls
          src={detail.signedMediaPath}
        />
      ) : null}

      {!pendingReview ? (
        <Alert tone="info" title="Already decided">
          Decision: {detail.decision ?? detail.status}. Disagreement:{" "}
          {detail.disagreementKind}.
          {detail.comment ? ` Comment: ${detail.comment}` : ""}
        </Alert>
      ) : (
        <form action={action} className="grid gap-4">
          <input type="hidden" name="reviewId" value={detail.reviewId} />
          <fieldset className="grid gap-2">
            <legend className="text-sm font-medium">Decision</legend>
            {(
              Object.keys(TECHNIQUE_EXPERT_DECISION_LABELS) as Array<
                keyof typeof TECHNIQUE_EXPERT_DECISION_LABELS
              >
            ).map((key) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input type="radio" name="decision" value={key} required />
                {TECHNIQUE_EXPERT_DECISION_LABELS[key]}
              </label>
            ))}
          </fieldset>
          <label className="grid gap-1 text-sm">
            Comment
            <textarea
              name="comment"
              rows={3}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
              placeholder="Optional for Confirm; required for Comment"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Corrected score (0–100, Correct only)
            <input
              type="number"
              name="correctedOverallScore"
              min={0}
              max={100}
              step={0.1}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Corrected summary (Correct only)
            <textarea
              name="correctedSummary"
              rows={2}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            />
          </label>
          {state.error ? (
            <Alert tone="danger" title="Could not save">
              {state.error}
            </Alert>
          ) : null}
          {state.ok ? (
            <Alert tone="success" title="Review saved">
              Athlete report may now show Expert reviewed. Disagreement stored
              for offline improvement — never auto-retrains.
            </Alert>
          ) : null}
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Submit review"}
          </Button>
        </form>
      )}

      <Link
        href="/app/technique-review"
        className="text-sm text-[var(--color-accent)] underline-offset-2 hover:underline"
      >
        Back to queue
      </Link>
    </div>
  );
}
