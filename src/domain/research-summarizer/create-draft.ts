/**
 * Orchestrate validate → summarize → store as AI draft (not published).
 */

import { getResearchSummarizerAdapter } from "@/domain/research-summarizer/adapter";
import { saveResearchSummarizerDraft } from "@/domain/research-summarizer/store";
import type {
  ResearchSummarizerDraft,
  VerifiedPaperInput,
} from "@/domain/research-summarizer/types";
import { validateVerifiedPaperInput } from "@/domain/research-summarizer/validate-input";

function newDraftId(now: Date): string {
  return `rs_${now.getTime().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Create an AI draft from verified paper input.
 * Always starts as `ai_draft` with citationSource `verified_input`.
 * Never invents citationLabel from model memory.
 */
export async function createResearchSummarizerDraft(
  input: VerifiedPaperInput,
  now: Date = new Date(),
): Promise<
  | { ok: true; draft: ResearchSummarizerDraft }
  | { ok: false; error: string }
> {
  const validated = validateVerifiedPaperInput(input);
  if (!validated.ok) {
    return { ok: false, error: validated.rejection.reason };
  }

  const adapter = getResearchSummarizerAdapter();
  const result = await adapter.summarize(validated.value);

  const draft: ResearchSummarizerDraft = {
    id: newDraftId(now),
    citationLabel: validated.value.citationLabel,
    citationUrl: validated.value.citationUrl,
    title: validated.value.title,
    authors: validated.value.authors,
    year: validated.value.year,
    category: validated.value.category,
    fields: result.fields,
    status: "ai_draft",
    isAiGenerated: true,
    citationSource: "verified_input",
    adapterId: result.adapterId,
    engineVersion: result.engineVersion,
    reviewNote: null,
    reviewedAt: null,
    createdAt: now.toISOString(),
  };

  saveResearchSummarizerDraft(draft);
  return { ok: true, draft };
}
