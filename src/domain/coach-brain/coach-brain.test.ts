import { describe, expect, it } from "vitest";
import {
  evaluateCoachBrainRules,
  validateCoachBrainRecommendations,
  stubCoachBrainReasoningAdapter,
  COACH_BRAIN_STUB_ADAPTER_ID,
  type CoachBrainToolName,
} from "@/domain/coach-brain";
import type {
  AthleteProfileToolData,
  CoachBrainRecommendation,
  CoachBrainToolBag,
  CoachBrainToolResult,
  ProgramContextToolData,
  RecentTrainingToolData,
  RecoveryTrendToolData,
  TechniqueTrendToolData,
} from "@/domain/coach-brain/types";
import type { AthleteState } from "@/domain/performance-intelligence";
import { assembleAthleteState } from "@/domain/performance-intelligence";
import { computeAthleteScores } from "@/domain/scoring";
import type { ScoringSnapshot } from "@/domain/scoring/types";
import type { IntelligenceParts } from "@/domain/performance-intelligence";

function emptyTool<T>(
  tool: CoachBrainToolName,
  data: T | null,
  missing: string[] = [],
): CoachBrainToolResult<T> {
  return {
    tool,
    ok: data != null,
    data,
    missing,
    fetchedAt: new Date(),
  };
}

