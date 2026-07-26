import { analyzeBarPath } from "@/domain/movement/bar-path";
import { assessDeadliftCameraSuitability } from "@/domain/movement/camera-suitability";
import {
  MOVEMENT_DISCLAIMERS,
  MOVEMENT_MVP_EXERCISE_SLUGS,
  MOVEMENT_PIPELINE_VERSION,
  type MovementMvpExerciseSlug,
} from "@/domain/movement/constants";
import { buildDeadliftHeuristics } from "@/domain/movement/deadlift/heuristics";
import { computeDeadliftMetrics } from "@/domain/movement/deadlift/metrics";
import { detectDeadliftPhases } from "@/domain/movement/deadlift/phases";
import { analyzeDeadliftTechnique } from "@/domain/movement/deadlift/score";
import {
  clamp01,
  confidenceFromScore,
  midHip,
} from "@/domain/movement/geometry";
import type {
  LandmarkName,
  MovementReport,
  PoseFrame,
} from "@/domain/movement/types";

function isMvpExercise(slug: string): slug is MovementMvpExerciseSlug {
  return (MOVEMENT_MVP_EXERCISE_SLUGS as readonly string[]).includes(slug);
}

function phaseUnsupportedSummary(slug: string): string {
  if (/squat/i.test(slug)) {
    return `Squat phases (setup, descent, bottom, sticking region, lockout) are catalogued but not detected yet — segmentation is not reliable enough. Got “${slug}”. Video remains private; no phases or scores were invented. Bar-path may still appear when side-view wrist confidence allows.`;
  }
  if (/bench/i.test(slug)) {
    return `Bench phases (setup, descent, touch, initial press, mid-range, lockout) are catalogued but not detected yet — segmentation is not reliable enough. Got “${slug}”. Video remains private; no phases or scores were invented. Bar-path may still appear when side-view wrist confidence allows.`;
  }
  return `Movement analysis currently supports conventional deadlift phase timelines (got “${slug}”). Video remains stored privately; no metrics were invented.`;
}

function landmarkCoverage(
  frames: PoseFrame[],
): Partial<Record<LandmarkName, number>> {
  const counts: Partial<Record<LandmarkName, number>> = {};
  const totals: Partial<Record<LandmarkName, number>> = {};
  for (const frame of frames) {
    for (const lm of frame.landmarks) {
      totals[lm.name] = (totals[lm.name] ?? 0) + 1;
      if (lm.visibility >= 0.35) {
        counts[lm.name] = (counts[lm.name] ?? 0) + 1;
      }
    }
  }
  const coverage: Partial<Record<LandmarkName, number>> = {};
  for (const name of Object.keys(totals) as LandmarkName[]) {
    const t = totals[name] ?? 0;
    coverage[name] = t === 0 ? 0 : (counts[name] ?? 0) / t;
  }
  return coverage;
}

export type RunMovementPipelineInput = {
  exerciseSlug: string;
  cameraAngle: string | null;
  frames: PoseFrame[];
  poseProvider: string;
  fixture?: boolean;
};

/**
 * Video → frames → landmarks → phases → metrics → heuristics → Technique Score → bar path → report.
 * Technique Score / bar-path metrics are null or hidden when confidence is insufficient — never invented.
 */
