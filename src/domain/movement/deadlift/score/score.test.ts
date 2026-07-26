import { describe, expect, it } from "vitest";
import { assessDeadliftCameraSuitability } from "@/domain/movement/camera-suitability";
import { analyzeDeadliftTechnique } from "@/domain/movement/deadlift/score";
import {
  DEADLIFT_TECHNIQUE_WEIGHTS,
  DEADLIFT_TECHNIQUE_MIN_COMPONENTS_FOR_SCORE,
} from "@/domain/movement/deadlift/score/thresholds";
import { buildDeadliftFixtureFrames } from "@/domain/movement/fixture";
import { computeDeadliftMetrics } from "@/domain/movement/deadlift/metrics";
import { detectDeadliftPhases } from "@/domain/movement/deadlift/phases";
import { runMovementPipeline } from "@/domain/movement/pipeline";

describe("DEADLIFT_TECHNIQUE_WEIGHTS", () => {
  it("sums to 1.0 (deterministic catalog)", () => {
    const sum = Object.values(DEADLIFT_TECHNIQUE_WEIGHTS).reduce(
      (a, b) => a + b,
      0,
    );
    expect(sum).toBeCloseTo(1, 10);
  });
});

describe("analyzeDeadliftTechnique", () => {
  it("returns score, confidence, observed/unavailable, key issue, positives, recommendations", () => {
    const frames = buildDeadliftFixtureFrames();
    const suitability = assessDeadliftCameraSuitability("side");
    const phases = detectDeadliftPhases(frames);
    const metrics = computeDeadliftMetrics(frames, phases, suitability);
    const assessment = analyzeDeadliftTechnique({
      frames,
      phases,
      metrics,
      suitability,
    });

    expect(assessment.formulaId).toBe("deadlift.technique.weighted_v1");
    expect(assessment.score).not.toBeNull();
    expect(assessment.score).toBeGreaterThanOrEqual(0);
    expect(assessment.score).toBeLessThanOrEqual(100);
    expect(assessment.confidence).not.toBe("none");
    expect(assessment.metricsObserved.length).toBeGreaterThanOrEqual(
      DEADLIFT_TECHNIQUE_MIN_COMPONENTS_FOR_SCORE,
    );
    expect(
      assessment.metricsUnavailable.some((m) => /bracing/i.test(m)),
    ).toBe(true);
    expect(assessment.keyIssue).toBeTruthy();
    expect(assessment.recommendations.length).toBeGreaterThan(0);
    expect(assessment.assumptions.length).toBeGreaterThan(0);

    const weightSum = assessment.components
      .filter((c) => c.status === "observed")
      .reduce((acc, c) => acc + c.effectiveWeight, 0);
    expect(weightSum).toBeCloseTo(1, 5);
  });

  it("does not invent a score for unsuitable camera angles", () => {
    const frames = buildDeadliftFixtureFrames();
    const suitability = assessDeadliftCameraSuitability("overhead");
    const phases = detectDeadliftPhases(frames);
    const metrics = computeDeadliftMetrics(frames, phases, suitability).map(
      (metric) =>
        suitability.limitedMetricKeys.includes(metric.key)
          ? {
              ...metric,
              value: null,
              confidence: "none" as const,
              confidenceScore: 0,
            }
          : metric,
    );
    const assessment = analyzeDeadliftTechnique({
      frames,
      phases,
      metrics,
      suitability,
    });
    expect(assessment.score).toBeNull();
    expect(assessment.confidence).toBe("none");
    expect(assessment.keyIssue).toMatch(/unsuitable|overhead/i);
  });

  it("keeps bracing unavailable (not observable from 2D pose)", () => {
    const frames = buildDeadliftFixtureFrames();
    const suitability = assessDeadliftCameraSuitability("side");
    const phases = detectDeadliftPhases(frames);
    const metrics = computeDeadliftMetrics(frames, phases, suitability);
    const assessment = analyzeDeadliftTechnique({
      frames,
      phases,
      metrics,
      suitability,
    });
    const bracing = assessment.components.find(
      (c) => c.id === "bracing_indicators",
    );
    expect(bracing?.status).toBe("unavailable");
    expect(bracing?.score).toBeNull();
  });

  it("is deterministic for the same fixture input", () => {
    const frames = buildDeadliftFixtureFrames();
    const suitability = assessDeadliftCameraSuitability("side");
    const phases = detectDeadliftPhases(frames);
    const metrics = computeDeadliftMetrics(frames, phases, suitability);
    const a = analyzeDeadliftTechnique({
      frames,
      phases,
      metrics,
      suitability,
    });
    const b = analyzeDeadliftTechnique({
      frames,
      phases,
      metrics,
      suitability,
    });
    expect(a.score).toBe(b.score);
    expect(a.components.map((c) => c.score)).toEqual(
      b.components.map((c) => c.score),
    );
  });
});

describe("runMovementPipeline + Technique Score", () => {
  it("attaches a deadlift Technique Score for side-view fixtures", () => {
    const report = runMovementPipeline({
      exerciseSlug: "deadlift",
      cameraAngle: "side",
      frames: buildDeadliftFixtureFrames(),
      poseProvider: "diagnostics_fixture",
      fixture: true,
    });
    expect(report.techniqueAssessment).not.toBeNull();
    expect(report.overallTechniqueScore).toBe(
      report.techniqueAssessment?.score ?? null,
    );
    expect(report.overallTechniqueScore).not.toBeNull();
  });

  it("withholds Technique Score for overhead camera", () => {
    const report = runMovementPipeline({
      exerciseSlug: "deadlift",
      cameraAngle: "overhead",
      frames: buildDeadliftFixtureFrames(),
      poseProvider: "diagnostics_fixture",
      fixture: true,
    });
    expect(report.overallTechniqueScore).toBeNull();
    expect(report.techniqueAssessment?.score).toBeNull();
  });
});
