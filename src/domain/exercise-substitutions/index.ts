export {
  EXERCISE_SUBSTITUTION_ENGINE_VERSION,
  EXERCISE_SUBSTITUTION_HONESTY,
  EXERCISE_SUBSTITUTION_MAX_RESULTS,
  EXERCISE_SUBSTITUTION_GOALS,
  EXERCISE_SUBSTITUTION_GOAL_LABELS,
  type ExerciseSubstitutionGoal,
} from "@/domain/exercise-substitutions/constants";

export type {
  ExerciseSubstitutionCandidate,
  ExerciseSubstitutionContext,
  SubstitutionTradeoff,
  ExerciseSubstitutionRecommendation,
  ExerciseSubstitutionResult,
} from "@/domain/exercise-substitutions/types";

export { scoreSubstitute } from "@/domain/exercise-substitutions/score";
export { buildSubstitutionTradeoffs } from "@/domain/exercise-substitutions/tradeoffs";
export { substituteExercises } from "@/domain/exercise-substitutions/substitute";
