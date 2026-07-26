/**
 * Validate and import Research Library rows.
 * Missing citationLabel → hard reject. Never invent citations.
 */

import {
  EVIDENCE_QUALITY_FAMILY_BY_LABEL,
  isEvidenceQualityLabel,
  type EvidenceQualityLabel,
} from "@/domain/evidence-quality";
import {
  RESEARCH_LIBRARY_CATEGORIES,
  type ResearchLibraryCategory,
} from "@/domain/research-library/constants";
import type {
  ResearchLibraryEntry,
  ResearchLibraryImportRejection,
  ResearchLibraryImportResult,
  ResearchLibraryImportRow,
} from "@/domain/research-library/types";

function isCategory(raw: string): raw is ResearchLibraryCategory {
  return (RESEARCH_LIBRARY_CATEGORIES as readonly string[]).includes(raw);
}

function normalizeUrl(raw: string | null | undefined): string | null {
  const url = raw?.trim() || null;
  if (!url) return null;
  if (!/^https?:\/\//i.test(url)) return null;
  return url;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

/**
 * Validate a single import row. Returns entry or rejection reason.
 * Hard rule: blank citationLabel is always rejected.
 */
export function validateResearchLibraryRow(
  row: ResearchLibraryImportRow,
  rowIndex: number,
):
  | { ok: true; entry: ResearchLibraryEntry }
  | { ok: false; rejection: ResearchLibraryImportRejection } {
  const citationLabel = row.citationLabel?.trim() ?? "";
  if (!citationLabel) {
    return {
      ok: false,
      rejection: {
        rowIndex,
        reason:
          "citationLabel is required — never invent study citations to fill gaps.",
        raw: row,
      },
    };
  }

  const categoryRaw = row.category?.trim().toLowerCase() ?? "";
  if (!isCategory(categoryRaw)) {
    return {
      ok: false,
      rejection: {
        rowIndex,
        reason: `Unknown category “${row.category ?? ""}”. Use: ${RESEARCH_LIBRARY_CATEGORIES.join(", ")}.`,
        raw: row,
      },
    };
  }

  const summary = row.summary?.trim() ?? "";
  const practicalTakeaway = row.practicalTakeaway?.trim() ?? "";
  const limitations = row.limitations?.trim() ?? "";
  if (!summary || !practicalTakeaway || !limitations) {
    return {
      ok: false,
      rejection: {
        rowIndex,
        reason:
          "summary, practicalTakeaway, and limitations are all required (honest empty fields are not invented).",
        raw: row,
      },
    };
  }

  const evidenceRaw = (row.evidenceLabel?.trim() || "limited_evidence").toLowerCase();
  if (!isEvidenceQualityLabel(evidenceRaw)) {
    return {
      ok: false,
      rejection: {
        rowIndex,
        reason: `Unknown evidenceLabel “${row.evidenceLabel ?? ""}”.`,
        raw: row,
      },
    };
  }
  const evidenceLabel = evidenceRaw as EvidenceQualityLabel;
  if (EVIDENCE_QUALITY_FAMILY_BY_LABEL[evidenceLabel] !== "research_evidence") {
    return {
      ok: false,
      rejection: {
        rowIndex,
        reason:
          "Research Library entries must use research evidence labels (strong/moderate/limited), not expert-practice labels.",
        raw: row,
      },
    };
  }

  const slug =
    row.slug?.trim() ||
    slugify(`${categoryRaw}-${citationLabel}`) ||
    `entry-${rowIndex}`;

  const citationUrl = normalizeUrl(row.citationUrl);
  // If a URL was provided but invalid, reject rather than silently drop a bad link
  if (row.citationUrl?.trim() && !citationUrl) {
    return {
      ok: false,
      rejection: {
        rowIndex,
        reason:
          "citationUrl must be an http(s) URL when provided — do not invent or keep invalid links.",
        raw: row,
      },
    };
  }

  return {
    ok: true,
    entry: {
      slug,
      category: categoryRaw,
      citationLabel,
      citationUrl,
      summary,
      practicalTakeaway,
      limitations,
      evidenceLabel,
    },
  };
}

export function importResearchLibraryRows(
  rows: ResearchLibraryImportRow[],
  options: { dryRun?: boolean } = {},
): ResearchLibraryImportResult {
  const dryRun = options.dryRun ?? true;
  const accepted: ResearchLibraryEntry[] = [];
  const rejected: ResearchLibraryImportRejection[] = [];
  const seenSlugs = new Set<string>();

  rows.forEach((row, index) => {
    const result = validateResearchLibraryRow(row, index);
    if (!result.ok) {
      rejected.push(result.rejection);
      return;
    }
    if (seenSlugs.has(result.entry.slug)) {
      rejected.push({
        rowIndex: index,
        reason: `Duplicate slug “${result.entry.slug}” in this import batch.`,
        raw: row,
      });
      return;
    }
    seenSlugs.add(result.entry.slug);
    accepted.push(result.entry);
  });

  return { accepted, rejected, dryRun };
}

/**
 * Parse CSV with header row matching RESEARCH_LIBRARY_IMPORT_COLUMNS.
 * Does not invent missing citation columns.
 */
export function parseResearchLibraryCsv(csv: string): ResearchLibraryImportRow[] {
  const lines = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length === 0) return [];

  const split = (line: string): string[] => {
    // Simple CSV split supporting quoted commas
    const cells: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]!;
      if (ch === '"') {
        inQuotes = !inQuotes;
        continue;
      }
      if (ch === "," && !inQuotes) {
        cells.push(current.trim());
        current = "";
        continue;
      }
      current += ch;
    }
    cells.push(current.trim());
    return cells;
  };

  const header = split(lines[0]!).map((h) => h.replace(/^\uFEFF/, ""));
  const rows: ResearchLibraryImportRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = split(lines[i]!);
    const row: ResearchLibraryImportRow = {};
    header.forEach((key, idx) => {
      const value = cells[idx] ?? "";
      if (key === "slug") row.slug = value;
      else if (key === "category") row.category = value;
      else if (key === "citationLabel") row.citationLabel = value;
      else if (key === "citationUrl") row.citationUrl = value || null;
      else if (key === "summary") row.summary = value;
      else if (key === "practicalTakeaway") row.practicalTakeaway = value;
      else if (key === "limitations") row.limitations = value;
      else if (key === "evidenceLabel") row.evidenceLabel = value;
    });
    rows.push(row);
  }

  return rows;
}

export function parseResearchLibraryJson(
  raw: string,
):
  | { ok: true; rows: ResearchLibraryImportRow[] }
  | { ok: false; error: string } {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return { ok: false, error: "JSON import must be an array of entry objects." };
    }
    return {
      ok: true,
      rows: parsed.map((item) => {
        if (!item || typeof item !== "object") return {};
        return item as ResearchLibraryImportRow;
      }),
    };
  } catch {
    return { ok: false, error: "Invalid JSON." };
  }
}
