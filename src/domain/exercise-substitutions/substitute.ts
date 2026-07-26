/**
 * Smart exercise substitution engine — pure, catalog-backed.
 */

import {
  expectedFatigueFor,
  primaryPurposeFor,
  skillDemandFor,
} from "@/domain/exercise-prescription/meta";
import { equipmentFullyAvailable } from "@/domain/equipment-profiles";
import type { EquipmentKey } from "@/domain/exercises/types";
import {
  EXERCISE_SUBSTITUTION_ENGINE_VERSION,
  EXERCISE_SUBSTITUTION_GOAL_LABELS,
  EXERCISE_SUBSTITUTION_HONESTY,
  EXERCISE_SUBSTITUTION_MAX_RESULTS,
  type ExerciseSubstitutionGoal,
} from "@/domain/exercise-substitutions/constants";
import { scoreSubstitute } from "@/domain/exercise-substitutions/score";
import { buildSubstitutionTradeoffs } from "@/domain/exercise-substitutions/tradeoffs";
import type {
  ExerciseSubstitutionCandidate,
  ExerciseSubstitutionContext,
  ExerciseSubstitutionResult,
} from "@/domain/exercise-substitutions/types";

export function substituteExercises(input: {
  unavailableSlug: string;
  goal: ExerciseSubstitutionGoal;
  equipment: EquipmentKey[];
  catalog: ExerciseSubstitutionCandidate[];
  context?: Partial<ExerciseSubstitutionContext>;
}): ExerciseSubstitutionResult {
  const context: ExerciseSubstitutionContext = {
    fatiguePressure: input.context?.fatiguePressure ?? "normal",
    skillContext: input.context?.skillContext ?? null,
    painSafeActive: input.context?.painSafeActive ?? false,
    injuryModificationActive:
      input.context?.injuryModificationActive ?? false,
  };

  const unavailable = input.catalog.find(
    (c) => c.slug === input.unavailableSlug,
  );
  const missingInformation: string[] = [];

  if (!unavailable) {
    return {
      engineVersion: EXERCISE_SUBSTITUTION_ENGINE_VERSION,
      unavailable: {
        slug: input.unavailableSlug,
        name: input.unavailableSlug,
        movementPattern: "unknown",
        primaryMuscles: [],
      },
      goal: input.goal,
      goalLabel: EXERCISE_SUBSTITUTION_GOAL_LABELS[input.goal],
      equipment: input.equipment,
      recommendations: [],
      missingInformation: [
        "Unavailable exercise is not in the published catalog.",
      ],
      emptyReason:
        "No published exercise matches that slug — substitutions are never invented.",
      honesty: EXERCISE_SUBSTITUTION_HONESTY,
    };
  }

  if (input.equipment.length === 0) {
    missingInformation.push(
      "No equipment profile — substitutions stay empty until gear is set.",
    );
  }

  const scored = input.catalog
    .filter((c) => c.slug !== unavailable.slug)
    .filter(
      (c) =>
        input.equipment.length > 0 &&
        equipmentFullyAvailable(c.equipment, input.equipment),
    )
    .map((candidate) => {
      const { score, reasons } = scoreSubstitute({
        unavailable,
        candidate,
        goal: input.goal,
        equipment: input.equipment,
        context,
      });
      return { candidate, score, reasons };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.candidate.name.localeCompare(b.candidate.name))
    .slice(0, EXERCISE_SUBSTITUTION_MAX_RESULTS);

  const recommendations = scored.map((row, index) => {
    const tradeoffs = buildSubstitutionTradeoffs({
      unavailable,
      candidate: row.candidate,
      goal: input.goal,
    });
    return {
      slug: row.candidate.slug,
      name: row.candidate.name,
      rank: index + 1,
      score: row.score,
      reason: row.reasons.slice(0, 3).join(". ") + (row.reasons.length ? "." : ""),
      primaryPurpose: primaryPurposeFor(row.candidate, "none"),
      expectedFatigue: expectedFatigueFor(row.candidate),
      skillDemand: skillDemandFor(row.candidate),
      tradeoffs,
      href: `/exercises/${row.candidate.slug}`,
    };
  });

  return {
    engineVersion: EXERCISE_SUBSTITUTION_ENGINE_VERSION,
    unavailable: {
      slug: unavailable.slug,
      name: unavailable.name,
      movementPattern: unavailable.movementPattern,
      primaryMuscles: unavailable.primaryMuscles,
    },
    goal: input.goal,
    goalLabel: EXERCISE_SUBSTITUTION_GOAL_LABELS[input.goal],
    equipment: input.equipment,
    recommendations,
    missingInformation,
    emptyReason:
      recommendations.length === 0
        ? "No published substitutes fit this goal and equipment combination."
        : null,
    honesty: EXERCISE_SUBSTITUTION_HONESTY,
  };
}
