/**
 * Offline eval harness — runs Coach AI drafts through rubrics.
 */

import { draftCoachAiSuggestions } from "@/domain/coach-ai";
import { runAllRubrics } from "@/domain/ai-eval/rubrics";
import { COACH_AI_EVAL_SCENARIOS } from "@/domain/ai-eval/scenarios";
import type {
  AiEvalScenario,
  AiEvalScenarioResult,
} from "@/domain/ai-eval/types";

export function evaluateCoachAiScenario(
  scenario: AiEvalScenario,
): AiEvalScenarioResult {
  const drafts = draftCoachAiSuggestions(scenario.signals);
  const dimensions = runAllRubrics(scenario, drafts);
  return {
    scenarioId: scenario.id,
    title: scenario.title,
    passed: dimensions.every((d) => d.passed),
    drafts,
    dimensions,
  };
}

export function runCoachAiEvalSuite(): {
  passed: boolean;
  results: AiEvalScenarioResult[];
} {
  const results = COACH_AI_EVAL_SCENARIOS.map(evaluateCoachAiScenario);
  return {
    passed: results.every((r) => r.passed),
    results,
  };
}
