import { evaluateDeadliftComponents } from "@/domain/movement/deadlift/score/components";
import {
  DEADLIFT_TECHNIQUE_ASSUMPTIONS,
  DEADLIFT_TECHNIQUE_FORMULA_ID,
  DEADLIFT_TECHNIQUE_FORMULA_VERSION,
  DEADLIFT_TECHNIQUE_MIN_COMPONENTS_FOR_HIGH,
  DEADLIFT_TECHNIQUE_MIN_COMPONENTS_FOR_MEDIUM,
  DEADLIFT_TECHNIQUE_MIN_COMPONENTS_FOR_SCORE,
} from "@/domain/movement/deadlift/score/thresholds";
import type {
  DeadliftComponentResult,
  DeadliftTechniqueAssessment,
} from "@/domain/movement/deadlift/score/types";
import { clamp01, confidenceFromScore } from "@/domain/movement/geometry";
import type {
  CameraSuitability,
  MovementPhaseSegment,
  ObservableMetric,
  PoseFrame,
} from "@/domain/movement/types";

function renormalize(
  components: DeadliftComponentResult[],
): DeadliftComponentResult[] {
  const observed = components.filter((c) => c.status === "observed");
  const weightSum = observed.reduce((acc, c) => acc + c.weight, 0);
  return components.map((c) => {
    if (c.status !== "observed" || weightSum <= 0) {
      return { ...c, effectiveWeight: 0 };
    }
    return { ...c, effectiveWeight: c.weight / weightSum };
  });
}

function weightedScore(components: DeadliftComponentResult[]): number | null {
  const observed = components.filter(
    (c) => c.status === "observed" && c.score != null,
  );
  if (observed.length < DEADLIFT_TECHNIQUE_MIN_COMPONENTS_FOR_SCORE) {
    return null;
  }
  const weightSum = observed.reduce((acc, c) => acc + c.effectiveWeight, 0);
  if (weightSum <= 0) return null;
  const total = observed.reduce(
    (acc, c) => acc + (c.score as number) * c.effectiveWeight,
    0,
  );
  return Math.round(total);
}

function buildNarrative(
  components: DeadliftComponentResult[],
  score: number | null,
  suitability: CameraSuitability,
): Pick<
  DeadliftTechniqueAssessment,
  "keyIssue" | "positiveFindings" | "recommendations"
> {
  const observed = components.filter((c) => c.status === "observed");
  const unavailable = components.filter((c) => c.status === "unavailable");

  const positives = observed
    .filter((c) => (c.score ?? 0) >= 75)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 3)
    .map(
      (c) =>
        `${c.label}: ${c.score}/100 — ${c.evidence}`,
    );

  const weakest = observed
    .filter((c) => c.score != null)
    .sort((a, b) => (a.score as number) - (b.score as number))[0];

  let keyIssue: string | null = null;
  if (!suitability.suitable) {
    keyIssue = suitability.message;
  } else if (score == null) {
    keyIssue = `Insufficient observable components for a Technique Score (${observed.length} observed; need ≥${DEADLIFT_TECHNIQUE_MIN_COMPONENTS_FOR_SCORE}). Unavailable: ${unavailable.map((u) => u.label).join(", ") || "—"}.`;
  } else if (weakest && (weakest.score as number) < 55) {
    keyIssue = `${weakest.label} scored ${weakest.score}/100 — ${weakest.evidence}`;
  } else if (weakest) {
    keyIssue = `Lowest component: ${weakest.label} (${weakest.score}/100).`;
  }

  const recommendations: string[] = [];
  if (!suitability.suitable) {
    recommendations.push(
      "Re-record from a clear side view (or 45°) with the full body and bar in frame.",
    );
  }
  if (unavailable.some((u) => u.id === "bracing_indicators")) {
    recommendations.push(
      "Bracing cannot be scored from video pose alone — coach cue breath/brace verbally; do not infer IAP from this score.",
    );
  }
  if (unavailable.some((u) => u.id === "rep_consistency")) {
    recommendations.push(
      "Film 2–3 continuous reps if you want rep-consistency scoring.",
    );
  }
  if (weakest?.id === "back_angle_consistency") {
    recommendations.push(
      "Review torso angle steadiness on a side-view replay (image-plane consistency only — not a spine-safety claim).",
    );
  }
  if (weakest?.id === "lockout") {
    recommendations.push(
      "Check lockout stacking on side view: hips and shoulders closer in the frame at the top (proxy only).",
    );
  }
  if (weakest?.id === "bar_proximity") {
    recommendations.push(
      "If wrists track the bar, keep the implement closer to the body in the side-view frame (wrist–hip proxy).",
    );
  }
  if (weakest?.id === "hip_rise_pattern") {
    recommendations.push(
      "Review hip rise through the pull for abrupt dips or early shoot — image-plane pattern only.",
    );
  }
  if (weakest?.id === "start_position") {
    recommendations.push(
      "Revisit start set-up on side view: shoulder–hip relationship before the bar leaves the floor.",
    );
  }
  if (recommendations.length === 0 && score != null) {
    recommendations.push(
      "Keep filming from the side with consistent framing to track Technique Score over time.",
    );
  }

  return {
    keyIssue,
    positiveFindings: positives,
    recommendations,
  };
}

