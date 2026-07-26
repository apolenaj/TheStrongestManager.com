/**
 * In-process draft queue for the admin review workflow.
 * Not a public catalog — approved drafts still need editorial Research Library publish.
 */

import type { ResearchSummarizerDraft } from "@/domain/research-summarizer/types";

const drafts = new Map<string, ResearchSummarizerDraft>();

export function saveResearchSummarizerDraft(
  draft: ResearchSummarizerDraft,
): ResearchSummarizerDraft {
  drafts.set(draft.id, draft);
  return draft;
}

export function getResearchSummarizerDraft(
  id: string,
): ResearchSummarizerDraft | null {
  return drafts.get(id) ?? null;
}

export function listResearchSummarizerDrafts(): ResearchSummarizerDraft[] {
  return [...drafts.values()].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export function clearResearchSummarizerDraftsForTests(): void {
  drafts.clear();
}
