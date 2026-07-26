/**
 * Explain tradeoffs vs the unavailable exercise.
 */

import {
  expectedFatigueFor,
  primaryPurposeFor,
  skillDemandFor,
} from "@/domain/exercise-prescription/meta";
import type {
  ExerciseSubstitutionCandidate,
  SubstitutionTradeoff,
} from "@/domain/exercise-substitutions/types";
import type { ExerciseSubstitutionGoal } from "@/domain/exercise-substitutions/constants";

const FATIGUE_RANK = { low: 0, moderate: 1, high: 2 } as const;
const SKILL_RANK = { low: 0, moderate: 1, high: 2 } as const;

function compareRank(
  a: number,
  b: number,
): SubstitutionTradeoff["vsUnavailable"] {
  if (a < b) return "better";
  if (a > b) return "worse";
  return "similar";
}

export function buildSubstitutionTradeoffs(input: {
  unavailable: ExerciseSubstitutionCandidate;
  candidate: ExerciseSubstitutionCandidate;
  goal: ExerciseSubstitutionGoal;
}): SubstitutionTradeoff[] {
  const { unavailable, candidate, goal } = input;
  const tradeoffs: SubstitutionTradeoff[] = [];

  // Goal
  const candHasChest = candidate.primaryMuscles.includes("chest");
  const unHasChest = unavailable.primaryMuscles.includes("chest");
  if (goal === "chest_strength") {
    tradeoffs.push({
      dimension: "goal",
      vsUnavailable:
        candHasChest && unHasChest
          ? "similar"
          : candHasChest
            ? "better"
            : "worse",
      summary: candHasChest
        ? "Still targets chest for strength-oriented pressing."
        : "Weaker chest-strength alignment than the unavailable lift.",
    });
  } else {
    tradeoffs.push({
      dimension: "goal",
      vsUnavailable: "similar",
      summary: primaryPurposeFor(candidate, "none"),
    });
  }

  // Movement pattern
  tradeoffs.push({
    dimension: "movement_pattern",
    vsUnavailable:
      candidate.movementPattern === unavailable.movementPattern
        ? "similar"
        : "different",
    summary:
      candidate.movementPattern === unavailable.movementPattern
        ? `Keeps the ${candidate.movementPattern} pattern.`
        : `Shifts from ${unavailable.movementPattern} to ${candidate.movementPattern}.`,
  });

  // Fatigue
  const fCand = expectedFatigueFor(candidate);
  const fUn = expectedFatigueFor(unavailable);
  tradeoffs.push({
    dimension: "fatigue",
    vsUnavailable: compareRank(FATIGUE_RANK[fCand], FATIGUE_RANK[fUn]),
    summary:
      fCand === fUn
        ? `Similar expected fatigue (${fCand}).`
        : FATIGUE_RANK[fCand] < FATIGUE_RANK[fUn]
          ? `Lower expected fatigue (${fCand} vs ${fUn}).`
          : `Higher expected fatigue (${fCand} vs ${fUn}).`,
  });

  // Skill
  const sCand = skillDemandFor(candidate);
  const sUn = skillDemandFor(unavailable);
  tradeoffs.push({
    dimension: "skill",
    vsUnavailable: compareRank(SKILL_RANK[sCand], SKILL_RANK[sUn]),
    summary:
      sCand === sUn
        ? `Similar skill demand (${sCand}).`
        : SKILL_RANK[sCand] < SKILL_RANK[sUn]
          ? `Easier skill demand (${sCand} vs ${sUn}).`
          : `Higher skill demand (${sCand} vs ${sUn}).`,
  });

  // Specificity / equipment
  const usesBarbell = candidate.equipment.includes("barbell");
  const unBarbell = unavailable.equipment.includes("barbell");
  if (unBarbell && !usesBarbell) {
    tradeoffs.push({
      dimension: "specificity",
      vsUnavailable: "worse",
      summary:
        "Less competition-barbell specificity — useful when the bar is unavailable, weaker as a meet-specific substitute.",
    });
  } else if (!unBarbell && usesBarbell) {
    tradeoffs.push({
      dimension: "specificity",
      vsUnavailable: "better",
      summary: "Adds barbell specificity versus the unavailable option.",
    });
  } else {
    tradeoffs.push({
      dimension: "equipment",
      vsUnavailable: "different",
      summary: `Uses ${candidate.equipment.join(", ") || "minimal"} equipment.`,
    });
  }

  return tradeoffs;
}
