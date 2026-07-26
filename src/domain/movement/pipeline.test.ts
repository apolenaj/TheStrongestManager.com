import { describe, expect, it } from "vitest";
import { assessDeadliftCameraSuitability } from "@/domain/movement/camera-suitability";
import { buildDeadliftFixtureFrames } from "@/domain/movement/fixture";
import { runMovementPipeline } from "@/domain/movement/pipeline";

describe("deadlift camera suitability", () => {
  it("accepts side view", () => {
    const result = assessDeadliftCameraSuitability("side");
    expect(result.suitable).toBe(true);
    expect(result.level).toBe("high");
  });

  it("rejects overhead and tells the user", () => {
    const result = assessDeadliftCameraSuitability("overhead");
    expect(result.suitable).toBe(false);
    expect(result.message).toMatch(/unsuitable/i);
  });
});

describe("runMovementPipeline", () => {
  it("never invents a Technique Score without the documented scorer path", () => {
    const report = runMovementPipeline({
      exerciseSlug: "back-squat",
      cameraAngle: "side",
      frames: buildDeadliftFixtureFrames(),
      poseProvider: "diagnostics_fixture",
    });
    expect(report.supportedExercise).toBe(false);
    expect(report.overallTechniqueScore).toBeNull();
    expect(report.techniqueAssessment).toBeNull();
  });

  it("suppresses metrics when camera is unsuitable and withholds score", () => {
    const report = runMovementPipeline({
      exerciseSlug: "deadlift",
      cameraAngle: "overhead",
      frames: buildDeadliftFixtureFrames(),
      poseProvider: "diagnostics_fixture",
      fixture: true,
    });
    expect(report.cameraSuitability.suitable).toBe(false);
    expect(report.summary).toMatch(/unsuitable|overhead/i);
    expect(report.overallTechniqueScore).toBeNull();
    expect(
      report.metrics.every(
        (m) =>
          !report.cameraSuitability.limitedMetricKeys.includes(m.key) ||
          (m.value == null && m.confidence === "none"),
      ),
    ).toBe(true);
  });

  it("does not claim joint force or injury risk in disclaimers", () => {
    const report = runMovementPipeline({
      exerciseSlug: "deadlift",
      cameraAngle: "side",
      frames: buildDeadliftFixtureFrames(),
      poseProvider: "diagnostics_fixture",
      fixture: true,
    });
    expect(report.disclaimers.join(" ")).toMatch(/joint forces/i);
    expect(report.disclaimers.join(" ")).toMatch(/injury risk/i);
  });

  it("produces a conventional deadlift Technique Score from side-view fixtures", () => {
    const report = runMovementPipeline({
      exerciseSlug: "deadlift",
      cameraAngle: "side",
      frames: buildDeadliftFixtureFrames(),
      poseProvider: "diagnostics_fixture",
      fixture: true,
    });
    expect(report.overallTechniqueScore).not.toBeNull();
    expect(report.techniqueAssessment?.metricsObserved.length).toBeGreaterThan(
      0,
    );
    expect(report.techniqueAssessment?.metricsUnavailable.length).toBeGreaterThan(
      0,
    );
  });
});
