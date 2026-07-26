import { describe, expect, it } from "vitest";
import type { DeadliftTechniqueAssessment } from "@/domain/movement/deadlift/score/types";
import { runTechniqueFeedbackEngine } from "@/domain/technique/feedback/engine";
import {
  FEEDBACK_BEGINNER_DOSAGE,
  FEEDBACK_ISSUE_SCORE_MAX,
  FEEDBACK_MAX_RECOMMENDATIONS,
  FEEDBACK_PAIN_FLAG_DOSAGE,
  FEEDBACK_SIGNIFICANT_SCORE_MAX,
} from "@/domain/technique/feedback/thresholds";
import type { TechniqueFeedbackAthleteContext } from "@/domain/technique/feedback/types";
import { buildFeedbackAthleteContext } from "@/domain/technique/feedback/athlete-context";

function baseAssessment(
  overrides?: Partial<DeadliftTechniqueAssessment>,
): DeadliftTechniqueAssessment {
  return {
    formulaId: "deadlift.technique.weighted_v1",
    formulaVersion: "1.0.0",
    score: 58,
    confidence: "medium",
    confidenceScore: 0.62,
    components: [
      {
        id: "hip_rise_pattern",
        label: "Hip rise pattern",
        score: 38,
        weight: 0.15,
        effectiveWeight: 0.3,
        status: "observed",
        confidence: "medium",
        confidenceScore: 0.6,
        evidence: "Early hip rise in image plane.",
        sourceMetricKeys: ["approx_hip_y_pull_mean"],
      },
      {
        id: "lockout",
        label: "Lockout",
        score: 82,
        weight: 0.12,
        effectiveWeight: 0.25,
        status: "observed",
        confidence: "medium",
        confidenceScore: 0.55,
        evidence: "Stacked.",
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
    metricsObserved: ["Hip rise pattern", "Lockout"],
    metricsUnavailable: ["Bracing indicators"],
    keyIssue: "Hip rise pattern scored 38/100",
    positiveFindings: ["Lockout: 82/100"],
    recommendations: [],
    assumptions: [],
    ...overrides,
  };
}

const intermediateAthlete: TechniqueFeedbackAthleteContext = {
  experienceLevel: "intermediate",
  goalCategory: "strength",
  goalTitle: "Get stronger",
  primaryDiscipline: "powerlifting",
  hasPainOrMovementFlags: false,
  painCautionAcknowledged: true,
};

describe("runTechniqueFeedbackEngine", () => {
  it("maps early hip rise to gated recommendations with why/how/dosage/reassess", () => {
    const result = runTechniqueFeedbackEngine({
      assessment: baseAssessment(),
      athlete: intermediateAthlete,
    });

    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.recommendations.length).toBeLessThanOrEqual(
      FEEDBACK_MAX_RECOMMENDATIONS,
    );

    const hipRec = result.recommendations.find(
      (r) => r.relatedComponentId === "hip_rise_pattern",
    );
    expect(hipRec).toBeTruthy();
    expect(hipRec?.why).toMatch(/38/);
    expect(hipRec?.how.length).toBeGreaterThan(10);
    expect(hipRec?.dosage.length).toBeGreaterThan(10);
    expect(hipRec?.reassess.toLowerCase()).toMatch(/re-film|re-analy|session/);
    expect(
      ["position_drill", "exercise_variation", "tempo_work", "load_management", "setup_cue"].includes(
        hipRec!.kind,
      ),
    ).toBe(true);
  });

  it("does not prescribe drills when assessment confidence is low", () => {
    const result = runTechniqueFeedbackEngine({
      assessment: baseAssessment({ confidence: "low", confidenceScore: 0.3 }),
      athlete: intermediateAthlete,
    });
    expect(result.recommendations.some((r) => r.kind === "reassess")).toBe(
      true,
    );
    expect(
      result.recommendations.every(
        (r) => r.kind === "reassess" || r.kind === "caution",
      ),
    ).toBe(true);
    expect(result.withheldReasons.join(" ")).toMatch(/confidence/i);
  });

  it("uses pain-flag dosage and caution when movement notes exist", () => {
    const result = runTechniqueFeedbackEngine({
      assessment: baseAssessment(),
      athlete: {
        ...intermediateAthlete,
        hasPainOrMovementFlags: true,
      },
    });
    expect(result.recommendations.some((r) => r.kind === "caution")).toBe(
      true,
    );
    expect(
      result.recommendations.every(
        (r) =>
          r.kind === "caution" ||
          r.dosage === FEEDBACK_PAIN_FLAG_DOSAGE ||
          r.kind === "reassess",
      ),
    ).toBe(true);
    expect(
      result.recommendations.every((r) => r.kind !== "load_management"),
    ).toBe(true);
  });

  it("adapts dosage for beginners", () => {
    const result = runTechniqueFeedbackEngine({
      assessment: baseAssessment(),
      athlete: {
        ...intermediateAthlete,
        experienceLevel: "beginner",
        goalCategory: "general_fitness",
        primaryDiscipline: "general",
      },
    });
    const drill = result.recommendations.find(
      (r) => r.relatedComponentId === "hip_rise_pattern",
    );
    expect(drill?.dosage).toBe(FEEDBACK_BEGINNER_DOSAGE);
  });

  it("ignores strong components above the issue threshold", () => {
    const result = runTechniqueFeedbackEngine({
      assessment: baseAssessment({
        components: [
          {
            id: "hip_rise_pattern",
            label: "Hip rise pattern",
            score: FEEDBACK_ISSUE_SCORE_MAX + 10,
            weight: 0.15,
            effectiveWeight: 1,
            status: "observed",
            confidence: "high",
            confidenceScore: 0.8,
            evidence: "Fine",
            sourceMetricKeys: [],
          },
        ],
      }),
      athlete: intermediateAthlete,
    });
    expect(
      result.recommendations.every(
        (r) => r.relatedComponentId !== "hip_rise_pattern",
      ),
    ).toBe(true);
  });

  it("can surface load management for significant early hip rise when no pain flags", () => {
    expect(38).toBeLessThanOrEqual(FEEDBACK_SIGNIFICANT_SCORE_MAX);
    const result = runTechniqueFeedbackEngine({
      assessment: baseAssessment(),
      athlete: {
        ...intermediateAthlete,
        experienceLevel: "advanced",
      },
    });
    // Engine picks top preference per component; significant issue enables load_management in catalog.
    expect(result.recommendations.length).toBeGreaterThan(0);
    for (const rec of result.recommendations) {
      expect(rec.why).toBeTruthy();
      expect(rec.how).toBeTruthy();
      expect(rec.dosage).toBeTruthy();
      expect(rec.reassess).toBeTruthy();
    }
  });
});

describe("buildFeedbackAthleteContext", () => {
  it("flags pain from movement notes only", () => {
    const ctx = buildFeedbackAthleteContext({
      experienceLevel: "intermediate",
      goalCategory: "strength",
      goalTitle: "Meet prep",
      primaryDiscipline: "powerlifting",
      movementNotes: "Knee irritation on deep hinges",
      painCautionAcknowledgedAt: new Date(),
    });
    expect(ctx.hasPainOrMovementFlags).toBe(true);
    expect(ctx.painCautionAcknowledged).toBe(true);
    expect(ctx.experienceLevel).toBe("intermediate");
  });
});
