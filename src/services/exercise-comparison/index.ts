/**
 * Exercise Comparison service (Prompt 166).
 */

import {
  buildExerciseComparisonSnapshot,
  type ExerciseComparisonSnapshot,
} from "@/domain/exercise-comparison";

export function getExerciseComparisonSnapshot(): ExerciseComparisonSnapshot {
  return buildExerciseComparisonSnapshot();
}
