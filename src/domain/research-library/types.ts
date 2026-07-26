import type { EvidenceQualityLabel } from "@/domain/evidence-quality";
import type { ResearchLibraryCategory } from "@/domain/research-library/constants";

export type ResearchLibraryEntry = {
  slug: string;
  category: ResearchLibraryCategory;
  /** Required — never invent. */
  citationLabel: string;
  /** Optional https URL when a real link exists. */
  citationUrl: string | null;
  summary: string;
  practicalTakeaway: string;
  limitations: string;
  /** Prefer research_evidence family labels. */
  evidenceLabel: EvidenceQualityLabel;
};

export type ResearchLibraryImportRow = {
  slug?: string;
  category?: string;
  citationLabel?: string;
  citationUrl?: string | null;
  summary?: string;
  practicalTakeaway?: string;
  limitations?: string;
  evidenceLabel?: string;
};

export type ResearchLibraryImportRejection = {
  rowIndex: number;
  reason: string;
  raw: ResearchLibraryImportRow;
};

export type ResearchLibraryImportResult = {
  accepted: ResearchLibraryEntry[];
  rejected: ResearchLibraryImportRejection[];
  dryRun: boolean;
};
