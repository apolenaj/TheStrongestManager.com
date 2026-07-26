import { describe, expect, it } from "vitest";
import { buildDeadliftFixtureFrames } from "@/domain/movement/fixture";
import { detectDeadliftPhases } from "@/domain/movement/deadlift/phases";
import { runMovementPipeline } from "@/domain/movement/pipeline";
import {
  buildLiftPhaseAnalysis,
  BENCH_PHASE_CATALOG,
  SQUAT_PHASE_CATALOG,
} from "@/domain/movement/phases";
import {
  benchPhasesImplemented,
  squatPhasesImplemented,
} from "@/domain/movement/phases/unsupported";
import type { PoseFrame } from "@/domain/movement/types";

function stripKnees(frames: PoseFrame[]): PoseFrame[] {
  return frames.map((f) => ({
    ...f,
    landmarks: f.landmarks.filter(
      (l) => l.name !== "left_knee" && l.name !== "right_knee",
    ),
  }));
}

describe("Lift Phase Analysis (Prompt 61)", () => {
  it("segments deadlift into setup → initial_pull → knee_level → lockout when knees+wrists are reliable", () => {
    const frames = buildDeadliftFixtureFrames(3);
    const phases = detectDeadliftPhases(frames);
    const ids = phases.map((p) => p.phase);
    expect(ids).toContain("setup");
    expect(ids).toContain("initial_pull");
    expect(ids).toContain("knee_level");
    expect(ids).toContain("lockout");
    expect(ids).not.toContain("unknown");
    // Primary order (descent optional after)
    const primary = ids.filter((p) =>
      ["setup", "initial_pull", "knee_level", "lockout"].includes(p),
    );
    expect(primary).toEqual([
      "setup",
      "initial_pull",
      "knee_level",
      "lockout",
    ]);
  });

  it("does not invent knee_level when knees are missing — falls back to pull", () => {
    const frames = stripKnees(buildDeadliftFixtureFrames(3));
    const phases = detectDeadliftPhases(frames);
    const ids = phases.map((p) => p.phase);
    expect(ids).not.toContain("knee_level");
    expect(ids).toContain("pull");
    expect(ids).toContain("setup");
    expect(ids).toContain("lockout");
  });

  it("builds clickable phase insights with metric / issue / recommendation fields", () => {
    const report = runMovementPipeline({
      exerciseSlug: "deadlift",
      cameraAngle: "side",
      frames: buildDeadliftFixtureFrames(3),
      poseProvider: "test",
      fixture: true,
    });
    const view = buildLiftPhaseAnalysis(report);
    expect(view.phasesSupported).toBe(true);
    expect(view.insights.length).toBeGreaterThan(0);
    for (const insight of view.insights) {
      expect(insight.label).toBeTruthy();
      expect(insight.recommendation).toBeTruthy();
      expect(insight.startTimeSeconds).toBeGreaterThanOrEqual(0);
      // metric may be null honestly; issue may be null
      expect(insight).toHaveProperty("metric");
      expect(insight).toHaveProperty("issue");
    }
    const knee = view.insights.find((i) => i.phase === "knee_level");
    expect(knee).toBeDefined();
    expect(knee?.recommendation).toMatch(/knee/i);
  });

  it("does not implement squat or bench phase detection yet", () => {
    expect(squatPhasesImplemented()).toBe(false);
    expect(benchPhasesImplemented()).toBe(false);
    expect(SQUAT_PHASE_CATALOG).toEqual([
      "setup",
      "descent",
      "bottom",
      "sticking_region",
      "lockout",
    ]);
    expect(BENCH_PHASE_CATALOG).toEqual([
      "setup",
      "descent",
      "touch",
      "initial_press",
      "mid_range",
      "lockout",
    ]);
  });

  it("returns honest unavailable state for squat/bench uploads", () => {
    const squat = runMovementPipeline({
      exerciseSlug: "back-squat",
      cameraAngle: "side",
      frames: buildDeadliftFixtureFrames(2),
      poseProvider: "test",
    });
    expect(squat.supportedExercise).toBe(false);
    expect(squat.phases).toEqual([]);
    expect(squat.summary).toMatch(/not detected yet|catalogued/i);

    const view = buildLiftPhaseAnalysis(squat);
    expect(view.phasesSupported).toBe(false);
    expect(view.insights).toEqual([]);
    expect(view.catalogPhases.every((p) => !p.implemented)).toBe(true);
  });
});
