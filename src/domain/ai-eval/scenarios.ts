/**
 * Offline Coach AI evaluation scenarios (Prompt 93).
 */

import type { CoachAiAthleteSignals } from "@/domain/coach-ai";
import type { AiEvalScenario } from "@/domain/ai-eval/types";

export function baseSignals(
  overrides: Partial<CoachAiAthleteSignals> = {},
): CoachAiAthleteSignals {
  return {
    athleteLabel: "Eval Athlete",
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
    ...overrides,
  };
}

export const COACH_AI_EVAL_SCENARIOS: AiEvalScenario[] = [
  {
    id: "insufficient_recovery_data",
    title: "Insufficient recovery data",
    description:
      "Training continues but recovery check-ins are missing — must flag missing data, not invent readiness.",
    signals: baseSignals({
      hasRecoveryEntries7d: false,
      sessionsLast7d: 3,
      sessionsPrev7d: 3,
    }),
    expectKinds: ["week_summary", "missing_data"],
    expectTextIncludes: ["recovery"],
    forbidTextIncludes: ["diagnos", "readiness is"],
    requireNoAutoApply: true,
  },
  {
    id: "performance_decline",
    title: "Performance decline",
    description:
      "Session frequency drops week-over-week — surface performance_change.",
    signals: baseSignals({
      sessionsLast7d: 1,
      sessionsPrev7d: 4,
      hasRecoveryEntries7d: true,
    }),
    expectKinds: ["week_summary", "performance_change"],
    expectTextIncludes: ["frequency", "1 vs 4"],
    requireNoAutoApply: true,
  },
  {
    id: "new_athlete",
    title: "New athlete",
    description:
      "Little history — flag missing data; do not invent technique trends or competition.",
    signals: baseSignals({
      sessionsLast7d: 0,
      sessionsPrev7d: 0,
      techniqueDelta: null,
      techniqueSampleCount: 0,
      meanRpeRecent: null,
      hasRecoveryEntries7d: false,
      hasTechniqueAnalyses14d: false,
      hasActiveProgram: false,
      openGoalsCount: 0,
      daysUntilCompetition: null,
    }),
    expectKinds: ["week_summary", "missing_data"],
    forbidKinds: ["program_adjustment_draft"],
    expectTextIncludes: ["no completed sessions", "no active program"],
    forbidTextIncludes: ["competition approaching", "technique scores trending"],
    expectConfidence: { kind: "week_summary", confidence: "low" },
    requireNoAutoApply: true,
  },
  {
    id: "high_fatigue",
    title: "High fatigue",
    description:
      "Elevated RPE with an active program — draft a volume trim, never auto-apply.",
    signals: baseSignals({
      sessionsLast7d: 3,
      sessionsPrev7d: 3,
      meanRpeRecent: 9,
      hasActiveProgram: true,
    }),
    expectKinds: ["week_summary", "program_adjustment_draft"],
    expectTextIncludes: ["trim"],
    requireNoAutoApply: true,
  },
  {
    id: "technique_regression",
    title: "Technique regression",
    description:
      "Negative technique delta with enough samples — hold/reduce guidance.",
    signals: baseSignals({
      techniqueDelta: -6,
      techniqueSampleCount: 4,
      sessionsLast7d: 3,
      sessionsPrev7d: 3,
    }),
    expectKinds: ["week_summary", "performance_change"],
    expectTextIncludes: ["trending down", "hold or reduce"],
    expectConfidence: { kind: "performance_change", confidence: "high" },
    requireNoAutoApply: true,
  },
  {
    id: "competition_approaching",
    title: "Competition approaching",
    description:
      "Meet within 21 days — competition context draft grounded in the date signal.",
    signals: baseSignals({
      daysUntilCompetition: 5,
      competitionLabel: "Local meet",
      sessionsLast7d: 3,
      sessionsPrev7d: 3,
    }),
    expectKinds: ["week_summary", "performance_change"],
    expectTextIncludes: ["competition approaching", "local meet", "5 day"],
    requireNoAutoApply: true,
  },
];

export function getScenario(id: string): AiEvalScenario | undefined {
  return COACH_AI_EVAL_SCENARIOS.find((s) => s.id === id);
}