export function runMovementPipeline(
  input: RunMovementPipelineInput,
): MovementReport {
  const disclaimers = [
    ...MOVEMENT_DISCLAIMERS,
    "Bar-path uses a mid-wrist proxy when confidence allows; poor detection hides the metric rather than fabricating a path.",
  ];
  const warnings: string[] = [];

  const barPath = analyzeBarPath({
    exerciseSlug: input.exerciseSlug,
    cameraAngle: input.cameraAngle,
    frames: input.frames,
  });

  if (!isMvpExercise(input.exerciseSlug)) {
    const suitability = assessDeadliftCameraSuitability(input.cameraAngle);
    return {
      pipelineVersion: MOVEMENT_PIPELINE_VERSION,
      exerciseSlug: input.exerciseSlug,
      supportedExercise: false,
      cameraSuitability: suitability,
      phases: [],
      metrics: [],
      heuristics: [],
      reportConfidence: barPath.displayable ? barPath.confidence : "none",
      reportConfidenceScore: barPath.displayable ? barPath.confidenceScore : 0,
      summary: phaseUnsupportedSummary(input.exerciseSlug),
      diagnostics: {
        poseProvider: input.poseProvider,
        frameCount: input.frames.length,
        framesWithMidHip: input.frames.filter((f) => midHip(f) != null).length,
        meanLandmarkVisibility: 0,
        pipelineVersion: MOVEMENT_PIPELINE_VERSION,
        fixture: Boolean(input.fixture),
        landmarkCoverageByName: landmarkCoverage(input.frames),
        warnings: [
          "unsupported_exercise",
          "phases_unavailable",
          ...(barPath.displayable ? [] : ["bar_path_hidden"]),
        ],
      },
      disclaimers,
      overallTechniqueScore: null,
      techniqueAssessment: null,
      barPath,
    };
  }

  const suitability = assessDeadliftCameraSuitability(input.cameraAngle);
  if (!suitability.suitable) {
    warnings.push("unsuitable_camera_angle");
  }

  const framesWithMidHip = input.frames.filter((f) => midHip(f) != null).length;
  const visibilities = input.frames.flatMap((f) =>
    f.landmarks.map((l) => l.visibility),
  );
  const meanLandmarkVisibility =
    visibilities.length === 0
      ? 0
      : visibilities.reduce((a, b) => a + b, 0) / visibilities.length;

  if (input.frames.length === 0) {
    warnings.push("no_pose_frames");
  }
  if (!barPath.displayable) {
    warnings.push("bar_path_hidden");
  }

  const phases = detectDeadliftPhases(input.frames);
  const metrics = suitability.suitable
    ? computeDeadliftMetrics(input.frames, phases, suitability)
    : computeDeadliftMetrics(input.frames, phases, suitability).map(
        (metric) => {
          if (!suitability.limitedMetricKeys.includes(metric.key)) {
            return metric;
          }
          return {
            ...metric,
            value: null,
            confidence: "none" as const,
            confidenceScore: 0,
            caveats: [
              ...metric.caveats,
              "Suppressed: camera angle unsuitable for this observation.",
            ],
          };
        },
      );

  const heuristics = suitability.suitable
    ? buildDeadliftHeuristics(metrics)
    : [];

  const techniqueAssessment = analyzeDeadliftTechnique({
    frames: input.frames,
    phases,
    metrics,
    suitability,
  });

  const overallTechniqueScore = techniqueAssessment.score;

  const metricScores = metrics.map((m) => m.confidenceScore);
  const reportConfidenceScore = clamp01(
    suitability.suitable
      ? (metricScores.reduce((a, b) => a + b, 0) /
          Math.max(metricScores.length, 1)) *
          (framesWithMidHip / Math.max(input.frames.length, 1))
      : 0.05,
  );

  let summary: string;
  if (!suitability.suitable) {
    summary = suitability.message;
  } else if (framesWithMidHip < 8) {
    summary =
      "Pose landmarks were insufficient to segment the lift confidently. Re-record with the full body visible from the side.";
    warnings.push("insufficient_landmarks");
  } else if (overallTechniqueScore != null) {
    summary =
      `Conventional deadlift Technique Score ${overallTechniqueScore}/100 (confidence ${techniqueAssessment.confidence}). ${techniqueAssessment.keyIssue ?? ""}`.trim();
  } else {
    summary =
      techniqueAssessment.keyIssue ??
      "Deadlift movement metrics computed; Technique Score withheld — insufficient observable components.";
  }

  if (input.fixture) {
    warnings.push("diagnostics_fixture");
    summary = `[Developer fixture] ${summary}`;
  }

  return {
    pipelineVersion: MOVEMENT_PIPELINE_VERSION,
    exerciseSlug: input.exerciseSlug,
    supportedExercise: true,
    cameraSuitability: suitability,
    phases,
    metrics,
    heuristics,
    reportConfidence: confidenceFromScore(reportConfidenceScore),
    reportConfidenceScore,
    summary,
    diagnostics: {
      poseProvider: input.poseProvider,
      frameCount: input.frames.length,
      framesWithMidHip,
      meanLandmarkVisibility: Math.round(meanLandmarkVisibility * 1000) / 1000,
      pipelineVersion: MOVEMENT_PIPELINE_VERSION,
      fixture: Boolean(input.fixture),
      landmarkCoverageByName: landmarkCoverage(input.frames),
      warnings,
    },
    disclaimers,
    overallTechniqueScore,
    techniqueAssessment,
    barPath,
  };
}
