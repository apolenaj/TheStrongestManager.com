/**
 * Published Research Library catalog.
 * Starts empty on purpose — never invent study citations to fill categories.
 * Grow via the validated import workflow with real citations only.
 */

import type { ResearchLibraryEntry } from "@/domain/research-library/types";

/**
 * Curated published entries.
 * Do not add rows without a real, verifiable citationLabel (and URL when available).
 */
export const RESEARCH_LIBRARY_ENTRIES: readonly ResearchLibraryEntry[] = [];
