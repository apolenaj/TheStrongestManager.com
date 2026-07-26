import {
  EXERCISE_PRESCRIPTION_ENGINE_VERSION,
  EXERCISE_PRESCRIPTION_HONESTY,
  EXERCISE_PRESCRIPTION_MAX_RESULTS,
  EXERCISE_PRESCRIPTION_MIN_RULE_HITS,
} from "@/domain/exercise-prescription/constants";
import { PRESCRIPTION_RULES } from "@/domain/exercise-prescription/rules";
import {
  bestPlacementFor,
  expectedFatigueFor,
  primaryPurposeFor,
  skillDemandFor,
} from "@/domain/exercise-prescription/meta";
import { variationNeighborSlugs } from "@/domain/exercise-relationship-graph";
import { gateExerciseEquipment } from "@/domain/equipment-profiles";
import type {
  ExercisePrescriptionAlternative,
  ExercisePrescriptionCandidate,
  ExercisePrescriptionInputs,
  ExercisePrescriptionMatchedRule,
  ExercisePrescriptionRecommendation,
  ExercisePrescriptionResult,
} from "@/domain/exercise-prescription/types";

type ScoreBucket = {
  slug: string;
  score: number;
  reasons: string[];
  ruleIds: string[];
  ruleLabels: string[];
};

