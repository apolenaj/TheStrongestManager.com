/**
 * Historical Training Archive (Prompt 111).
 * Premium profiles: systems, coaches, famous methods.
 * Principles only — never copy copyrighted training programs.
 */

export const HISTORICAL_ARCHIVE_TITLE = "Historical Training Archive";

export const HISTORICAL_ARCHIVE_DESCRIPTION =
  "Premium educational profiles of historical training systems, influential coaches, and famous methods — principles summarized with what was innovative, what remains useful, and what modern evidence questions.";

export const ARCHIVE_PROFILE_KINDS = [
  "system",
  "coach",
  "method",
] as const;

export type ArchiveProfileKind = (typeof ARCHIVE_PROFILE_KINDS)[number];

export const ARCHIVE_PROFILE_KIND_LABELS: Record<ArchiveProfileKind, string> = {
  system: "Historical training system",
  coach: "Influential coach",
  method: "Famous method",
};

export const ARCHIVE_LENS_LABELS = {
  innovative: "What was innovative",
  remainsUseful: "What remains useful",
  evidenceQuestions: "What modern evidence questions",
} as const;

export const ARCHIVE_HONESTY = [
  "Archive profiles summarize principles in original educational language. They do not copy copyrighted books, courses, wave charts, or commercial training programs.",
  "History describes how ideas circulated in coaching culture. It is not an evidence verdict and does not rank coaches or methods as scientifically superior.",
  "Each profile separates three lenses: what was innovative, what remains useful, and what modern evidence questions — so marketing mythology does not collapse into “science says.”",
] as const;

export const ARCHIVE_COPYRIGHT_NOTICE =
  "Principles only. No proprietary templates, set/rep tables from copyrighted programs, or pasted course text are reproduced here.";