describe("coach brain rules + safety", () => {
  it("emits insufficient-state guidance when AthleteState is missing", () => {
    const tools: CoachBrainToolBag = {
      getAthleteProfile: emptyTool<AthleteProfileToolData>(
        "getAthleteProfile",
        null,
        ["profile"],
      ),
      getRecentTraining: emptyTool<RecentTrainingToolData>(
        "getRecentTraining",
        null,
        ["sessions"],
      ),
      getTechniqueTrend: emptyTool<TechniqueTrendToolData>(
        "getTechniqueTrend",
        null,
        ["technique"],
      ),
      getRecoveryTrend: emptyTool<RecoveryTrendToolData>(
        "getRecoveryTrend",
        null,
        ["recovery"],
      ),
      getProgramContext: emptyTool<ProgramContextToolData>(
        "getProgramContext",
        null,
        ["program"],
      ),
      getGoalProgress: emptyTool("getGoalProgress", {
        goalTitle: null,
        statusLabel: "no_goal",
        summary: "none",
      }),
      getRecentPRs: emptyTool("getRecentPRs", { lifts: [] }),
      getNutritionSummary: emptyTool("getNutritionSummary", {
        connected: false,
        hasTargets: false,
        label: "n/a",
      }),
      getAthleteState: emptyTool<AthleteState>("getAthleteState", null, [
        "AthleteState",
      ]),
    };

    const hits = evaluateCoachBrainRules(tools);
    expect(hits[0]?.ruleId).toBe("insufficient_athlete_state");
    expect(hits[0]?.recommendedAction.requiresExplicitConfirmation).toBe(false);
  });

  it("requires confirmation for adaptation-style actions and blocks forbidden claims", async () => {
    const now = new Date("2026-07-21T12:00:00.000Z");
    const snapshot: ScoringSnapshot = {
      now,
      lifts: [],
      techniqueAnalyses: [],
      recoveryEntries: [
        { readiness: 40, recordedAt: now, source: "reported" },
        {
          readiness: 42,
          recordedAt: new Date(now.getTime() - 86400000),
          source: "reported",
        },
        {
          readiness: 45,
          recordedAt: new Date(now.getTime() - 2 * 86400000),
          source: "reported",
        },
      ],
      sessions: [],
      activeProgramId: "p1",
      activeProgramName: "Block",
      bodyweightKg: 80,
      experienceLevel: "intermediate",
      primaryDiscipline: "powerlifting",
    };
    const scores = computeAthleteScores(snapshot);
    const parts: IntelligenceParts = {
      athleteProfileId: "ap1",
      now,
      scores,
      strengthTrend: null,
      techniqueSamples: [],
      bodyweightPoints: [],
      recoveryReadiness: snapshot.recoveryEntries.map((r) => ({
        at: r.recordedAt,
        readiness: r.readiness,
      })),
      recentVolumeKg: 0,
      priorVolumeKg: 0,
      loadSpike: {
        flagged: true,
        ratio: 2,
        recentAvgDailyVolumeKg: 2000,
        baselineAvgDailyVolumeKg: 800,
        label: "spike",
        explanation: "volume spike",
      },
      goal: { title: "Total", category: "performance", targetValue: null },
      activeProgramName: "Block",
      nutrition: { connected: false, hasTargets: false },
      signalTimestamps: [{ kind: "recovery_checkin", at: now }],
    };
    const state = assembleAthleteState(parts);

    const tools: CoachBrainToolBag = {
      getAthleteProfile: emptyTool("getAthleteProfile", {
        displayName: "A",
        discipline: "powerlifting",
        experienceLevel: "intermediate",
        units: "kg",
      }),
      getRecentTraining: emptyTool("getRecentTraining", {
        completedLast7Days: 2,
        completedLast28Days: 8,
        recentSessions: [],
      }),
      getTechniqueTrend: emptyTool<TechniqueTrendToolData>(
        "getTechniqueTrend",
        null,
        ["tech"],
      ),
      getRecoveryTrend: emptyTool("getRecoveryTrend", {
        statusLabel: state.recoveryStatus.value?.statusLabel ?? "low",
        latestReadiness: 40,
        score: state.recoveryStatus.value?.score ?? null,
        summary: state.recoveryStatus.summary,
        checkInsLast7Days: 3,
      }),
      getProgramContext: emptyTool("getProgramContext", {
        hasActiveProgram: true,
        activeProgramName: "Block",
        adherenceScore: null,
        summary: "active",
      }),
      getGoalProgress: emptyTool("getGoalProgress", {
        goalTitle: "Total",
        statusLabel: "on_file",
        summary: "goal",
      }),
      getRecentPRs: emptyTool("getRecentPRs", { lifts: [] }),
      getNutritionSummary: emptyTool("getNutritionSummary", {
        connected: false,
        hasTargets: false,
        label: "n/a",
      }),
      getAthleteState: emptyTool("getAthleteState", state),
    };

    const hits = evaluateCoachBrainRules(tools);
    expect(hits.some((h) => h.ruleId === "load_spike_review_recovery")).toBe(
      true,
    );

    const reasoned = await stubCoachBrainReasoningAdapter.reason({
      ruleHits: hits,
      maxRecommendations: 3,
    });
    expect(reasoned.adapterId).toBe(COACH_BRAIN_STUB_ADAPTER_ID);
    expect(reasoned.recommendations[0]?.reasoningSummary.length).toBeGreaterThan(
      0,
    );
    expect(
      Object.prototype.hasOwnProperty.call(
        reasoned.recommendations[0],
        "chainOfThought",
      ),
    ).toBe(false);

    const bad: CoachBrainRecommendation = {
      ...reasoned.recommendations[0]!,
      recommendation: "I diagnose your injury and auto-apply a deload.",
      recommendedAction: {
        kind: "confirm_adaptation",
        label: "Apply now",
        href: "/app/programs",
        requiresExplicitConfirmation: false,
      },
    };
    const blocked = validateCoachBrainRecommendations([bad]);
    expect(blocked.ok).toBe(false);
    expect(blocked.flags.some((f) => f.severity === "block")).toBe(true);

    const good = validateCoachBrainRecommendations(reasoned.recommendations);
    expect(good.ok).toBe(true);
    expect(
      good.sanitized
        .filter((r) => r.recommendedAction.kind === "confirm_adaptation")
        .every((r) => r.recommendedAction.requiresExplicitConfirmation),
    ).toBe(true);
  });
});
