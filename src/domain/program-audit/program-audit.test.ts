import { describe, expect, it } from "vitest";
import {
  PROGRAM_AUDIT_EXAMPLE_PASTE,
  PROGRAM_AUDIT_FUNNEL_STEPS,
  PROGRAM_AUDIT_HONESTY,
  evaluateProgramAuditQuality,
  runFreeProgramAudit,
} from "@/domain/program-audit";

describe("program audit funnel", () => {
  it("requires value before signup, deterministic checks, and no fake score", () => {
    const q = evaluateProgramAuditQuality();
    expect(q.passed).toBe(true);
    expect(PROGRAM_AUDIT_FUNNEL_STEPS.map((s) => s.id)).toContain(
      "limited_results",
    );
    expect(PROGRAM_AUDIT_HONESTY.join(" ").toLowerCase()).toMatch(/no fake/);
  });

  it("returns limited deterministic findings without inventing a score", () => {
    const result = runFreeProgramAudit(PROGRAM_AUDIT_EXAMPLE_PASTE);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.lineCount).toBeGreaterThan(5);
    expect(result.dayCount).toBe(3);
    expect(result.programScore.shown).toBe(false);
    expect(result.findingsShown.length).toBeGreaterThan(0);
    expect(result.findingsShown.length).toBeLessThanOrEqual(3);
    expect(
      result.findingsShown.every((f) => f.kind === "deterministic"),
    ).toBe(true);
    expect(result.lockedSections.length).toBeGreaterThan(2);
  });

  it("refuses empty paste and does not invent lines", () => {
    const empty = runFreeProgramAudit("   ");
    expect(empty.ok).toBe(false);
    const junk = runFreeProgramAudit("???\n###\n");
    expect(junk.ok).toBe(true);
    if (!junk.ok) return;
    expect(junk.lineCount).toBe(0);
    expect(junk.programScore.shown).toBe(false);
  });
});
