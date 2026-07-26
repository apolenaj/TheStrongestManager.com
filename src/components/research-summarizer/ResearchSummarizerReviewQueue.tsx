"use client";

import { useActionState } from "react";
import { Alert, Button, Label, Select, Textarea } from "@/design-system";
import {
  reviewResearchSummarizerDraftAction,
  type ReviewActionState,
} from "@/services/research-summarizer/actions";
import {
  RESEARCH_SUMMARIZER_AI_DISCLAIMER,
  RESEARCH_SUMMARIZER_AI_LABEL,
  RESEARCH_SUMMARIZER_OUTPUT_LABELS,
  RESEARCH_SUMMARIZER_REVIEW_STATUS_LABELS,
  type ResearchSummarizerDraft,
  type ResearchSummarizerOutputField,
} from "@/domain/research-summarizer";

const initial: ReviewActionState = { ok: false };

const FIELD_ORDER = Object.keys(
  RESEARCH_SUMMARIZER_OUTPUT_LABELS,
) as ResearchSummarizerOutputField[];

export function ResearchSummarizerReviewQueue({
  drafts,
}: {
  drafts: ResearchSummarizerDraft[];
}) {
  const [state, action, pending] = useActionState(
    reviewResearchSummarizerDraftAction,
    initial,
  );

  if (drafts.length === 0) {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        No AI drafts in the review queue yet. Generate one from verified paper
        input above.
      </p>
    );
  }

  return (
    <div className="grid gap-6">
      <Alert tone="info" title={RESEARCH_SUMMARIZER_AI_LABEL}>
        {RESEARCH_SUMMARIZER_AI_DISCLAIMER}
      </Alert>

      {state.error ? (
        <Alert tone="danger" title="Review failed">
          {state.error}
        </Alert>
      ) : null}
      {state.message ? (
        <Alert tone="success" title="Review saved">
          {state.message}
        </Alert>
      ) : null}

      {drafts.map((draft) => (
        <article
          key={draft.id}
          className="grid gap-3 border-t border-[var(--color-border)] pt-4"
        >
          <header className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-[family-name:var(--font-display)] text-lg">
              {draft.citationLabel}
            </h3>
            <span className="text-xs text-[var(--color-muted)]">
              {RESEARCH_SUMMARIZER_REVIEW_STATUS_LABELS[draft.status]} ·{" "}
              {draft.isAiGenerated ? "AI-generated" : "—"}
            </span>
          </header>
          <p className="text-xs text-[var(--color-muted)]">
            ID <code>{draft.id}</code> · citationSource{" "}
            <code>{draft.citationSource}</code>
            {draft.citationUrl ? (
              <>
                {" "}
                ·{" "}
                <a
                  href={draft.citationUrl}
                  className="text-[var(--color-accent)]"
                  target="_blank"
                  rel="noreferrer"
                >
                  link
                </a>
              </>
            ) : null}
          </p>
          <dl className="grid gap-2 text-sm">
            {FIELD_ORDER.map((key) => (
              <div key={key}>
                <dt className="font-medium">
                  {RESEARCH_SUMMARIZER_OUTPUT_LABELS[key]}
                </dt>
                <dd className="text-[var(--color-muted)]">{draft.fields[key]}</dd>
              </div>
            ))}
          </dl>

          <form action={action} className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <input type="hidden" name="draftId" value={draft.id} />
            <div>
              <Label htmlFor={`decision-${draft.id}`}>Review decision</Label>
              <Select
                id={`decision-${draft.id}`}
                name="decision"
                defaultValue="request_changes"
                className="mt-1"
              >
                <option value="approve">Approve (publishable after editorial step)</option>
                <option value="request_changes">Request changes</option>
                <option value="reject">Reject</option>
              </Select>
            </div>
            <Button type="submit" loading={pending} variant="secondary">
              Submit review
            </Button>
            <div className="sm:col-span-2">
              <Label htmlFor={`note-${draft.id}`}>Reviewer note</Label>
              <Textarea
                id={`note-${draft.id}`}
                name="note"
                rows={2}
                className="mt-1"
                placeholder="What you checked against the source paper…"
                defaultValue={draft.reviewNote ?? ""}
              />
            </div>
          </form>
        </article>
      ))}
    </div>
  );
}
