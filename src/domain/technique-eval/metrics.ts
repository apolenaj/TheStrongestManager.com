import { runMovementPipeline } from "@/domain/movement/pipeline";
import type { MovementReport } from "@/domain/movement/types";
import {
  TECHNIQUE_EVAL_LANDMARK_VIS_THRESHOLD,
  TECHNIQUE_EVAL_METRIC_EPSILON,
} from "@/domain/technique-eval/constants";
import type { TechniqueEvalCase } from "@/domain/technique-eval/types";
import type { TechniqueEvalCheck } from "@/domain/technique-eval/types";

export function runCasePipeline(c: TechniqueEvalCase): MovementReport {
  return runMovementPipeline({
    exerciseSlug: c.exerciseSlug,
    cameraAngle: c.cameraAngle,
    frames: c.frames,
    poseProvider: "diagnostics_fixture",
    fixture: true,
  });
}

function check(
  metricId: TechniqueEvalCheck["metricId"],
  caseId: TechniqueEvalCheck["caseId"],
  passed: boolean,
  detail: string,
  rate: number | null = passed ? 1 : 0,
): TechniqueEvalCheck {
  return { metricId, caseId, passed, detail, rate };
}

/** Landmark detection quality vs ground-truth coverage bounds. */
export function evalLandmarkDetectionQuality(
  c: TechniqueEvalCase,
  report: MovementReport,
): TechniqueEvalCheck {
  if (!c.focuses.includes("landmark_detection_quality")) {
    return check(
      "landmark_detection_quality",
      c.id,
      true,
      "Skipped (not in case focus)",
      null,
    );
  }

  const coverage = report.diagnostics.landmarkCoverageByName;
  const failures: string[] = [];
  let hits = 0;
  let total = 0;

  for (const name of c.groundTruth.requiredLandmarks) {
    const cov = coverage[name] ?? 0;
    const min = c.groundTruth.minCoverageByLandmark?.[name];
    const max = c.groundTruth.maxCoverageByLandmark?.[name];
    if (min != null) {
      total += 1;
      if (cov + 1e-9 >= min) hits += 1;
      else failures.push(`${name} coverage ${cov.toFixed(2)} < min ${min}`);
    }
    if (max != null) {
      total += 1;
      if (cov - 1e-9 <= max) hits += 1;
      else failures.push(`${name} coverage ${cov.toFixed(2)} > max ${max}`);
    }
  }

  if (
    c.groundTruth.maxCoverageByLandmark &&
    report.diagnostics.meanLandmarkVisibility >=
      TECHNIQUE_EVAL_LANDMARK_VIS_THRESHOLD
  ) {
    failures.push(
      `meanLandmarkVisibility ${report.diagnostics.meanLandmarkVisibility} should stay below detection threshold for low-vis fixture`,
    );
  }

  const rate = total === 0 ? null : hits / total;
  return check(
    "landmark_detection_quality",
    c.id,
    failures.length === 0,
    failures.length === 0
      ? `Coverage within ground-truth bounds (threshold ${TECHNIQUE_EVAL_LANDMARK_VIS_THRESHOLD})`
      : failures.join("; "),
    rate,
  );
}

/** Phase detection vs expected / forbidden phase sets. */
export function evalPhaseDetection(
  c: TechniqueEvalCase,
  report: MovementReport,
): TechniqueEvalCheck {
  if (!c.focuses.includes("phase_detection")) {
    return check(
      "phase_detection",
      c.id,
      true,
      "Skipped (not in case focus)",
      null,
    );
  }

  const detected = new Set(report.phases.map((p) => p.phase));
  const failures: string[] = [];
  let hits = 0;
  const expected = c.groundTruth.expectedPhases;

  for (const phase of expected) {
    if (detected.has(phase)) hits += 1;
    else failures.push(`missing phase ${phase}`);
  }

  for (const phase of c.groundTruth.forbiddenPhases ?? []) {
    if (detected.has(phase)) {
      failures.push(`invented forbidden phase ${phase}`);
    }
  }

  const rate =
    expected.length === 0
      ? failures.length === 0
        ? 1
        : 0
      : hits / expected.length;

  return check(
    "phase_detection",
    c.id,
    failures.length === 0,
    failures.length === 0
      ? `Phases match ground truth (${[...detected].join(", ") || "none"})`
      : failures.join("; "),
    rate,
  );
}

