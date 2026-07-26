import { SCORE_DEFINITIONS } from "@/domain/scoring/definitions";
import { buildResult, mean } from "@/domain/scoring/result";
import {
  TECHNIQUE_MIN_ANALYSES_FOR_HIGH,
  TECHNIQUE_MIN_ANALYSES_FOR_MEDIUM,
} from "@/domain/scoring/thresholds";
import type { ScoreResult, ScoringSnapshot } from "@/domain/scoring/types";

const def = SCORE_DEFINITIONS.technique;

export function computeTechniqueScore(snapshot: ScoringSnapshot): ScoreResult {
  const analyses = snapshot.techniqueAnalyses;
  const inputs = analyses.map((a, index) => ({
    key: `technique[${index}]`,
    label: "Completed technique overallScore",
    value: a.overallScore,
    unit: "points",
    source: a.confidenceBasis,
  }));

  if (analyses.length === 0) {
    return buildResult({
      scoreKey: "technique",
      score: null,
      confidence: "none",
      inputs,
      missingInputs: [
        `Need ≥${TECHNIQUE_MIN_ANALYSES_FOR_MEDIUM} completed analyses with overallScore`,
      ],
      explanation: "Technique Score not computed — no completed analyses.",
      formulaId: "technique.mean_overall.v1",
      formulaDescription: def.formula,
      minimumData: def.requiredMinimumData,
      timestamp: snapshot.now,
    });
  }

  const score = mean(analyses.map((a) => a.overallScore));
  const allObserved = analyses.every((a) => a.confidenceBasis === "observed");

  let confidence: ScoreResult["confidence"];
  if (
    analyses.length >= TECHNIQUE_MIN_ANALYSES_FOR_HIGH &&
    allObserved
  ) {
    confidence = "high";
  } else if (analyses.length >= TECHNIQUE_MIN_ANALYSES_FOR_MEDIUM) {
    confidence = "medium";
  } else {
    confidence = "low";
  }

  const missingInputs =
    analyses.length < TECHNIQUE_MIN_ANALYSES_FOR_MEDIUM
      ? [
          `Need ≥${TECHNIQUE_MIN_ANALYSES_FOR_MEDIUM} analyses for medium confidence (have ${analyses.length})`,
        ]
      : [];

  return buildResult({
    scoreKey: "technique",
    score,
    confidence,
    inputs,
    missingInputs,
    explanation:
      confidence === "low"
        ? `Technique mean from ${analyses.length} analysis — confidence low until a second analysis exists.`
        : `Technique Score is the mean of ${analyses.length} completed overallScore value(s).`,
    formulaId: "technique.mean_overall.v1",
    formulaDescription: def.formula,
    minimumData: def.requiredMinimumData,
    notes: [`allObserved=${allObserved}`],
    timestamp: snapshot.now,
  });
}
