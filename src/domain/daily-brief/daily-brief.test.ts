import { describe, expect, it } from "vitest";
import {
  DAILY_BRIEF_MAX_INSIGHTS,
  buildDailyCoachingBrief,
  deriveTechniqueFocusFromAssessments,
} from "@/domain/daily-brief";

describe("daily coaching brief", () => {
  it("prioritizes at most three insights", () => {
    const brief = buildDailyCoachingBrief({
      dateKey: "2026-07-21",
      workout: {
        activeSessionId: null,
        prescriptionTitle: "Heavy deadlift",
        prescriptionGoal: "Strength",
        programName: "Block A",
        emptyReason: null,
        hasDeadliftToday: true,
        techniqueCue: null,
      },
      technique: {
        latestAnalysisId: "a1",
        latestAnalysisHref: "/app/technique/a1",
        sampleCount: 2,
        focusLabel: "Deadlift setup consistency",
        why: "Your last two analyses showed increasing hip-position variation.",
        cameraAngle: "forty_five",
        variationIncreasing: true,
      },
      signals: {
        loadSpikeFlagged: true,
        recoveryStatusLabel: "moderate",
        latestReadiness: 70,
        recoveryCheckInsLast7Days: 5,
        techniqueTrendDirection: "down",
        techniqueSampleCount: 2,
        goalTitle: "300 kg deadlift",
        goalStatusLabel: "needs_attention",
        goalSummary: "Gap remains on file",
        dataConfidence: "medium",
      },
    });

    expect(brief.insights.length).toBeLessThanOrEqual(DAILY_BRIEF_MAX_INSIGHTS);
    expect(brief.insights[0]?.kind).toBe("warning");
    expect(brief.lines.some((l) => l.kind === "primary_focus")).toBe(true);
    expect(brief.lines.find((l) => l.kind === "training")?.body).toMatch(
      /Heavy deadlift/,
    );
    expect(brief.lines.find((l) => l.kind === "action")?.body).toMatch(
      /Review recovery/,
    );
    expect(brief.lines.some((l) => l.kind === "warning")).toBe(true);
  });

  it("does not claim poor recovery when check-ins are thin", () => {
    const brief = buildDailyCoachingBrief({
      dateKey: "2026-07-21",
      workout: {
        activeSessionId: null,
        prescriptionTitle: "Upper",
        prescriptionGoal: null,
        programName: null,
        emptyReason: null,
        hasDeadliftToday: false,
        techniqueCue: null,
      },
      technique: null,
      signals: {
        loadSpikeFlagged: false,
        recoveryStatusLabel: "insufficient",
        latestReadiness: null,
        recoveryCheckInsLast7Days: 2,
        techniqueTrendDirection: null,
        techniqueSampleCount: 0,
        goalTitle: null,
        goalStatusLabel: "no_goal",
        goalSummary: null,
        dataConfidence: "low",
      },
    });

    const recovery = brief.lines.find((l) => l.kind === "recovery");
    expect(recovery?.body).toMatch(/only 2 recovery check-in/i);
    expect(recovery?.body).not.toMatch(/poor/i);
    expect(recovery?.body).not.toMatch(/No major issue detected/);
  });

  it("matches the example composition when technique worsens", () => {
    const technique = deriveTechniqueFocusFromAssessments({
      analyses: [
        {
          id: "a2",
          href: "/app/technique/a2",
          cameraAngle: "forty_five",
          components: [
            { id: "setup_consistency", label: "Setup consistency", score: 48 },
            { id: "lockout", label: "Lockout", score: 80 },
          ],
        },
        {
          id: "a1",
          href: "/app/technique/a1",
          cameraAngle: "forty_five",
          components: [
            { id: "setup_consistency", label: "Setup consistency", score: 62 },
            { id: "lockout", label: "Lockout", score: 78 },
          ],
        },
      ],
    });

    expect(technique?.focusLabel).toBe("Deadlift setup consistency");
    expect(technique?.why).toMatch(/increasing hip-position variation/i);
    expect(technique?.variationIncreasing).toBe(true);

    const brief = buildDailyCoachingBrief({
      dateKey: "2026-07-21",
      workout: {
        activeSessionId: null,
        prescriptionTitle: "Heavy deadlift today",
        prescriptionGoal: null,
        programName: null,
        emptyReason: null,
        hasDeadliftToday: true,
        techniqueCue: null,
      },
      technique,
      signals: {
        loadSpikeFlagged: false,
        recoveryStatusLabel: "moderate",
        latestReadiness: 72,
        recoveryCheckInsLast7Days: 4,
        techniqueTrendDirection: "flat",
        techniqueSampleCount: 2,
        goalTitle: null,
        goalStatusLabel: "no_goal",
        goalSummary: null,
        dataConfidence: "medium",
      },
    });

    expect(brief.lines.find((l) => l.kind === "primary_focus")?.body).toBe(
      "Deadlift setup consistency",
    );
    expect(brief.lines.find((l) => l.kind === "why")?.body).toMatch(
      /hip-position variation/i,
    );
    expect(brief.lines.find((l) => l.kind === "recovery")?.body).toMatch(
      /No major issue detected/,
    );
    expect(brief.lines.find((l) => l.kind === "action")?.body).toMatch(/45°/);
    expect(brief.insights.length).toBeLessThanOrEqual(3);
  });
});
