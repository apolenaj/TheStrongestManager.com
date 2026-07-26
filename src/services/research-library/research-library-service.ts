/**
 * Research Library service — browse + import dry-run (Prompt 113).
 */

import { featureFlags } from "@/config/feature-flags";
import {
  importResearchLibraryRows,
  listResearchLibraryByCategory,
  parseResearchLibraryCsv,
  parseResearchLibraryJson,
  researchLibraryCategoryCounts,
  type ResearchLibraryImportResult,
  type ResearchLibraryImportRow,
} from "@/domain/research-library";

export async function getResearchLibraryOverview(): Promise<
  | {
      ok: true;
      byCategory: ReturnType<typeof listResearchLibraryByCategory>;
      counts: ReturnType<typeof researchLibraryCategoryCounts>;
    }
  | { ok: false; error: string }
> {
  if (!featureFlags.researchLibrary) {
    return { ok: false, error: "Research Library is not enabled." };
  }
  return {
    ok: true,
    byCategory: listResearchLibraryByCategory(),
    counts: researchLibraryCategoryCounts(),
  };
}

export async function dryRunResearchLibraryImport(input: {
  format: "csv" | "json";
  payload: string;
}): Promise<
  | { ok: true; result: ResearchLibraryImportResult }
  | { ok: false; error: string }
> {
  if (!featureFlags.researchLibrary) {
    return { ok: false, error: "Research Library is not enabled." };
  }

  let rows: ResearchLibraryImportRow[];
  if (input.format === "csv") {
    rows = parseResearchLibraryCsv(input.payload);
  } else {
    const parsed = parseResearchLibraryJson(input.payload);
    if (!parsed.ok) return { ok: false, error: parsed.error };
    rows = parsed.rows;
  }

  if (rows.length === 0) {
    return { ok: false, error: "No rows to import." };
  }

  return {
    ok: true,
    result: importResearchLibraryRows(rows, { dryRun: true }),
  };
}
