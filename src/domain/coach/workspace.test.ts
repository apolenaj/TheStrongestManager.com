import { describe, expect, it } from "vitest";
import {
  canViewWorkspaceSection,
  isCoachModificationKind,
  SUGGESTION_AUTHORSHIP_LABELS,
} from "@/domain/coach/workspace";

describe("coach athlete workspace", () => {
  it("gates recovery behind recovery scope", () => {
    expect(
      canViewWorkspaceSection(["training", "programs"], "recovery"),
    ).toBe(false);
    expect(canViewWorkspaceSection(["recovery"], "recovery")).toBe(true);
  });

  it("allows overview and notes with any active grant scopes", () => {
    expect(canViewWorkspaceSection([], "overview")).toBe(true);
    expect(canViewWorkspaceSection([], "notes")).toBe(true);
  });

  it("keeps AI and human coach authorship labels distinct", () => {
    expect(SUGGESTION_AUTHORSHIP_LABELS.human_coach).toBe("Human coach");
    expect(SUGGESTION_AUTHORSHIP_LABELS.ai_engine).toBe("AI suggestion");
    expect(SUGGESTION_AUTHORSHIP_LABELS.ai_engine).not.toBe(
      SUGGESTION_AUTHORSHIP_LABELS.human_coach,
    );
  });

  it("validates modification kinds", () => {
    expect(isCoachModificationKind("program_change")).toBe(true);
    expect(isCoachModificationKind("hack")).toBe(false);
  });
});
