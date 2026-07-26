"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/services/admin/require-admin";
import {
  reviewResearchSummarizerDraft,
  summarizeVerifiedPaper,
} from "@/services/research-summarizer";
import type { ResearchSummarizerOutput } from "@/domain/research-summarizer";
import { RESEARCH_LIBRARY_CATEGORIES } from "@/domain/research-library";

export type SummarizeActionState = {
  ok: boolean;
  error?: string;
  message?: string;
  draftId?: string;
  citationLabel?: string;
  fields?: ResearchSummarizerOutput;
  status?: string;
};

export type ReviewActionState = {
  ok: boolean;
  error?: string;
  message?: string;
  draftId?: string;
  status?: string;
  canPublish?: boolean;
};

export async function summarizeVerifiedPaperAction(
  _prev: SummarizeActionState,
  formData: FormData,
): Promise<SummarizeActionState> {
  await requireAdmin();

  const citationLabel = String(formData.get("citationLabel") ?? "");
  const citationUrl = String(formData.get("citationUrl") ?? "") || null;
  const title = String(formData.get("title") ?? "") || null;
  const authors = String(formData.get("authors") ?? "") || null;
  const year = String(formData.get("year") ?? "") || null;
  const abstractOrText = String(formData.get("abstractOrText") ?? "");
  const categoryRaw = String(formData.get("category") ?? "").trim().toLowerCase();
  const category =
    (RESEARCH_LIBRARY_CATEGORIES as readonly string[]).includes(categoryRaw)
      ? (categoryRaw as (typeof RESEARCH_LIBRARY_CATEGORIES)[number])
      : null;

  const result = await summarizeVerifiedPaper({
    citationLabel,
    citationUrl,
    title,
    authors,
    year,
    abstractOrText,
    category,
  });

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  revalidatePath("/app/admin/research/summarizer");
  return {
    ok: true,
    message:
      "AI draft created. It is not public — submit a human review decision before any publication.",
    draftId: result.draft.id,
    citationLabel: result.draft.citationLabel,
    fields: result.draft.fields,
    status: result.draft.status,
  };
}

export async function reviewResearchSummarizerDraftAction(
  _prev: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  await requireAdmin();

  const draftId = String(formData.get("draftId") ?? "");
  const decisionRaw = String(formData.get("decision") ?? "");
  const note = String(formData.get("note") ?? "") || null;

  if (
    decisionRaw !== "approve" &&
    decisionRaw !== "reject" &&
    decisionRaw !== "request_changes"
  ) {
    return { ok: false, error: "Choose approve, reject, or request_changes." };
  }

  const result = await reviewResearchSummarizerDraft({
    draftId,
    decision: decisionRaw,
    note,
  });

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  revalidatePath("/app/admin/research/summarizer");
  revalidatePath("/app/admin/research");

  const publishHint = result.canPublish
    ? " Draft is approved for editorial Research Library publish with the verified citation — catalog is not auto-written."
    : " Draft remains non-public until approved.";

  return {
    ok: true,
    message: `Review recorded (${result.draft.status}).${publishHint}`,
    draftId: result.draft.id,
    status: result.draft.status,
    canPublish: result.canPublish,
  };
}
