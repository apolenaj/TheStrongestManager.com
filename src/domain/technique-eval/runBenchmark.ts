/**
 * Offline technique-model benchmark harness.
 */

import {
  TECHNIQUE_EVAL_ENGINE_VERSION,
  TECHNIQUE_EVAL_METRIC_IDS,
  type TechniqueEvalMetricId,
} from "@/domain/technique-eval/constants";
import { TECHNIQUE_EVAL_DATASET } from "@/domain/technique-eval/dataset";
import { evaluateTechniqueEvalCase } from "@/domain/technique-eval/metrics";
import type {
  TechniqueEvalCaseResult,
  TechniqueEvalSuiteResult,
} from "@/domain/technique-eval/types";

function aggregateMetricRates(
  results: TechniqueEvalCaseResult[],
): TechniqueEvalSuiteResult["metricRates"] {
  const rates = {} as TechniqueEvalSuiteResult["metricRates"];
  for (const id of TECHNIQUE_EVAL_METRIC_IDS) {
    const samples: number[] = [];
    for (const r of results) {
      for (const c of r.checks) {
        if (c.metricId !== id) continue;
        if (c.rate == null) continue;
        // Skip "not in focus" skips (rate null already); include focused checks only
        samples.push(c.rate);
      }
    }
    rates[id] = {
      rate:
        samples.length === 0
          ? null
          : samples.reduce((a, b) => a + b, 0) / samples.length,
      sampleCount: samples.length,
    };
  }
  return rates;
}

export function evaluateTechniqueEvalCaseById(
  id: string,
): TechniqueEvalCaseResult | null {
  const c = TECHNIQUE_EVAL_DATASET.find((x) => x.id === id);
  if (!c) return null;
  const checks = evaluateTechniqueEvalCase(c);
  // Only focused metrics gate the case pass; skips always pass.
  const focused = checks.filter((ch) =>
    c.focuses.includes(ch.metricId as TechniqueEvalMetricId),
  );
  return {
    caseId: c.id,
    title: c.title,
    passed: focused.every((ch) => ch.passed),
    checks,
  };
}

export function runTechniqueEvalSuite(): TechniqueEvalSuiteResult {
  const results: TechniqueEvalCaseResult[] = TECHNIQUE_EVAL_DATASET.map(
    (c) => {
      const checks = evaluateTechniqueEvalCase(c);
      const focused = checks.filter((ch) => c.focuses.includes(ch.metricId));
      return {
        caseId: c.id,
        title: c.title,
        passed: focused.every((ch) => ch.passed),
        checks,
      };
    },
  );

  return {
    engineVersion: TECHNIQUE_EVAL_ENGINE_VERSION,
    passed: results.every((r) => r.passed),
    results,
    metricRates: aggregateMetricRates(results),
    humanLabeledCaseCount: TECHNIQUE_EVAL_DATASET.filter(
      (c) => c.datasetKind === "human_labeled",
    ).length,
    syntheticCaseCount: TECHNIQUE_EVAL_DATASET.filter(
      (c) => c.datasetKind === "synthetic_fixture",
    ).length,
  };
}
