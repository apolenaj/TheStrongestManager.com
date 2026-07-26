/**
 * Internal admin dashboard view-model for technique model evaluation.
 */

import {
  TECHNIQUE_EVAL_HONESTY,
  TECHNIQUE_EVAL_METRIC_IDS,
  TECHNIQUE_EVAL_METRIC_LABELS,
  TECHNIQUE_EVAL_ENGINE_VERSION,
} from "@/domain/technique-eval/constants";
import {
  formatInternalFixtureRate,
  formatPublicAccuracyClaim,
} from "@/domain/technique-eval/accuracy-claims";
import { TECHNIQUE_EVAL_DATASET } from "@/domain/technique-eval/dataset";
import { runTechniqueEvalSuite } from "@/domain/technique-eval/runBenchmark";

export type TechniqueEvalDashboardSnapshot = {
  engineVersion: typeof TECHNIQUE_EVAL_ENGINE_VERSION;
  honesty: readonly string[];
  suitePassed: boolean;
  syntheticCaseCount: number;
  humanLabeledCaseCount: number;
  publicAccuracyClaim: string;
  metricRows: Array<{
    id: string;
    label: string;
    internalRateText: string;
    publicClaimText: string;
    sampleCount: number;
  }>;
  caseRows: Array<{
    id: string;
    title: string;
    cameraAngle: string;
    datasetKind: string;
    focuses: string[];
    passed: boolean;
    details: string[];
  }>;
  datasetArchitecture: {
    caseShape: string[];
    note: string;
  };
};

export function buildTechniqueEvalDashboardSnapshot(): TechniqueEvalDashboardSnapshot {
  const suite = runTechniqueEvalSuite();

  const publicClaim = formatPublicAccuracyClaim({
    rate: null,
    labeledSampleCount: suite.humanLabeledCaseCount,
    datasetKind:
      suite.humanLabeledCaseCount > 0 ? "human_labeled" : "synthetic_fixture",
  });

  const metricRows = TECHNIQUE_EVAL_METRIC_IDS.map((id) => {
    const agg = suite.metricRates[id];
    return {
      id,
      label: TECHNIQUE_EVAL_METRIC_LABELS[id],
      internalRateText: formatInternalFixtureRate({
        rate: agg.rate,
        sampleCount: agg.sampleCount,
        metricLabel: TECHNIQUE_EVAL_METRIC_LABELS[id],
      }),
      publicClaimText: formatPublicAccuracyClaim({
        rate: agg.rate,
        labeledSampleCount: suite.humanLabeledCaseCount,
        datasetKind:
          suite.humanLabeledCaseCount > 0
            ? "human_labeled"
            : "synthetic_fixture",
        metricLabel: TECHNIQUE_EVAL_METRIC_LABELS[id],
      }).text,
      sampleCount: agg.sampleCount,
    };
  });

  const caseRows = suite.results.map((r) => {
    const meta = TECHNIQUE_EVAL_DATASET.find((c) => c.id === r.caseId)!;
    return {
      id: r.caseId,
      title: r.title,
      cameraAngle: meta.cameraAngle,
      datasetKind: meta.datasetKind,
      focuses: [...meta.focuses],
      passed: r.passed,
      details: r.checks
        .filter((ch) => meta.focuses.includes(ch.metricId))
        .map((ch) => `${ch.metricId}: ${ch.passed ? "pass" : "FAIL"} — ${ch.detail}`),
    };
  });

  return {
    engineVersion: TECHNIQUE_EVAL_ENGINE_VERSION,
    honesty: TECHNIQUE_EVAL_HONESTY,
    suitePassed: suite.passed,
    syntheticCaseCount: suite.syntheticCaseCount,
    humanLabeledCaseCount: suite.humanLabeledCaseCount,
    publicAccuracyClaim: publicClaim.text,
    metricRows,
    caseRows,
    datasetArchitecture: {
      caseShape: [
        "id / title / description",
        "datasetKind (synthetic_fixture | human_labeled)",
        "exerciseSlug + cameraAngle + frames",
        "groundTruth (landmarks, phases, limited metrics, score withhold)",
        "focuses (which quality metrics gate the case)",
      ],
      note: "Human-labeled video rows will reuse this shape (plus annotator metadata) — fixtures share the same harness.",
    },
  };
}
