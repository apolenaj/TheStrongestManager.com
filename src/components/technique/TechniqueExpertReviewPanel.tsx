"use client";

import { useActionState } from "react";
import { Alert, Badge, Button } from "@/design-system";
import {
  requestTechniqueExpertReviewAction,
  type TechniqueReviewActionState,
} from "@/services/technique-review/actions";
import type { TechniqueAuthorshipPresentation } from "@/domain/technique-review";

const initial: TechniqueReviewActionState = { ok: false };

export function TechniqueExpertReviewPanel({
  analysisId,
  enabled,
  authorship,
  expertReviewStatus,
  latestReview,
  honesty,
}: {
  analysisId: string;
  enabled: boolean;
  authorship: TechniqueAuthorshipPresentation;
  expertReviewStatus: string;
  latestReview: {
    id: string;
    status: string;
    decision: string | null;
    comment: string | null;
    correctedOverallScore: number | null;
    correctedSummary: string | null;
    disagreementKind: string;
  } | null;
  honesty: readonly string[];
}) {
  const [state, action, pending] = useActionState(
    requestTechniqueExpertReviewAction,
    initial,
  );

  if (!enabled) return null;

  return (
    <section className="technique-console grid gap-4 p-5 sm:p-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-[-0.02em]">
          Expert review
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-muted)]">
          {authorship.detail}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant={authorship.isExpertReviewed ? "success" : "info"}>
          {authorship.badge}
        </Badge>
        {expertReviewStatus !== "none" ? (
          <Badge variant="neutral">{expertReviewStatus.replaceAll("_", " ")}</Badge>
        ) : null}
      </div>

      {latestReview && authorship.isExpertReviewed ? (
        <div className="grid gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4 text-sm">
          {latestReview.comment ? (
            <p>
              <span className="text-[var(--color-muted)]">Expert comment: </span>
              {latestReview.comment}
            </p>
          ) : null}
          {latestReview.correctedOverallScore != null ? (
            <p>
              <span className="text-[var(--color-muted)]">Corrected score: </span>
              {latestReview.correctedOverallScore}
            </p>
          ) : null}
          {latestReview.correctedSummary ? (
            <p>
              <span className="text-[var(--color-muted)]">Corrected summary: </span>
              {latestReview.correctedSummary}
            </p>
          ) : null}
          {latestReview.disagreementKind !== "none" ? (
            <p className="text-xs text-[var(--color-muted)]">
              AI vs expert disagreement: {latestReview.disagreementKind} (stored
              for offline model improvement — never auto-retrains).
            </p>
          ) : null}
        </div>
      ) : null}

      {expertReviewStatus === "none" || expertReviewStatus === "withdrawn" ? (
        <form action={action} className="grid gap-3">
          <input type="hidden" name="analysisId" value={analysisId} />
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              name="consent"
              value="true"
              required
              className="mt-1"
            />
            <span>
              I consent to share this analysis (including video) with verified
              Expert Contributors for optional review.
            </span>
          </label>
          {state.error ? (
            <Alert tone="danger" title="Could not request review">
              {state.error}
            </Alert>
          ) : null}
          {state.ok ? (
            <Alert tone="success" title="Review requested">
              Still labeled AI analysis until an expert confirms, corrects, or
              comments.
            </Alert>
          ) : null}
          <Button type="submit" disabled={pending}>
            {pending ? "Requesting…" : "Request expert review"}
          </Button>
        </form>
      ) : null}

      {expertReviewStatus === "pending_review" ? (
        <Alert tone="info" title="Awaiting expert">
          Your request is in the expert queue. This report remains AI analysis —
          not expert-reviewed yet.
        </Alert>
      ) : null}

      <p className="text-xs text-[var(--color-muted)]">{honesty[2]}</p>
      <p className="text-xs text-[var(--color-muted)]">
        Need a paid written expert report?{" "}
        <a
          href="/app/human-analysis"
          className="text-[var(--color-accent)] underline-offset-2 hover:underline"
        >
          Expert Technique Review products
        </a>
      </p>
    </section>
  );
}
