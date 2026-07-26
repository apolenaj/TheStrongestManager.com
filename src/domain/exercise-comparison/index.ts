export {
  EXERCISE_COMPARISON_ENGINE_VERSION,
  EXERCISE_COMPARISON_HONESTY,
  EXERCISE_COMPARE_MIN,
  EXERCISE_COMPARE_MAX,
  EXERCISE_COMPARISON_DIMENSIONS,
  EXERCISE_FATIGUE_BANDS,
  EXERCISE_FATIGUE_BAND_LABELS,
} from "@/domain/exercise-comparison/constants";
export type {
  ExerciseComparisonDimensionId,
  ExerciseFatigueBand,
} from "@/domain/exercise-comparison/constants";

export {
  EXERCISE_COMPARISON_PROFILES,
  getExerciseComparisonProfile,
} from "@/domain/exercise-comparison/profiles";
export type { ExerciseComparisonProfile } from "@/domain/exercise-comparison/profiles";

export {
  EXERCISE_COMPARISON_SEO_PAIRS,
  getExerciseComparisonSeoPair,
  allExerciseComparisonSeoSlugs,
  findSeoPairForExercises,
} from "@/domain/exercise-comparison/seo-pairs";
export type { ExerciseComparisonSeoPair } from "@/domain/exercise-comparison/seo-pairs";

export {
  listComparableExercises,
  parseExerciseCompareParams,
  buildExerciseSharePath,
  buildExerciseComparison,
} from "@/domain/exercise-comparison/compare";
export type {
  ComparedExercise,
  ExerciseComparisonCell,
  ExerciseComparisonRow,
  ExerciseComparisonView,
} from "@/domain/exercise-comparison/compare";

export {
  buildExerciseComparisonSnapshot,
  type ExerciseComparisonSnapshot,
} from "@/domain/exercise-comparison/snapshot";
