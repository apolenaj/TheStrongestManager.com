/**
 * Score substitute candidates vs an unavailable exercise.
 */

import {
  expectedFatigueFor,
  skillDemandFor,
} from "@/domain/exercise-prescription/meta";
import { equipmentFullyAvailable } from "@/domain/equipment-profiles";
import type { EquipmentKey } from "@/domain/exercises/types";
import type { ExerciseSubstitutionGoal } from "@/domain/exercise-substitutions/constants";
import type {
  ExerciseSubstitutionCandidate,
  ExerciseSubstitutionContext,
} from "@/domain/exercise-substitutions/types";

function muscleOverlap(
  a: string[],
  b: string[],
): number {
  const set = new Set(b);
  return a.filter((m) => set.has(m)).length;
}

function goalMuscleTargets(goal: ExerciseSubstitutionGoal): string[] {
  if (goal === "chest_strength" || goal === "hypertrophy") {
    return ["chest", "triceps", "front_delts"];
  }
  return [];
}

export function scoreSubstitute(input: {
  unavailable: ExerciseSubstitutionCandidate;
  candidate: ExerciseSubstitutionCandidate;
  goal: ExerciseSubstitutionGoal;
  equipment: EquipmentKey[];
  context: ExerciseSubstitutionContext;
}): { score: number; reasons: string[] } {
  const { unavailable, candidate, goal, equipment, context } = input;
  let score = 0;
  const reasons: string[] = [];

  // Hard equipment gate — never score unavailable gear as a primary substitute
  if (equipment.length === 0) {
    return { score: -100, reasons: ["Equipment profile incomplete"] };
  }
  if (!equipmentFullyAvailable(candidate.equipment, equipment)) {
    return { score: -100, reasons: ["Equipment not available"] };
  }

  // Related / regression graph hints
  if (unavailable.relatedSlugs.includes(candidate.slug)) {
    score += 6;
    reasons.push("Linked as a known regression or variation of the unavailable lift");
  }
  if (candidate.relatedSlugs.includes(unavailable.slug)) {
    score += 3;
    reasons.push("Catalog links this lift back to the unavailable exercise");
  }

  // Movement pattern
  if (candidate.movementPattern === unavailable.movementPattern) {
    score += 5;
    reasons.push(`Same ${candidate.movementPattern} movement pattern`);
  } else {
    score -= 2;
  }

  // Muscle overlap
  const overlap = muscleOverlap(
    candidate.primaryMuscles,
    unavailable.primaryMuscles,
  );
  if (overlap > 0) {
    score += overlap * 2;
    reasons.push(
      `Shares ${overlap} primary muscle target${overlap === 1 ? "" : "s"} with the unavailable lift`,
    );
  }

  // Goal
  const goalMuscles = goalMuscleTargets(goal);
  if (goalMuscles.length > 0) {
    const goalHits = muscleOverlap(candidate.primaryMuscles, goalMuscles);
    score += goalHits * 2;
    if (goalHits > 0) {
      reasons.push("Aligns with the stated goal muscle targets");
    }
  }
  if (goal === "chest_strength" && candidate.primaryMuscles.includes("chest")) {
    score += 3;
    reasons.push("Supports chest strength work");
  }
  if (goal === "powerlifting") {
    const pl = candidate.sportRelevance.powerlifting;
    if (pl === "high") score += 2;
    else if (pl === "moderate") score += 1;
    else if (pl === "low" || pl === "none") score -= 1;
  }
  if (goal === "strength" || goal === "chest_strength") {
    if (candidate.category === "compound") score += 1;
  }

  // Equipment preference: prefer full match of available tools
  const eqHits = candidate.equipment.filter((e) => equipment.includes(e)).length;
  if (equipment.length > 0 && eqHits === candidate.equipment.length) {
    score += 2;
    reasons.push("Fits available equipment cleanly");
  } else if (equipment.includes("dumbbell") && candidate.equipment.includes("dumbbell")) {
    score += 2;
    reasons.push("Uses dumbbells you have available");
  }

  const fatigue = expectedFatigueFor(candidate);
  const skill = skillDemandFor(candidate);
  const unavailableFatigue = expectedFatigueFor(unavailable);
  const unavailableSkill = skillDemandFor(unavailable);

  // Fatigue context
  if (context.fatiguePressure === "high" || context.fatiguePressure === "elevated") {
    if (fatigue === "low") {
      score += 3;
      reasons.push("Lower fatigue demand — better when training stress is elevated");
    } else if (fatigue === "high") {
      score -= 3;
      reasons.push("High fatigue demand — less ideal while stress is elevated");
    } else if (unavailableFatigue === "high" && fatigue === "moderate") {
      score += 1;
    }
  }

  // Skill context
  if (
    context.skillContext === "beginner" ||
    context.painSafeActive ||
    context.injuryModificationActive ||
    context.fatiguePressure !== "normal"
  ) {
    if (skill === "low") {
      score += 2;
      reasons.push(
        context.injuryModificationActive && !context.painSafeActive
          ? "Lower skill demand — better fit while a declared limitation is active"
          : "Lower skill demand",
      );
    } else if (skill === "high") {
      score -= 2;
    }
  }
  if (unavailableSkill === "high" && skill !== "high") {
    score += 1;
  }

  if (context.injuryModificationActive && !context.painSafeActive) {
    if (unavailable.relatedSlugs.includes(candidate.slug)) {
      score += 2;
      reasons.push(
        "Known regression/variation — preferred while a declared limitation is active",
      );
    }
    if (fatigue === "low" || fatigue === "moderate") {
      score += 1;
    }
  }

  // Prefer not inventing harder progressions when substituting for unavailability
  if (candidate.difficulty === "advanced" && unavailable.difficulty !== "advanced") {
    score -= 1;
  }

  return { score, reasons };
}
