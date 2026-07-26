import { describe, expect, it } from "vitest";
import {
  assembleVideoComparison,
  VIDEO_COMPARISON_ENGINE_VERSION,
  type AssembleVideoComparisonInput,
} from "@/domain/video-comparison";
import type { MovementReport } from "@/domain/movement/types";

function baseReport(
  overrides: Partial<MovementReport> = {},
): MovementReport {
  return {
    pipelineVersion: "movement.v1.1",
    exerciseSlug: "deadlift",
    supportedExercise: true,
    cameraSuitability: {
      suitable: true,
      level: "high",
      angle: "side",
      message: "ok",
      limitedMetricKeys: [],
    },
    phases: [
      {
        phase: "setup",
        startFrame: 0,
        endFrame: 5,
        startTimeSeconds: 0.2,
        endTimeSeconds: 0.8,
        confidence: "medium",
        confidenceScore: 0.5,
        note: "",
      },
      {
        phase: "lockout",
        startFrame: 20,
        endFrame: 30,
        startTimeSeconds: 2.0,
        endTimeSeconds: 2.5,
        confidence: "medium",
        confidenceScore: 0.5,
        note: "",
      },
    ],
    metrics: [
      {
        key: "approx_hip_y_pull_mean",
        label: "Hip height",
        value: 0.55,
        unit: "norm_y",
        confidence: "medium",
        confidenceScore: 0.6,
        basis: "test",
        caveats: [],
        phase: "initial_pull",
      },
    ],
    heuristics: [],
    reportConfidence: "medium",
    reportConfidenceScore: 0.6,
    summary: "ok",
    diagnostics: {
      poseProvider: "test",
      frameCount: 30,
      framesWithMidHip: 30,
      meanLandmarkVisibility: 0.9,
      pipelineVersion: "movement.v1.1",
      fixture: true,
      landmarkCoverageByName: {},
      warnings: [],
    },
    disclaimers: [],
    overallTechniqueScore: 75,
    techniqueAssessment: {
      formulaId: "deadlift.technique.weighted_v1",
      formulaVersion: "1.0.0",
      score: 75,
      confidence: "medium",
      confidenceScore: 0.6,
      components: [
        {
          id: "start_position",
          label: "Start position",
          score: 70,
          weight: 0.15,
          effectiveWeight: 0.15,
          status: "observed",
          confidence: "medium",
          confidenceScore: 0.6,
          evidence: "test",
          sourceMetricKeys: [],
        },
        {
          id: "lockout",
          label: "Lockout",
          score: 80,
          weight: 0.12,
          effectiveWeight: 0.12,
          status: "observed",
          confidence: "medium",
          confidenceScore: 0.6,
          evidence: "test",
          sourceMetricKeys: [],
        },
      ],
      metricsObserved: [],
      metricsUnavailable: [],
      keyIssue: null,
      positiveFindings: [],
      recommendations: [],
      assumptions: [],
    },
    barPath: null,
    ...overrides,
  };
}

function side(
  id: string,
  angle: string,
  score: number,
  report: MovementReport,
): AssembleVideoComparisonInput["old"] {
  return {
    analysisId: id,
    createdAtIso: "2026-01-01T00:00:00.000Z",
    cameraAngle: angle,
    exerciseSlug: "deadlift",
    exerciseName: "Deadlift",
    overallScore: score,
    confidence: "medium",
    durationSeconds: 3,
    signedMediaPath: `/api/technique/analyses/${id}/media?t=x`,
    report,
  };
}

describe("Video comparison", () => {
  it("exports engine version", () => {
    expect(VIDEO_COMPARISON_ENGINE_VERSION).toBe("video_comparison.v1");
  });

  it("compares start position, path, phases, and technique when cameras match", () => {
    const oldReport = baseReport();
    const newReport = baseReport({
      metrics: [
        {
          key: "approx_hip_y_pull_mean",
          label: "Hip height",
          value: 0.5,
          unit: "norm_y",
          confidence: "medium",
          confidenceScore: 0.6,
          basis: "test",
          caveats: [],
          phase: "initial_pull",
        },
      ],
      techniqueAssessment: {
        ...baseReport().techniqueAssessment!,
        score: 82,
        components: [
          {
            ...baseReport().techniqueAssessment!.components[0],
            score: 78,
          },
          {
            ...baseReport().techniqueAssessment!.components[1],
            score: 88,
          },
        ],
      },
    });

    const result = assembleVideoComparison({
      old: side("old", "side", 75, oldReport),
      new: {
        ...side("new", "side", 82, newReport),
        createdAtIso: "2026-02-01T00:00:00.000Z",
      },
    });

    expect(result.emptyReason).toBeNull();
    expect(result.metricsComparable).toBe(true);
    expect(result.startPositionRows.some((r) => r.id === "start_position")).toBe(
      true,
    );
    expect(result.movementPathRows.length).toBeGreaterThan(0);
    expect(result.phaseRows.length).toBeGreaterThan(0);
    expect(result.techniqueMetricRows.some((r) => r.id === "lockout")).toBe(
      true,
    );
    expect(result.landmarksAvailable).toBe(false);
  });

  it("gates metrics when camera angles are incompatible but keeps playback", () => {
    const result = assembleVideoComparison({
      old: side("old", "side", 75, baseReport()),
      new: {
        ...side("new", "front", 80, baseReport()),
        createdAtIso: "2026-02-01T00:00:00.000Z",
      },
    });
    expect(result.emptyReason).toBeNull();
    expect(result.metricsComparable).toBe(false);
    expect(result.cameraWarning).toMatch(/incompatible/i);
    expect(result.startPositionRows).toEqual([]);
    expect(result.oldSide.signedMediaPath).toBeTruthy();
    expect(result.newSide.signedMediaPath).toBeTruthy();
  });

  it("returns empty when neither side has video", () => {
    const result = assembleVideoComparison({
      old: {
        ...side("old", "side", 75, baseReport()),
        signedMediaPath: null,
      },
      new: {
        ...side("new", "side", 80, baseReport()),
        signedMediaPath: null,
        createdAtIso: "2026-02-01T00:00:00.000Z",
      },
    });
    expect(result.emptyReason).toMatch(/video/i);
  });
});
