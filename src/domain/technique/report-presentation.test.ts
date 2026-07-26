import { describe, expect, it } from "vitest";
import type { DeadliftTechniqueAssessment } from "@/domain/movement/deadlift/score/types";
import {
  TECHNIQUE_REPORT_MAX_ACTIONS,
  buildComparisonSummary,
  buildTimelineMarkers,
  prioritizeTechniqueActions,
  suggestionsForActions,
  topPositiveFindings,
} from "@/domain/technique/report-presentation";

function sampleAssessment(
  overrides?: Partial<DeadliftTechniqueAssessment>,
): DeadliftTechniqueAssessment {
  return {
    formulaId: "deadlift.technique.weighted_v1",
    formulaVersion: "1.0.0",
    score: 72,
    confidence: "medium",
    confidenceScore: 0.6,
    components: [
      {
        id: "lockout",
        label: "Lockout",
        score: 88,
        weight: 0.12,
        effectiveWeight: 0.2,
        status: "observed",
        confidence: "medium",
        confidenceScore: 0.6,
        evidence: "Stacked well.",
        sourceMetricKeys: [],
      },
      {
        id: "back_angle_consistency",
        label: "Back-angle consistency",
        score: 42,
        weight: 0.18,
        effectiveWeight: 0.3,
        status: "observed",
        confidence: "medium",
        confidenceScore: 0.55,
        evidence: "High variance.",
        sourceMetricKeys: [],
      },
      {
        id: "bar_proximity",
        label: "Bar proximity",
        score: 50,
        weight: 0.12,
        effectiveWeight: 0.2,
        status: "observed",
        confidence: "low",
        confidenceScore: 0.4,
        evidence: "Wrists away.",
        sourceMetricKeys: [],
      },
      {
        id: "hip_rise_pattern",
        label: "Hip rise pattern",
        score: 48,
        weight: 0.15,
        effectiveWeight: 0.25,
        status: "observed",
        confidence: "medium",
        confidenceScore: 0.5,
        evidence: "Early shoot.",
        sourceMetricKeys: [],
      },
      {
        id: "bracing_indicators",
        label: "Bracing indicators",
        score: null,
        weight: 0.08,
        effectiveWeight: 0,
        status: "unavailable",
        unavailableReason: "Not observable",
        confidence: "none",
        confidenceScore: 0,
        evidence: "Not observable",
        sourceMetricKeys: [],
      },
    ],
    metricsObserved: [],
    metricsUnavailable: [],
    keyIssue: "Back-angle consistency scored 42/100",
    positiveFindings: ["Lockout: 88/100 — Stacked well."],
    recommendations: ["Film side view"],
    assumptions: [],
    ...overrides,
  };
}

describe("prioritizeTechniqueActions", () => {
  it("returns at most 3 actions from weakest components", () => {
    const actions = prioritizeTechniqueActions(sampleAssessment());
    expect(actions.length).toBeLessThanOrEqual(TECHNIQUE_REPORT_MAX_ACTIONS);
    expect(actions[0]?.title).toBe("Back-angle consistency");
    expect(actions.map((a) => a.title)).not.toContain("Lockout");
  });

  it("does not dump every unavailable metric as a warning", () => {
    const actions = prioritizeTechniqueActions(sampleAssessment());
    expect(actions.every((a) => a.id !== "bracing_indicators")).toBe(true);
  });
});

describe("suggestionsForActions", () => {
  it("caps drills and exercises to top priorities", () => {
    const actions = prioritizeTechniqueActions(sampleAssessment());
    const { drills, exercises } = suggestionsForActions(actions);
    expect(drills.length).toBeLessThanOrEqual(TECHNIQUE_REPORT_MAX_ACTIONS);
    expect(exercises.length).toBeLessThanOrEqual(TECHNIQUE_REPORT_MAX_ACTIONS);
    expect(drills.length).toBeGreaterThan(0);
  });
});

describe("buildComparisonSummary", () => {
  it("computes score delta vs previous", () => {
    const comparison = buildComparisonSummary({
      previous: {
        id: "prev",
        createdAt: new Date("2026-01-01"),
        overallScore: 60,
        confidenceBasis: "observed",
        movementReport: null,
      },
      currentId: "curr",
      currentScore: 72,
      currentConfidence: "medium",
    });
    expect(comparison?.delta).toBe(12);
    expect(comparison?.previousScore).toBe(60);
    expect(comparison?.currentScore).toBe(72);
    expect(comparison?.currentId).toBe("curr");
  });

  it("returns null when no previous analysis", () => {
    expect(
      buildComparisonSummary({
        previous: null,
        currentId: "curr",
        currentScore: 70,
        currentConfidence: "medium",
      }),
    ).toBeNull();
  });
});

describe("buildTimelineMarkers", () => {
  it("maps phases to seekable markers", () => {
    const markers = buildTimelineMarkers({
      pipelineVersion: "movement.v1",
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
          phase: "pull",
          startFrame: 6,
          endFrame: 20,
          startTimeSeconds: 0.9,
          endTimeSeconds: 2.1,
          confidence: "medium",
          confidenceScore: 0.5,
          note: "",
        },
      ],
      metrics: [],
      heuristics: [],
      reportConfidence: "medium",
      reportConfidenceScore: 0.5,
      summary: "",
      diagnostics: {
        poseProvider: "test",
        frameCount: 10,
        framesWithMidHip: 10,
        meanLandmarkVisibility: 0.9,
        pipelineVersion: "movement.v1",
        fixture: true,
        landmarkCoverageByName: {},
        warnings: [],
      },
      disclaimers: [],
      overallTechniqueScore: 70,
      techniqueAssessment: null,
      barPath: null,
    });
    expect(markers).toHaveLength(2);
    expect(markers[0]?.label).toBe("Setup");
    expect(markers[1]?.timeSeconds).toBe(0.9);
    expect(markers[0]?.confidence).toBe("medium");
  });
});

describe("topPositiveFindings", () => {
  it("caps positives to avoid overload", () => {
    expect(topPositiveFindings(sampleAssessment()).length).toBeLessThanOrEqual(
      TECHNIQUE_REPORT_MAX_ACTIONS,
    );
  });
});
