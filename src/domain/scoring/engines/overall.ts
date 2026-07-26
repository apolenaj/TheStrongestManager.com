import { displayableScore, minConfidence } from "@/domain/scoring/confidence";
import { SCORE_DEFINITIONS } from "@/domain/scoring/definitions";
import { buildResult, mean } from "@/domain/scoring/result";
import { OVERALL_MIN_DISPLAYABLE_PILLARS } from "@/domain/scoring/thresholds";
import type { ScoreResult } from "@/domain/scoring/types";

const def = SCORE_DEFINITIONS.overall;

const PILLAR_KEYS = [
  "strength",
  "technique",
  "programming",
  "recovery",
  "consistency",
] as const;

export function computeOverallScore(
  pillars: ScoreResult[],
  now: Date,
): ScoreResult {
  const byKey = new Map(pillars.map((p) => [p.scoreKey, p]));
  const included: ScoreResult[] = [];

  for (const key of PILLAR_KEYS) {
    const pillar = byKey.get(key);
    if (!pillar) continue;
    const value = displayableScore(pillar);
    if (value != null) included.push(pillar);
  }

  const inputs = included.map((p) => ({
    key: p.scoreKey,
    label: `${p.scoreKey} (displayable)`,
    value: p.score,
    unit: "points",
    source: "heuristic" as const,
  }));

  if (included.length < OVERALL_MIN_DISPLAYABLE_PILLARS) {
    return buildResult({
      scoreKey: "overall",
      score: null,
      confidence: "none",
      inputs,
      missingInputs: [
        `≥ ${OVERALL_MIN_DISPLAYABLE_PILLARS} displayable pillars (have ${included.length})`,
      ],
      explanation:
        "Overall Athlete Score not computed — too few pillars pass the confidence display gate.",
      formulaId: "overall.equal_mean.v1",
      formulaDescription: def.formula,
      minimumData: def.requiredMinimumData,
      notes: PILLAR_KEYS.map((key) => {
        const pillar = byKey.get(key);
        if (!pillar) return `${key}=missing`;
        return `${key}=score:${pillar.score ?? "null"},confidence:${pillar.confidence},displayable:${displayableScore(pillar) != null}`;
      }),
      timestamp: now,
    });
  }

  const score = mean(included.map((p) => p.score as number));
  const confidence = minConfidence(included.map((p) => p.confidence));

  return buildResult({
    scoreKey: "overall",
    score,
    confidence,
    inputs,
    missingInputs: [],
    explanation: `Overall Athlete Score is the equal-weight mean of ${included.length} displayable pillars.`,
    formulaId: "overall.equal_mean.v1",
    formulaDescription: def.formula,
    minimumData: def.requiredMinimumData,
    notes: included.map((p) => `${p.scoreKey}=${p.score}`),
    timestamp: now,
  });
}
