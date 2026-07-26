/**
 * AI Research Summarizer (Prompt 114).
 * Summarizes verified paper input only — never invents citations from model memory.
 */

export const RESEARCH_SUMMARIZER_ENGINE_VERSION =
  "research_summarizer.extractive_v1" as const;

export const RESEARCH_SUMMARIZER_STUB_ADAPTER_ID =
  "research_summarizer.stub" as const;

export const RESEARCH_SUMMARIZER_REVIEW_STATUSES = [
  "ai_draft",
  "under_review",
  "approved",
  "rejected",
] as const;

export type ResearchSummarizerReviewStatus =
  (typeof RESEARCH_SUMMARIZER_REVIEW_STATUSES)[number];

export const RESEARCH_SUMMARIZER_REVIEW_STATUS_LABELS: Record<
  ResearchSummarizerReviewStatus,
  string
> = {
  ai_draft: "AI draft",
  under_review: "Under review",
  approved: "Approved (publishable)",
  rejected: "Rejected",
};

/** Output sections required by Prompt 114. */
export const RESEARCH_SUMMARIZER_OUTPUT_FIELDS = [
  "researchQuestion",
  "methods",
  "findings",
  "limitations",
  "practicalRelevance",
] as const;

export type ResearchSummarizerOutputField =
  (typeof RESEARCH_SUMMARIZER_OUTPUT_FIELDS)[number];

export const RESEARCH_SUMMARIZER_OUTPUT_LABELS: Record<
  ResearchSummarizerOutputField,
  string
> = {
  researchQuestion: "Research question",
  methods: "Methods",
  findings: "Findings",
  limitations: "Limitations",
  practicalRelevance: "Practical relevance",
};

export const RESEARCH_SUMMARIZER_HONESTY = [
  "AI Research Summarizer accepts verified paper metadata and text only — never invents DOIs, titles, authors, or citations from model memory.",
  "AI drafts are labelled as AI-generated and must be human-reviewed before any public publication.",
  "Missing citation metadata is a hard reject; the model must not fill citation gaps.",
  "Approved summaries still require editorial Research Library publishing with the verified citation intact.",
] as const;

export const RESEARCH_SUMMARIZER_AI_LABEL = "AI research draft" as const;

export const RESEARCH_SUMMARIZER_AI_DISCLAIMER =
  "This summary was generated from supplied verified paper text. It is not peer-reviewed and must not be published until a human reviewer approves it." as const;

/** Placeholder when the supplied text does not support a section. */
export const RESEARCH_SUMMARIZER_NOT_STATED =
  "Not stated in the supplied verified text." as const;
