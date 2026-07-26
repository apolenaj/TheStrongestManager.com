import {
  EXERCISE_COMPARISON_DIMENSIONS,
  EXERCISE_COMPARISON_ENGINE_VERSION,
  EXERCISE_COMPARISON_HONESTY,
} from "@/domain/exercise-comparison/constants";
import { EXERCISE_COMPARISON_PROFILES } from "@/domain/exercise-comparison/profiles";
import { EXERCISE_COMPARISON_SEO_PAIRS } from "@/domain/exercise-comparison/seo-pairs";

export type ExerciseComparisonSnapshot = {
  engineVersion: typeof EXERCISE_COMPARISON_ENGINE_VERSION;
  honesty: typeof EXERCISE_COMPARISON_HONESTY;
  dimensions: typeof EXERCISE_COMPARISON_DIMENSIONS;
  profiledExercises: number;
  seoPairs: typeof EXERCISE_COMPARISON_SEO_PAIRS;
  profiles: typeof EXERCISE_COMPARISON_PROFILES;
  generatedAt: string;
};

export function buildExerciseComparisonSnapshot(
  generatedAt: string = new Date().toISOString(),
): ExerciseComparisonSnapshot {
  return {
    engineVersion: EXERCISE_COMPARISON_ENGINE_VERSION,
    honesty: EXERCISE_COMPARISON_HONESTY,
    dimensions: EXERCISE_COMPARISON_DIMENSIONS,
    profiledExercises: EXERCISE_COMPARISON_PROFILES.length,
    seoPairs: EXERCISE_COMPARISON_SEO_PAIRS,
    profiles: EXERCISE_COMPARISON_PROFILES,
    generatedAt,
  };
}
