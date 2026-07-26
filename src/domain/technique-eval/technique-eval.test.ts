import { describe, expect, it } from "vitest";
import {
  NO_PUBLIC_ACCURACY_CLAIM,
  TECHNIQUE_EVAL_CASE_IDS,
  TECHNIQUE_EVAL_DATASET,
  TECHNIQUE_EVAL_HONESTY,
  TECHNIQUE_EVAL_METRIC_IDS,
  buildTechniqueEvalDashboardSnapshot,
  evaluateTechniqueEvalCaseById,
  formatPublicAccuracyClaim,
  runTechniqueEvalSuite,
} from "@/domain/technique-eval";

describe("technique model evaluation framework", () => {
  it("covers required metric catalog and dataset cases", () => {
    expect(TECHNIQUE_EVAL_METRIC_IDS).toEqual([
      "landmark_detection_quality",
      "phase_detection",
      "metric_consistency",
      "camera_angle_robustness",
    ]);
    expect(TECHNIQUE_EVAL_CASE_IDS).toHaveLength(6);
    expect(TECHNIQUE_EVAL_DATASET).toHaveLength(TECHNIQUE_EVAL_CASE_IDS.length);
    expect(
      TECHNIQUE_EVAL_DATASET.every((c) => c.datasetKind === "synthetic_fixture"),
    ).toBe(true);
  });

  it("passes the full offline benchmark suite", () => {
    const suite = runTechniqueEvalSuite();
    if (!suite.passed) {
      const failed = suite.results
        .filter((r) => !r.passed)
        .map((r) => {
          const dims = r.checks
            .filter((d) => !d.passed)
            .map((d) => `${d.metricId}: ${d.detail}`)
            .join(" | ");
          return `${r.caseId} → ${dims}`;
        });
      expect.fail(`Technique eval failures:\n${failed.join("\n")}`);
    }
    expect(suite.passed).toBe(true);
    expect(suite.humanLabeledCaseCount).toBe(0);
  });

  it.each(TECHNIQUE_EVAL_CASE_IDS)("case %s passes focused metrics", (id) => {
    const result = evaluateTechniqueEvalCaseById(id);
    expect(result).toBeTruthy();
    const failed = result!.checks.filter((c) => !c.passed);
    expect(failed, JSON.stringify(failed)).toEqual([]);
    expect(result!.passed).toBe(true);
  });

  it("never invents a public accuracy % from synthetic fixtures", () => {
    const claim = formatPublicAccuracyClaim({
      rate: 0.99,
      labeledSampleCount: 0,
      datasetKind: "synthetic_fixture",
      metricLabel: "Landmark detection quality",
    });
    expect(claim.claimable).toBe(false);
    expect(claim.text).toBe(NO_PUBLIC_ACCURACY_CLAIM);

    const withRateButSynthetic = formatPublicAccuracyClaim({
      rate: 1,
      labeledSampleCount: 100,
      datasetKind: "synthetic_fixture",
    });
    expect(withRateButSynthetic.claimable).toBe(false);

    const labeled = formatPublicAccuracyClaim({
      rate: 0.91,
      labeledSampleCount: 40,
      datasetKind: "human_labeled",
      metricLabel: "Phase detection",
    });
    expect(labeled.claimable).toBe(true);
    expect(labeled.text).toMatch(/91\.0%/);
    expect(labeled.text).toMatch(/40 human-labeled/);
  });

  it("dashboard snapshot refuses public accuracy claims without labeled data", () => {
    const snap = buildTechniqueEvalDashboardSnapshot();
    expect(snap.publicAccuracyClaim).toBe(NO_PUBLIC_ACCURACY_CLAIM);
    expect(
      snap.metricRows.every((r) => r.publicClaimText === NO_PUBLIC_ACCURACY_CLAIM),
    ).toBe(true);
    expect(snap.honesty.join(" ")).toMatch(/Never publicly claim accuracy/i);
    expect(TECHNIQUE_EVAL_HONESTY.join(" ")).toMatch(/human-labeled/i);
    expect(snap.suitePassed).toBe(true);
    expect(snap.datasetArchitecture.caseShape.length).toBeGreaterThan(3);
  });
});