/** Deterministic metric values + expected observable keys. */
export function evalMetricConsistency(
  c: TechniqueEvalCase,
  report: MovementReport,
): TechniqueEvalCheck {
  if (!c.focuses.includes("metric_consistency")) {
    return check(
      "metric_consistency",
      c.id,
      true,
      "Skipped (not in case focus)",
      null,
    );
  }

  const failures: string[] = [];
  const again = runCasePipeline(c);

  for (const m of report.metrics) {
    const m2 = again.metrics.find((x) => x.key === m.key);
    if (!m2) {
      failures.push(`missing metric on re-run: ${m.key}`);
      continue;
    }
    if (m.value == null && m2.value == null) continue;
    if (m.value == null || m2.value == null) {
      failures.push(`null mismatch on ${m.key}`);
      continue;
    }
    if (Math.abs(m.value - m2.value) > TECHNIQUE_EVAL_METRIC_EPSILON) {
      failures.push(
        `${m.key} drifted ${m.value} → ${m2.value} (ε=${TECHNIQUE_EVAL_METRIC_EPSILON})`,
      );
    }
  }

  for (const key of c.groundTruth.expectedObservableMetricKeys ?? []) {
    const m = report.metrics.find((x) => x.key === key);
    if (!m || m.value == null || m.confidence === "none") {
      failures.push(`expected observable metric missing: ${key}`);
    }
  }

  return check(
    "metric_consistency",
    c.id,
    failures.length === 0,
    failures.length === 0
      ? "Re-run identical; expected observables present"
      : failures.join("; "),
    failures.length === 0 ? 1 : 0,
  );
}

/** Camera suitability + limited/suppressed metric behavior. */
export function evalCameraAngleRobustness(
  c: TechniqueEvalCase,
  report: MovementReport,
): TechniqueEvalCheck {
  if (!c.focuses.includes("camera_angle_robustness")) {
    return check(
      "camera_angle_robustness",
      c.id,
      true,
      "Skipped (not in case focus)",
      null,
    );
  }

  const failures: string[] = [];
  const suit = report.cameraSuitability;

  if (suit.suitable !== c.groundTruth.cameraSuitable) {
    failures.push(
      `suitable=${suit.suitable} expected ${c.groundTruth.cameraSuitable}`,
    );
  }

  if (
    c.groundTruth.withholdTechniqueScore &&
    report.overallTechniqueScore != null
  ) {
    failures.push(
      `Technique Score ${report.overallTechniqueScore} should be withheld`,
    );
  }

  for (const key of c.groundTruth.expectedLimitedMetricKeys ?? []) {
    if (!suit.limitedMetricKeys.includes(key)) {
      failures.push(`${key} not listed in limitedMetricKeys`);
      continue;
    }
    const m = report.metrics.find((x) => x.key === key);
    if (!m) {
      failures.push(`limited metric missing from report: ${key}`);
      continue;
    }
    if (!c.groundTruth.cameraSuitable) {
      if (m.value != null || m.confidence !== "none") {
        failures.push(
          `${key} should be suppressed (null/none) for unsuitable camera`,
        );
      }
    } else if (m.confidence === "high") {
      failures.push(
        `${key} still high confidence despite angle limitation`,
      );
    }
  }

  return check(
    "camera_angle_robustness",
    c.id,
    failures.length === 0,
    failures.length === 0
      ? `Camera angle behavior matches ground truth (${c.cameraAngle})`
      : failures.join("; "),
    failures.length === 0 ? 1 : 0,
  );
}

export function evaluateTechniqueEvalCase(
  c: TechniqueEvalCase,
): TechniqueEvalCheck[] {
  const report = runCasePipeline(c);
  return [
    evalLandmarkDetectionQuality(c, report),
    evalPhaseDetection(c, report),
    evalMetricConsistency(c, report),
    evalCameraAngleRobustness(c, report),
  ];
}
