import { describe, expect, it } from "vitest";
import {
  analyzeBarPath,
  BAR_PATH_ENGINE_VERSION,
} from "@/domain/movement/bar-path";
import { buildDeadliftFixtureFrames } from "@/domain/movement/fixture";
import { runMovementPipeline } from "@/domain/movement/pipeline";
import type { PoseFrame } from "@/domain/movement/types";

function stripWrists(frames: PoseFrame[]): PoseFrame[] {
  return frames.map((f) => ({
    ...f,
    landmarks: f.landmarks.filter(
      (l) => l.name !== "left_wrist" && l.name !== "right_wrist",
    ),
  }));
}

describe("Bar Path Intelligence", () => {
  it("exports engine version", () => {
    expect(BAR_PATH_ENGINE_VERSION).toBe("bar_path.v1");
  });

  it("tracks deadlift bar path when wrist confidence is good", () => {
    const result = analyzeBarPath({
      exerciseSlug: "deadlift",
      cameraAngle: "side",
      frames: buildDeadliftFixtureFrames(3),
    });
    expect(result.displayable).toBe(true);
    expect(result.horizontalDeviation).not.toBeNull();
    expect(result.verticalPath).not.toBeNull();
    expect(result.pathPoints.length).toBeGreaterThan(0);
    expect(result.proxy).toBe("mid_wrist");
  });

  it("hides metrics when wrists are missing — never fabricates", () => {
    const result = analyzeBarPath({
      exerciseSlug: "deadlift",
      cameraAngle: "side",
      frames: stripWrists(buildDeadliftFixtureFrames(3)),
    });
    expect(result.displayable).toBe(false);
    expect(result.horizontalDeviation).toBeNull();
    expect(result.verticalPath).toBeNull();
    expect(result.repConsistency).toBeNull();
    expect(result.pathPoints).toEqual([]);
    expect(result.unavailableReason).toMatch(/hidden|insufficient|coverage/i);
  });

  it("requires side view for squat and bench", () => {
    const squatFront = analyzeBarPath({
      exerciseSlug: "back-squat",
      cameraAngle: "front",
      frames: buildDeadliftFixtureFrames(3),
    });
    expect(squatFront.displayable).toBe(false);
    expect(squatFront.unavailableReason).toMatch(/side-view/i);

    const squatSide = analyzeBarPath({
      exerciseSlug: "back-squat",
      cameraAngle: "side",
      frames: buildDeadliftFixtureFrames(3),
    });
    expect(squatSide.liftKind).toBe("squat");
    // Fixture has wrists — side squat may display
    expect(squatSide.displayable).toBe(true);

    const benchSide = analyzeBarPath({
      exerciseSlug: "bench-press",
      cameraAngle: "side",
      frames: buildDeadliftFixtureFrames(3),
    });
    expect(benchSide.liftKind).toBe("bench");
  });

  it("attaches barPath on movement pipeline for deadlift", () => {
    const report = runMovementPipeline({
      exerciseSlug: "deadlift",
      cameraAngle: "side",
      frames: buildDeadliftFixtureFrames(3),
      poseProvider: "test",
      fixture: true,
    });
    expect(report.barPath).not.toBeNull();
    expect(report.barPath?.displayable).toBe(true);
  });

  it("still returns barPath (possibly displayable) for side-view squat without inventing Technique Score", () => {
    const report = runMovementPipeline({
      exerciseSlug: "back-squat",
      cameraAngle: "side",
      frames: buildDeadliftFixtureFrames(3),
      poseProvider: "test",
    });
    expect(report.supportedExercise).toBe(false);
    expect(report.overallTechniqueScore).toBeNull();
    expect(report.barPath).not.toBeNull();
    expect(report.barPath?.liftKind).toBe("squat");
  });
});
