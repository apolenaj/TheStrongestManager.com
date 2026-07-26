import type { ResearchLibraryCategory } from "@/domain/research-library/constants";
import type {
  ResearchSummarizerOutputField,
  ResearchSummarizerReviewStatus,
} from "@/domain/research-summarizer/constants";

/**
 * Verified paper input — citation must come from the operator, never the model.
 */
export type VerifiedPaperInput = {
  /** Required. Operator-supplied citation; never invented. */
  citationLabel: string;
  citationUrl?: string | null;
  /** Optional verified metadata fields (also never invented by the model). */
  title?: string | null;
  authors?: string | null;
  year?: string | null;
  /** Abstract or full text the operator verified/pasted. */
  abstractOrText: string;
  category?: ResearchLibraryCategory | null;
};

export type ResearchSummarizerOutput = Record<
  ResearchSummarizerOutputField,
  string
>;

export type ResearchSummarizerDraft = {
  id: string;
  /** Echo of verified citation — always from input, never model memory. */
  citationLabel: string;
  citationUrl: string | null;
  title: string | null;
  authors: string | null;
  year: string | null;
  category: ResearchLibraryCategory | null;
  fields: ResearchSummarizerOutput;
  status: ResearchSummarizerReviewStatus;
  isAiGenerated: true;
  /** Provenance: citation came from verified input, not the model. */
  citationSource: "verified_input";
  adapterId: string;
  engineVersion: string;
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
};

export type ResearchSummarizerValidationRejection = {
  reason: string;
  field?: string;
};

export type ResearchSummarizerReviewDecision = "approve" | "reject" | "request_changes";