function unique(list: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of list) {
    const key = item.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function difficultyPenalty(
  candidate: ExercisePrescriptionCandidate,
  inputs: ExercisePrescriptionInputs,
): number {
  if (inputs.experience !== "beginner") return 0;
  if (candidate.difficulty === "advanced") return -4;
  if (candidate.difficulty === "intermediate") return -1;
  return 0;
}

function painPenalty(
  candidate: ExercisePrescriptionCandidate,
  inputs: ExercisePrescriptionInputs,
): number {
  if (!inputs.painFlags) return 0;
  if (
    candidate.category === "compound" &&
    skillDemandFor(candidate) === "high"
  ) {
    return -3;
  }
  return 0;
}

function alreadyInProgramPenalty(
  candidate: ExercisePrescriptionCandidate,
  inputs: ExercisePrescriptionInputs,
): number {
  if (inputs.currentProgramExerciseSlugs.includes(candidate.slug)) {
    return -2; // still allow, but prefer filling gaps
  }
  return 0;
}

/**
 * Multi-rule exercise prescription.
 * Requires ≥ EXERCISE_PRESCRIPTION_MIN_RULE_HITS distinct rules per recommendation.
 */
export function recommendExercises(input: {
  inputs: ExercisePrescriptionInputs;
  candidates: ExercisePrescriptionCandidate[];
}): ExercisePrescriptionResult {
  const { inputs, candidates } = input;
  const bySlug = new Map(candidates.map((c) => [c.slug, c]));
  const missingInformation: string[] = [];

  if (candidates.length === 0) {
    return {
      engineVersion: EXERCISE_PRESCRIPTION_ENGINE_VERSION,
      inputs,
      recommendations: [],
      matchedRules: [],
      missingInformation: ["Published exercise catalog"],
      disclaimers: EXERCISE_PRESCRIPTION_HONESTY,
      emptyReason:
        "No published exercises are available to recommend from — refusing to invent lifts.",
    };
  }

  if (inputs.equipment.length === 0) {
    missingInformation.push(
      "Equipment profile (primary recommendations stay withheld until gear is set)",
    );
  }
  if (!inputs.experience) {
    missingInformation.push("Experience level");
  }
  if (inputs.currentProgramExerciseSlugs.length === 0) {
    missingInformation.push(
      "Current program exercises (gap-filling rules stay inactive)",
    );
  }

  const scores = new Map<string, ScoreBucket>();
  for (const c of candidates) {
    const gate = gateExerciseEquipment({
      required: c.equipment,
      available: inputs.equipment,
    });
    if (!gate.allowPrimary) continue;
    scores.set(c.slug, {
      slug: c.slug,
      score: 0,
      reasons: [],
      ruleIds: [],
      ruleLabels: [],
    });
  }

  const matchedRules: ExercisePrescriptionMatchedRule[] = [];

  for (const rule of PRESCRIPTION_RULES) {
    if (!rule.when(inputs)) continue;
    matchedRules.push({
      id: rule.id,
      label: rule.label,
      description: rule.description,
    });

    for (const effect of rule.effects) {
      const bucket = scores.get(effect.slug);
      if (!bucket) continue; // unknown / filtered slug — never invent
      bucket.score += effect.weight;
      bucket.reasons.push(effect.reason);
      if (!bucket.ruleIds.includes(rule.id)) {
        bucket.ruleIds.push(rule.id);
        bucket.ruleLabels.push(rule.label);
      }
    }
  }

  // Apply soft penalties (not sole prescribe heuristics)
  for (const [slug, bucket] of scores) {
    const candidate = bySlug.get(slug);
    if (!candidate) continue;
    bucket.score += difficultyPenalty(candidate, inputs);
    bucket.score += painPenalty(candidate, inputs);
    bucket.score += alreadyInProgramPenalty(candidate, inputs);
  }

  const eligible = [...scores.values()]
    .filter((b) => b.ruleIds.length >= EXERCISE_PRESCRIPTION_MIN_RULE_HITS)
    .filter((b) => b.score > 0)
    .sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug));

  if (eligible.length === 0) {
    const fired = matchedRules.length;
    return {
      engineVersion: EXERCISE_PRESCRIPTION_ENGINE_VERSION,
      inputs,
      recommendations: [],
      matchedRules,
      missingInformation,
      disclaimers: EXERCISE_PRESCRIPTION_HONESTY,
      emptyReason:
        fired === 0
          ? "No prescription rules matched your inputs — refine goal, weak point, or equipment rather than inventing lifts."
          : `Rules fired, but no catalog exercise reached ≥${EXERCISE_PRESCRIPTION_MIN_RULE_HITS} distinct rule hits (single-heuristic auto-prescribe is blocked).`,
    };
  }

  const top = eligible.slice(0, EXERCISE_PRESCRIPTION_MAX_RESULTS);
  const recommendations: ExercisePrescriptionRecommendation[] = [];

  for (const bucket of top) {
    const candidate = bySlug.get(bucket.slug);
    if (!candidate) continue;

    const altBuckets = eligible
      .filter((b) => b.slug !== bucket.slug)
      .slice(0, 3);

    const alternatives: ExercisePrescriptionAlternative[] = altBuckets
      .map((alt) => {
        const c = bySlug.get(alt.slug);
        if (!c) return null;
        return {
          slug: c.slug,
          name: c.name,
          reason: unique(alt.reasons)[0] ?? "Also supported by multiple rules.",
          requiresUnavailableEquipment: false,
          equipmentNote: null,
        };
      })
      .filter((a): a is NonNullable<typeof a> => a != null);

    const pushAlt = (
      c: ExercisePrescriptionCandidate,
      reason: string,
    ) => {
      if (alternatives.length >= 3) return;
      if (alternatives.some((a) => a.slug === c.slug)) return;
      const gate = gateExerciseEquipment({
        required: c.equipment,
        available: inputs.equipment,
      });
      if (gate.allowPrimary) {
        alternatives.push({
          slug: c.slug,
          name: c.name,
          reason,
          requiresUnavailableEquipment: false,
          equipmentNote: null,
        });
        return;
      }
      if (gate.allowAsAlternative) {
        alternatives.push({
          slug: c.slug,
          name: c.name,
          reason,
          requiresUnavailableEquipment: true,
          equipmentNote:
            gate.equipmentNote ??
            "Alternative — requires equipment not in your profile.",
        });
      }
    };

    // Prefer related catalog regressions/progressions as alternatives when scored
    for (const related of candidate.relatedSlugs) {
      if (alternatives.length >= 3) break;
      const c = bySlug.get(related);
      if (!c) continue;
      pushAlt(c, "Related catalog variation / regression / progression.");
    }

    // Graph variation neighbors (Prompt 109) — curated edges only
    for (const related of variationNeighborSlugs(candidate.slug)) {
      if (alternatives.length >= 3) break;
      const c = bySlug.get(related);
      if (!c) continue;
      pushAlt(c, "Exercise relationship graph variation edge.");
    }

    recommendations.push({
      slug: candidate.slug,
      name: candidate.name,
      reason: unique(bucket.reasons)[0] ?? "Supported by multiple prescription rules.",
      primaryPurpose: primaryPurposeFor(candidate, inputs.weakPoint),
      expectedFatigue: expectedFatigueFor(candidate),
      skillDemand: skillDemandFor(candidate),
      bestPlacementInWeek: bestPlacementFor(candidate),
      alternatives: alternatives.slice(0, 3),
      score: bucket.score,
      matchedRuleIds: bucket.ruleIds,
      matchedRuleLabels: bucket.ruleLabels,
      href: `/exercises/${candidate.slug}`,
    });
  }

  // Pain disclaimer
  const disclaimers: string[] = [...EXERCISE_PRESCRIPTION_HONESTY];
  if (inputs.painFlags) {
    disclaimers.push(
      "Movement caution notes are on file — treat recommendations as optional ideas and stop if pain increases. This is not a diagnosis.",
    );
  }

  return {
    engineVersion: EXERCISE_PRESCRIPTION_ENGINE_VERSION,
    inputs,
    recommendations,
    matchedRules,
    missingInformation,
    disclaimers,
    emptyReason: null,
  };
}
