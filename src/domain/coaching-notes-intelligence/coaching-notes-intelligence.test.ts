import { describe, expect, it } from "vitest";
import {
  COACHING_NOTES_FORBIDDEN_UNRELATED_USES,
  COACHING_NOTES_INTELLIGENCE_HONESTY,
  COACHING_NOTES_SOURCE_LABELS,
  assembleCoachNotesAiSummary,
  notesAllowedForUnrelatedProductUse,
  notesEligibleForAiSummary,
  toCoachNoteDisplayItem,
} from "@/domain/coaching-notes-intelligence";

function note(
  overrides: Partial<{
    id: string;
    isPrivate: boolean;
    allowAiSummarize: boolean;
    status: string;
    body: string;
    section: string;
  }> = {},
) {
  return {
    id: overrides.id ?? "n1",
    section: overrides.section ?? "training",
    body: overrides.body ?? "Keep squat depth honest this week.",
    isPrivate: overrides.isPrivate ?? false,
    allowAiSummarize: overrides.allowAiSummarize ?? true,
    status: overrides.status ?? "active",
    createdAt: new Date().toISOString(),
    coachUserId: "coach1",
  };
}

describe("coaching-notes-intelligence", () => {
  it("labels sources as Coach note and AI summary", () => {
    expect(COACHING_NOTES_SOURCE_LABELS.coach_note).toBe("Coach note");
    expect(COACHING_NOTES_SOURCE_LABELS.ai_summary).toBe("AI summary");
    expect(toCoachNoteDisplayItem({
      id: "1",
      section: "notes",
      body: "Hello",
      isPrivate: false,
      createdAt: new Date().toISOString(),
    }).sourceLabel).toBe("Coach note");
  });

  it("never includes private notes in AI eligibility or unrelated product use", () => {
    const notes = [
      note({ id: "a", isPrivate: false }),
      note({ id: "b", isPrivate: true, body: "Sensitive clinical detail" }),
    ];
    expect(notesEligibleForAiSummary(notes).map((n) => n.id)).toEqual(["a"]);
    expect(notesAllowedForUnrelatedProductUse(notes).map((n) => n.id)).toEqual([
      "a",
    ]);
    expect(COACHING_NOTES_FORBIDDEN_UNRELATED_USES).toContain(
      "training_consistency_heuristics",
    );
  });

  it("assembles an AI summary labelled as AI summary, citing eligible notes only", () => {
    const result = assembleCoachNotesAiSummary([
      note({ id: "a", section: "training", body: "Add a pause to the second squat set." }),
      note({ id: "b", isPrivate: true, body: "Private medical aside" }),
      note({ id: "c", section: "recovery", body: "Sleep looked better Tuesday." }),
    ]);
    expect(result).not.toHaveProperty("ok");
    if ("ok" in result) throw new Error("expected summary");
    expect(result.sourceLabel).toBe("AI summary");
    expect(result.isAiGenerated).toBe(true);
    expect(result.sourceNoteIds).toEqual(["a", "c"]);
    expect(result.excludedPrivateCount).toBe(1);
    expect(result.body).not.toMatch(/Private medical/);
    expect(result.body).toMatch(/AI summary/i);
    expect(COACHING_NOTES_INTELLIGENCE_HONESTY.join(" ")).toMatch(
      /Private notes/i,
    );
  });

  it("refuses to summarize when only private notes exist", () => {
    const result = assembleCoachNotesAiSummary([
      note({ isPrivate: true, body: "Secret" }),
    ]);
    expect(result).toMatchObject({ ok: false });
  });
});