function assessmentConfidence(
  components: DeadliftComponentResult[],
  suitability: CameraSuitability,
  score: number | null,
): { level: DeadliftTechniqueAssessment["confidence"]; score: number } {
  if (!suitability.suitable || score == null) {
    return { level: "none", score: 0 };
  }
  const observed = components.filter((c) => c.status === "observed");
  const meanConf =
    observed.reduce((acc, c) => acc + c.confidenceScore, 0) /
    Math.max(observed.length, 1);

  let score01 = clamp01(
    (observed.length / DEADLIFT_TECHNIQUE_MIN_COMPONENTS_FOR_HIGH) * 0.55 +
      meanConf * 0.45,
  );

  if (suitability.level === "medium") score01 *= 0.85;
  if (suitability.level === "low") score01 *= 0.5;
  if (suitability.angle !== "side") score01 *= 0.9;

  if (observed.length < DEADLIFT_TECHNIQUE_MIN_COMPONENTS_FOR_MEDIUM) {
    score01 = Math.min(score01, 0.39);
  } else if (
    observed.length >= DEADLIFT_TECHNIQUE_MIN_COMPONENTS_FOR_HIGH &&
    suitability.angle === "side" &&
    meanConf >= 0.55
  ) {
    score01 = Math.max(score01, 0.72);
  }

  return { level: confidenceFromScore(score01), score: score01 };
}

export type AnalyzeDeadliftTechniqueInput = {
  frames: PoseFrame[];
  phases: MovementPhaseSegment[];
  metrics: ObservableMetric[];
  suitability: CameraSuitability;
};

/**
 * Conventional deadlift Technique Score from observable movement components.
 * Returns null score when too few components are observable — never invents.
 */
export function analyzeDeadliftTechnique(
  input: AnalyzeDeadliftTechniqueInput,
): DeadliftTechniqueAssessment {
  const raw = evaluateDeadliftComponents(input);
  const components = renormalize(raw);
  const score = weightedScore(components);

  const metricsObserved = components
    .filter((c) => c.status === "observed")
    .map((c) => c.label);
  const metricsUnavailable = components
    .filter((c) => c.status === "unavailable")
    .map(
      (c) =>
        `${c.label}${c.unavailableReason ? ` — ${c.unavailableReason}` : ""}`,
    );

  const conf = assessmentConfidence(components, input.suitability, score);
  const narrative = buildNarrative(components, score, input.suitability);

  return {
    formulaId: DEADLIFT_TECHNIQUE_FORMULA_ID,
    formulaVersion: DEADLIFT_TECHNIQUE_FORMULA_VERSION,
    score,
    confidence: conf.level,
    confidenceScore: Math.round(conf.score * 1000) / 1000,
    components,
    metricsObserved,
    metricsUnavailable,
    keyIssue: narrative.keyIssue,
    positiveFindings: narrative.positiveFindings,
    recommendations: narrative.recommendations,
    assumptions: [...DEADLIFT_TECHNIQUE_ASSUMPTIONS],
  };
}
