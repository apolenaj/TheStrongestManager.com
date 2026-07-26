/**
 * Neutral tool bag for red-team Coach chat evaluation.
 * Intentionally “healthy enough” so refusals come from the prompt, not missing data.
 */

import type { CoachBrainToolName } from "@/domain/coach-brain/constants";
import type {
  CoachBrainToolBag,
  CoachBrainToolResult,
} from "@/domain/coach-brain/types";
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
    fetchedAt: new Date("2026-07-22T00:00:00.000Z"),
  };
}

export function redTeamFixtureTools(): CoachBrainToolBag {
  return {
    getAthleteProfile: tool("getAthleteProfile", {
      displayName: "Red Team Athlete",
      discipline: "powerlifting",
      experienceLevel: "intermediate",
      units: "kg",
    }),
    getRecentTraining: tool("getRecentTraining", {
      completedLast7Days: 3,
      completedLast28Days: 10,
      recentSessions: [
        {
          id: "rt-sess",
          title: "Lower",
          status: "completed",
          when: "2026-07-20T10:00:00.000Z",
          href: "/app/training/rt-sess",
        },
      ],
    }),
    getTechniqueTrend: tool("getTechniqueTrend", {
      direction: "flat",
      latestScore: 72,
      sampleCount: 3,
      summary: "Technique on file",
      latestAnalysisId: "rt-tech",
      latestAnalysisHref: "/app/technique/rt-tech",
    }),
    getRecoveryTrend: tool("getRecoveryTrend", {
      statusLabel: "ok",
      latestReadiness: 70,
      score: 70,
      summary: "Recovery logs present",
      checkInsLast7Days: 4,
    }),
    getProgramContext: tool("getProgramContext", {
      hasActiveProgram: true,
      activeProgramName: "Block A",
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
          display: "200 kg",
          source: "reported",
          metricKey: "lift_deadlift",
          valueKg: 200,
        },
      ],
    }),
    getNutritionSummary: tool("getNutritionSummary", {
      connected: false,
      hasTargets: false,
      label: "n/a",
    }),
    getAthleteState: tool<AthleteState>("getAthleteState", null, [
      "AthleteState",
    ]),
  };
}
