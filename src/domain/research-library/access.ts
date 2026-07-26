/**
 * Research Library accessors.
 */

import { RESEARCH_LIBRARY_ENTRIES } from "@/domain/research-library/catalog";
import {
  RESEARCH_LIBRARY_CATEGORIES,
  RESEARCH_LIBRARY_CATEGORY_LABELS,
  type ResearchLibraryCategory,
} from "@/domain/research-library/constants";
import type { ResearchLibraryEntry } from "@/domain/research-library/types";

export function listResearchLibraryEntries(
  category?: ResearchLibraryCategory,
): ResearchLibraryEntry[] {
  const all = [...RESEARCH_LIBRARY_ENTRIES];
  if (!category) return all;
  return all.filter((e) => e.category === category);
}

export function getResearchLibraryEntryBySlug(
  slug: string,
): ResearchLibraryEntry | undefined {
  return RESEARCH_LIBRARY_ENTRIES.find((e) => e.slug === slug);
}

export function allResearchLibrarySlugs(): string[] {
  return RESEARCH_LIBRARY_ENTRIES.map((e) => e.slug);
}

export function researchLibraryIndexPath(): string {
  return "/research";
}

export function researchLibraryEntryPath(slug: string): string {
  return `/research/${slug}`;
}

export function listResearchLibraryByCategory(): Record<
  ResearchLibraryCategory,
  ResearchLibraryEntry[]
> {
  return Object.fromEntries(
    RESEARCH_LIBRARY_CATEGORIES.map((category) => [
      category,
      listResearchLibraryEntries(category),
    ]),
  ) as Record<ResearchLibraryCategory, ResearchLibraryEntry[]>;
}

export function researchLibraryCategoryCounts(): Array<{
  category: ResearchLibraryCategory;
  label: string;
  count: number;
}> {
  return RESEARCH_LIBRARY_CATEGORIES.map((category) => ({
    category,
    label: RESEARCH_LIBRARY_CATEGORY_LABELS[category],
    count: listResearchLibraryEntries(category).length,
  }));
}
