import { describe, expect, it } from "vitest";
import {
  buildCoachChatAnswer,
  classifyCoachChatIntent,
} from "@/domain/coach-brain/chat";
import type {
  CoachBrainToolBag,
  CoachBrainToolResult,
} from "@/domain/coach-brain/types";
import type { CoachBrainToolName } from "@/domain/coach-brain/constants";
import type { AthleteState } from "@/domain/performance-intelligence";

function tool<T>(
  name: CoachBrainToolName,
  data: T | null,
  missing: string[] = [],
): CoachBrainToolResult<T> {
  return {
    tool: name,
    ok: data != null,
    data,
    missing,
    fetchedAt: new Date(),
  };
}

function baseTools(
  overrides: Partial<CoachBrainToolBag> = {},
): CoachBrainToolBag {
  return {
    getAthleteProfile: tool("getAthleteProfile", {
      displayName: "A",
      discipline: "powerlifting",
      experienceLevel: "intermediate",
      units: "kg",
    }),
    getRecentTraining: tool("getRecentTraining", {
      completedLast7Days: 1,
      completedLast28Days: 4,
      recentSessions: [
        {
          id: "sess1",
          title: "Lower day",
          status: "completed",
          when: "2026-07-20T10:00:00.000Z",
          href: "/app/training/sess1",
        },
      ],
    }),
    getTechniqueTrend: tool("getTechniqueTrend", {
      direction: "flat",
      latestScore: 74,
      sampleCount: 2,
      summary: "Technique on file",
      latestAnalysisId: "tech1",
      latestAnalysisHref: "/app/technique/tech1",
    }),
    getRecoveryTrend: tool("getRecoveryTrend", {
      statusLabel: "insufficient",
      latestReadiness: null,
      score: null,
      summary: "Thin recovery logs",
      checkInsLast7Days: 2,
    }),
    getProgramContext: tool("getProgramContext", {
      hasActiveProgram: true,
      activeProgramName: "Block",
      adherenceScore: null,
      summary: "active",
    }),
    getGoalProgress: tool("getGoalProgress", {
      goalTitle: "Total",
      statusLabel: "on_file",
      summary: "goal",
    }),
    getRecentPRs: tool("getRecentPRs", {
      lifts: [
        {
          label: "Deadlift",
          display: "210 kg",
          source: "reported",
          metricKey: "lift_deadlift",
          valueKg: 210,
        },
        {
          label: "Bench",
          display: "120 kg",
          source: "reported",
          metricKey: "lift_bench",
          valueKg: 120,
        },
      ],
    }),
    getNutritionSummary: tool("getNutritionSummary", {
      connected: false,
      hasTargets: false,
      label: "n/a",
    }),
    getAthleteState: tool<AthleteState>("getAthleteState", null, ["state"]),
    ...overrides,
  };
}

describe("coach chat grounding", () => {
  it("classifies example coaching questions", () => {
    expect(
      classifyCoachChatIntent("Should I increase my deadlift next week?"),
    ).toBe("increase_deadlift");
    expect(
      classifyCoachChatIntent("Why did my bench stop progressing?"),
    ).toBe("bench_stall");
    expect(classifyCoachChatIntent("Should I deload?")).toBe("deload");
    expect(
      classifyCoachChatIntent("Which accessory should I change?"),
    ).toBe("accessory_change");
    expect(
      classifyCoachChatIntent(
        "How am I progressing toward a 300 kg deadlift?",
      ),
    ).toBe("goal_deadlift_300");
  });

  it("does not claim poor recovery when check-ins are thin", () => {
    const answer = buildCoachChatAnswer({
      question: "Should I deload?",
      tools: baseTools(),
    });
    expect(answer.content).toMatch(/only 2 recovery check-in/i);
    expect(answer.content).not.toMatch(/recovery has been poor/i);
    expect(answer.dataRefs.some((r) => r.kind === "progress")).toBe(true);
    expect(
      answer.dataRefs.some(
        (r) => r.kind === "training_session" && r.href?.includes("/app/training/"),
      ),
    ).toBe(true);
  });

  it("links technique and progress for bench stall questions", () => {
    const answer = buildCoachChatAnswer({
      question: "Why did my bench stop progressing?",
      tools: baseTools(),
    });
    expect(answer.dataRefs.some((r) => r.kind === "technique_analysis")).toBe(
      true,
    );
    expect(answer.dataRefs.some((r) => r.href === "/app/progress")).toBe(true);
    expect(answer.content).toMatch(/not enough data to conclude that recovery/i);
  });

  it("reports deadlift gap toward 300 kg from logged PR only", () => {
    const answer = buildCoachChatAnswer({
      question: "How am I progressing toward a 300 kg deadlift?",
      tools: baseTools(),
    });
    expect(answer.content).toMatch(/210 kg/);
    expect(answer.content).toMatch(/90 kg/);
    expect(answer.content).toMatch(/not a timeline prediction/i);
  });

  it("refuses load increases when pain-safe mode is active", () => {
    const answer = buildCoachChatAnswer({
      question: "Should I increase my deadlift?",
      tools: baseTools(),
      painSafeModeActive: true,
    });
    expect(answer.content).toMatch(/will not recommend increasing load/i);
    expect(answer.content).toMatch(/qualified medical/i);
    expect(answer.content).toMatch(/does not diagnose/i);
    expect(answer.content).not.toMatch(/small increase can be considered/i);
  });
});
