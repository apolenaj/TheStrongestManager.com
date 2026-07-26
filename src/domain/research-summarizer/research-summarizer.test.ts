import { afterEach, describe, expect, it } from "vitest";
import {
  RESEARCH_SUMMARIZER_HONESTY,
  RESEARCH_SUMMARIZER_OUTPUT_FIELDS,
  applyResearchSummarizerReview,
  canPublishResearchSummary,
  clearResearchSummarizerDraftsForTests,
  createResearchSummarizerDraft,
  listResearchSummarizerDrafts,
  markDraftUnderReview,
  resetResearchSummarizerAdapterForTests,
  validateVerifiedPaperInput,
} from "@/domain/research-summarizer";

const SAMPLE_TEXT = `
The purpose of this study was to examine whether progressive overload increases
hypertrophy in trained lifters. Methods: forty participants completed a
12-week randomized resistance training protocol. Results: muscle thickness
increased significantly in the overload group versus control. Limitations
include a small sample of recreational athletes and short follow-up.
`.trim();

describe("research-summarizer", () => {
  afterEach(() => {
    clearResearchSummarizerDraftsForTests();
    resetResearchSummarizerAdapterForTests();
  });

  it("requires all five output fields", () => {
    expect([...RESEARCH_SUMMARIZER_OUTPUT_FIELDS]).toEqual([
      "researchQuestion",
      "methods",
      "findings",
      "limitations",
      "practicalRelevance",
    ]);
  });

  it("rejects missing citationLabel — never invent from model memory", () => {
    const result = validateVerifiedPaperInput({
      citationLabel: "",
      abstractOrText: SAMPLE_TEXT,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.rejection.reason).toMatch(/citationLabel|model memory/i);
    }
  });

  it("rejects thin paper text instead of inventing content", () => {
    const result = validateVerifiedPaperInput({
      citationLabel: "Author (2020). Real paper. Journal, 1(1), 1–2.",
      abstractOrText: "Too short",
    });
    expect(result.ok).toBe(false);
  });

  it("creates an AI draft from verified input without inventing citation", async () => {
    const citation =
      "Schoenfeld et al. (example). Verified citation supplied by editor.";
    const created = await createResearchSummarizerDraft({
      citationLabel: citation,
      citationUrl: "https://doi.org/10.0000/example",
      abstractOrText: SAMPLE_TEXT,
      category: "hypertrophy",
    });

    expect(created.ok).toBe(true);
    if (!created.ok) return;

    expect(created.draft.isAiGenerated).toBe(true);
    expect(created.draft.status).toBe("ai_draft");
    expect(created.draft.citationSource).toBe("verified_input");
    expect(created.draft.citationLabel).toBe(citation);
    expect(created.draft.fields.researchQuestion.length).toBeGreaterThan(0);
    expect(created.draft.fields.methods.length).toBeGreaterThan(0);
    expect(created.draft.fields.findings.length).toBeGreaterThan(0);
    expect(created.draft.fields.limitations.length).toBeGreaterThan(0);
    expect(created.draft.fields.practicalRelevance.length).toBeGreaterThan(0);
    expect(canPublishResearchSummary(created.draft)).toBe(false);
  });

  it("blocks public publication until human approval", async () => {
    const created = await createResearchSummarizerDraft({
      citationLabel: "Author (2021). Verified title. Journal, 2(2), 10–20.",
      abstractOrText: SAMPLE_TEXT,
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const underReview = markDraftUnderReview(created.draft);
    expect(canPublishResearchSummary(underReview)).toBe(false);

    const approved = applyResearchSummarizerReview({
      draft: underReview,
      decision: "approve",
      note: "Checked against PDF",
    });
    expect(approved.status).toBe("approved");
    expect(canPublishResearchSummary(approved)).toBe(true);

    const rejected = applyResearchSummarizerReview({
      draft: created.draft,
      decision: "reject",
      note: "Citation incomplete",
    });
    expect(canPublishResearchSummary(rejected)).toBe(false);
  });

  it("stores drafts in the review queue", async () => {
    await createResearchSummarizerDraft({
      citationLabel: "Author A (2019). Paper A.",
      abstractOrText: SAMPLE_TEXT,
    });
    expect(listResearchSummarizerDrafts()).toHaveLength(1);
  });

  it("states honesty about never inventing citations", () => {
    expect(RESEARCH_SUMMARIZER_HONESTY.join(" ")).toMatch(/never invent/i);
    expect(RESEARCH_SUMMARIZER_HONESTY.join(" ")).toMatch(/model memory/i);
    expect(RESEARCH_SUMMARIZER_HONESTY.join(" ")).toMatch(/reviewed/i);
  });
});
