/**
 * Research Library (Prompt 113).
 * Curated study architecture — never invent citations.
 */

export const RESEARCH_LIBRARY_ENGINE_VERSION = "research_library.v1" as const;

export const RESEARCH_LIBRARY_CATEGORIES = [
  "hypertrophy",
  "strength",
  "programming",
  "recovery",
  "nutrition",
  "biomechanics",
] as const;

export type ResearchLibraryCategory =
  (typeof RESEARCH_LIBRARY_CATEGORIES)[number];

export const RESEARCH_LIBRARY_CATEGORY_LABELS: Record<
  ResearchLibraryCategory,
  string
> = {
  hypertrophy: "Hypertrophy",
  strength: "Strength",
  programming: "Programming",
  recovery: "Recovery",
  nutrition: "Nutrition",
  biomechanics: "Biomechanics",
};

export const RESEARCH_LIBRARY_HONESTY = [
  "The Research Library only publishes entries with real citations supplied by importers or editors.",
  "We never invent study citations, DOIs, author lists, or paper titles to fill empty categories.",
  "Empty categories stay empty until a validated entry is imported — honesty over fake completeness.",
  "Each entry separates citation, summary, practical takeaway, and limitations.",
] as const;

/** CSV / JSON column names for the import workflow. */
export const RESEARCH_LIBRARY_IMPORT_COLUMNS = [
  "slug",
  "category",
  "citationLabel",
  "citationUrl",
  "summary",
  "practicalTakeaway",
  "limitations",
  "evidenceLabel",
] as const;

export type ResearchLibraryImportColumn =
  (typeof RESEARCH_LIBRARY_IMPORT_COLUMNS)[number];
