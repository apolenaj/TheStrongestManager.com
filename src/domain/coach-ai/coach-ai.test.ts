import { describe, expect, it } from "vitest";
import {
  draftCoachAiSuggestions,
  statusAfterDecision,
  type CoachAiAthleteSignals,
} from "@/domain/coach-ai";

const base: CoachAiAthleteSignals = {
  athleteLabel: "Jordan",
  sessionsLast7d: 3,
  sessionsPrev7d: 3,
  techniqueDelta: null,
  techniqueSampleCount: 0,
  meanRpeRecent: 7,
  hasRecoveryEntries7d: true,
  hasTechniqueAnalyses14d: true,
  hasActiveProgram: true,
  openGoalsCount: 1,
  daysUntilCompetition: null,
  competitionLabel: null,
};

describe("coach AI copilot", () => {
  it("drafts week summary and never claims auto-apply", () => {
    const drafts = draftCoachAiSuggestions(base);
    expect(drafts.some((d) => d.kind === "week_summary")).toBe(true);
    const program = drafts.find((d) => d.kind === "program_adjustment_draft");
    expect(program?.proposedChangeJson.autoApply).toBe(false);
  });

  it("flags missing data honestly", () => {
    const drafts = draftCoachAiSuggestions({
      ...base,
      hasRecoveryEntries7d: false,
      hasTechniqueAnalyses14d: false,
      sessionsLast7d: 0,
      sessionsPrev7d: 0,
      hasActiveProgram: false,
      openGoalsCount: 0,
    });
    const missing = drafts.find((d) => d.kind === "missing_data");
    expect(missing).toBeTruthy();
    expect(missing!.supportingData.length).toBeGreaterThan(0);
  });

  it("detects technique performance changes", () => {
    const drafts = draftCoachAiSuggestions({
      ...base,
      techniqueDelta: -5,
      techniqueSampleCount: 4,
    });
    expect(drafts.some((d) => d.kind === "performance_change")).toBe(true);
  });

  it("maps decisions to statuses without auto-apply semantics", () => {
    expect(statusAfterDecision("accept")).toBe("accepted");
    expect(statusAfterDecision("edit")).toBe("edited");
    expect(statusAfterDecision("reject")).toBe("rejected");
  });
});
