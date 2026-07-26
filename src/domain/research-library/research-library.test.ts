import { describe, expect, it } from "vitest";
import {
  RESEARCH_LIBRARY_CATEGORIES,
  RESEARCH_LIBRARY_ENTRIES,
  RESEARCH_LIBRARY_HONESTY,
  importResearchLibraryRows,
  parseResearchLibraryCsv,
  researchLibraryCategoryCounts,
  validateResearchLibraryRow,
} from "@/domain/research-library";

describe("research-library", () => {
  it("defines the six required categories", () => {
    expect([...RESEARCH_LIBRARY_CATEGORIES]).toEqual([
      "hypertrophy",
      "strength",
      "programming",
      "recovery",
      "nutrition",
      "biomechanics",
    ]);
    expect(researchLibraryCategoryCounts()).toHaveLength(6);
  });

  it("publishes no invented citations in the curated catalog", () => {
    expect(RESEARCH_LIBRARY_ENTRIES).toEqual([]);
    expect(RESEARCH_LIBRARY_HONESTY.join(" ")).toMatch(/never invent/i);
  });

  it("rejects import rows without citationLabel", () => {
    const result = validateResearchLibraryRow(
      {
        category: "strength",
        summary: "A summary",
        practicalTakeaway: "A takeaway",
        limitations: "A limitation",
        evidenceLabel: "moderate_evidence",
      },
      0,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.rejection.reason).toMatch(/citationLabel/i);
    }
  });

  it("accepts a complete row with a real citation label", () => {
    const result = validateResearchLibraryRow(
      {
        slug: "example-strength-review",
        category: "strength",
        citationLabel:
          "Example Author et al. (2020). Example title. Journal of Example, 1(1), 1–10.",
        citationUrl: "https://doi.org/10.0000/example",
        summary: "Summary of findings for educational use.",
        practicalTakeaway: "Apply progressive overload with recovery in mind.",
        limitations: "Single population; not a universal prescription.",
        evidenceLabel: "limited_evidence",
      },
      0,
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.entry.citationLabel.length).toBeGreaterThan(0);
      expect(result.entry.citationUrl).toMatch(/^https:\/\//);
    }
  });

  it("rejects expert-practice evidence labels for the research library", () => {
    const result = validateResearchLibraryRow(
      {
        category: "hypertrophy",
        citationLabel: "Real Author (2019). Real paper.",
        summary: "Summary",
        practicalTakeaway: "Takeaway",
        limitations: "Limits",
        evidenceLabel: "coaching_consensus",
      },
      0,
    );
    expect(result.ok).toBe(false);
  });

  it("parses CSV and dry-runs import without inventing citations", () => {
    const csv = [
      "slug,category,citationLabel,citationUrl,summary,practicalTakeaway,limitations,evidenceLabel",
      "ok-entry,recovery,Author (2021). Sleep and performance.,https://doi.org/10.0000/ok,Summary text,Sleep matters,Small sample,moderate_evidence",
      "bad-entry,recovery,,,Missing citation row,Takeaway,Limits,limited_evidence",
    ].join("\n");

    const rows = parseResearchLibraryCsv(csv);
    expect(rows).toHaveLength(2);

    const imported = importResearchLibraryRows(rows, { dryRun: true });
    expect(imported.dryRun).toBe(true);
    expect(imported.accepted).toHaveLength(1);
    expect(imported.rejected).toHaveLength(1);
    expect(imported.rejected[0]?.reason).toMatch(/citationLabel/i);
  });

  it("rejects invalid citation URLs instead of inventing fixes", () => {
    const result = validateResearchLibraryRow(
      {
        category: "nutrition",
        citationLabel: "Author (2018). Protein timing.",
        citationUrl: "not-a-url",
        summary: "Summary",
        practicalTakeaway: "Takeaway",
        limitations: "Limits",
        evidenceLabel: "limited_evidence",
      },
      0,
    );
    expect(result.ok).toBe(false);
  });
});
