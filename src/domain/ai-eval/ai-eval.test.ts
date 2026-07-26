import { describe, expect, it } from "vitest";
import {
  AI_EVAL_DIMENSIONS,
  AI_EVAL_HONESTY,
  AI_EVAL_SCENARIO_IDS,
  COACH_AI_EVAL_SCENARIOS,
  evaluateCoachAiScenario,
  getScenario,
  runCoachAiEvalSuite,
} from "@/domain/ai-eval";

describe("AI Coach offline evaluation framework", () => {
  it("covers the required scenario catalog", () => {
    expect(AI_EVAL_SCENARIO_IDS).toEqual([
      "insufficient_recovery_data",
      "performance_decline",
      "new_athlete",
      "high_fatigue",
      "technique_regression",
      "competition_approaching",
    ]);
    expect(COACH_AI_EVAL_SCENARIOS).toHaveLength(AI_EVAL_SCENARIO_IDS.length);
    expect(AI_EVAL_DIMENSIONS).toHaveLength(6);
  });

  it("passes the full Coach AI regression suite", () => {
    const suite = runCoachAiEvalSuite();
    if (!suite.passed) {
      const failed = suite.results
        .filter((r) => !r.passed)
        .map((r) => {
          const dims = r.dimensions
            .filter((d) => !d.passed)
            .map((d) => `${d.dimension}: ${d.detail}`)
            .join(" | ");
          return `${r.scenarioId} → ${dims}`;
        });
      expect.fail(`Eval suite failures:\n${failed.join("\n")}`);
    }
    expect(suite.passed).toBe(true);
  });

  it.each(AI_EVAL_SCENARIO_IDS)(
    "scenario %s passes all rubrics",
    (id) => {
      const scenario = getScenario(id);
      expect(scenario).toBeTruthy();
      const result = evaluateCoachAiScenario(scenario!);
      const failed = result.dimensions.filter((d) => !d.passed);
      expect(failed, JSON.stringify(failed)).toEqual([]);
      expect(result.passed).toBe(true);
    },
  );

  it("documents offline / no auto-retrain honesty", () => {
    expect(AI_EVAL_HONESTY.join(" ")).toMatch(/offline/i);
    expect(AI_EVAL_HONESTY.join(" ")).toMatch(/auto-retrain/i);
  });

  it("does not invent competition when signal absent", () => {
    const scenario = getScenario("new_athlete")!;
    const result = evaluateCoachAiScenario(scenario);
    expect(
      result.drafts.some((d) =>
        d.title.toLowerCase().includes("competition approaching"),
      ),
    ).toBe(false);
  });
});
