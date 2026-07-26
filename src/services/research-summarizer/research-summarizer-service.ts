/**
 * AI Research Summarizer service (Prompt 114).
 */

import { featureFlags } from "@/config/feature-flags";
import {
  applyResearchSummarizerReview,
  canPublishResearchSummary,
  createResearchSummarizerDraft,
  getResearchSummarizerDraft,
  listResearchSummarizerDrafts,
  markDraftUnderReview,
  saveResearchSummarizerDraft,
  RESEARCH_SUMMARIZER_STUB_ADAPTER_ID,
  type ResearchSummarizerDraft,
  type ResearchSummarizerReviewDecision,
  type VerifiedPaperInput,
} from "@/domain/research-summarizer";
import { routeAiModelRequest } from "@/services/ai-model-router";

export async function getResearchSummarizerQueue(): Promise<
  | { ok: true; drafts: ResearchSummarizerDraft[] }
  | { ok: false; error: string }
> {
  if (!featureFlags.aiResearchSummarizer) {
    return { ok: false, error: "AI Research Summarizer is not enabled." };
  }
  return { ok: true, drafts: listResearchSummarizerDrafts() };
}

export async function summarizeVerifiedPaper(
  input: VerifiedPaperInput,
): Promise<
  | { ok: true; draft: ResearchSummarizerDraft }
  | { ok: false; error: string }
> {
  if (!featureFlags.aiResearchSummarizer) {
    return { ok: false, error: "AI Research Summarizer is not enabled." };
  }
  const result = await createResearchSummarizerDraft(input);
  if (result.ok) {
    try {
      await routeAiModelRequest({
        taskKind: "summarization",
        featureId: "research_summarizer",
        payload: {
          citationLabel: result.draft.citationLabel,
          title: result.draft.title,
        },
        runId: result.draft.id,
        adapterIsStub:
          result.draft.adapterId === RESEARCH_SUMMARIZER_STUB_ADAPTER_ID,
        featureEnabled: true,
      });
    } catch {
      // Router / cost metering must never block summarizer.
    }
  }
  return result;
}

export async function reviewResearchSummarizerDraft(input: {
  draftId: string;
  decision: ResearchSummarizerReviewDecision;
  note?: string | null;
}): Promise<
  | {
      ok: true;
      draft: ResearchSummarizerDraft;
      canPublish: boolean;
    }
  | { ok: false; error: string }
> {
  if (!featureFlags.aiResearchSummarizer) {
    return { ok: false, error: "AI Research Summarizer is not enabled." };
  }

  const existing = getResearchSummarizerDraft(input.draftId);
  if (!existing) {
    return { ok: false, error: "Draft not found." };
  }

  const base =
    existing.status === "ai_draft"
      ? markDraftUnderReview(existing)
      : existing;

  const updated = applyResearchSummarizerReview({
    draft: base,
    decision: input.decision,
    note: input.note,
  });
  saveResearchSummarizerDraft(updated);

  return {
    ok: true,
    draft: updated,
    canPublish: canPublishResearchSummary(updated),
  };
}
