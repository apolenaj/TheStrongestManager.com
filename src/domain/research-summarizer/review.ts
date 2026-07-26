/**
 * Human review gate — AI drafts are not publicly publishable until approved.
 */

import type { ResearchSummarizerReviewStatus } from "@/domain/research-summarizer/constants";
import type {
  ResearchSummarizerDraft,
  ResearchSummarizerReviewDecision,
} from "@/domain/research-summarizer/types";

/**
 * Hard rule: AI output must be reviewed before public publication.
 */
export function canPublishResearchSummary(
  draft: Pick<ResearchSummarizerDraft, "status" | "citationLabel" | "citationSource">,
): boolean {
  if (draft.citationSource !== "verified_input") return false;
  if (!draft.citationLabel.trim()) return false;
  return draft.status === "approved";
}

export function isPublicVisibleResearchSummaryStatus(
  status: ResearchSummarizerReviewStatus,
): boolean {
  return status === "approved";
}

export function applyResearchSummarizerReview(input: {
  draft: ResearchSummarizerDraft;
  decision: ResearchSummarizerReviewDecision;
  note?: string | null;
  now?: Date;
}): ResearchSummarizerDraft {
  const now = (input.now ?? new Date()).toISOString();
  const note = input.note?.trim() || null;

  if (input.decision === "approve") {
    return {
      ...input.draft,
      status: "approved",
      reviewNote: note,
      reviewedAt: now,
    };
  }

  if (input.decision === "reject") {
    return {
      ...input.draft,
      status: "rejected",
      reviewNote: note,
      reviewedAt: now,
    };
  }

  // request_changes
  return {
    ...input.draft,
    status: "under_review",
    reviewNote: note ?? "Reviewer requested changes before approval.",
    reviewedAt: now,
  };
}

export function markDraftUnderReview(
  draft: ResearchSummarizerDraft,
): ResearchSummarizerDraft {
  if (draft.status !== "ai_draft") return draft;
  return { ...draft, status: "under_review" };
}
