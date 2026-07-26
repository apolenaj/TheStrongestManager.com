export {
  EXERCISE_PRESCRIPTION_ENGINE_VERSION,
  EXERCISE_PRESCRIPTION_MIN_RULE_HITS,
  EXERCISE_PRESCRIPTION_MAX_RESULTS,
  EXERCISE_PRESCRIPTION_HONESTY,
  WEAK_POINTS,
  WEAK_POINT_LABELS,
  FATIGUE_LEVELS,
  SKILL_DEMAND_LEVELS,
} from "@/domain/exercise-prescription/constants";
export type {
  WeakPointId,
  FatigueLevel,
  SkillDemandLevel,
} from "@/domain/exercise-prescription/constants";
export type {
  ExercisePrescriptionGoal,
  ExercisePrescriptionExperience,
  ExercisePrescriptionCandidate,
  ExercisePrescriptionInputs,
  ExercisePrescriptionAlternative,
  ExercisePrescriptionRecommendation,
  ExercisePrescriptionMatchedRule,
  ExercisePrescriptionResult,
} from "@/domain/exercise-prescription/types";
export { PRESCRIPTION_RULES, candidateMatchesEquipment } from "@/domain/exercise-prescription/rules";
export { recommendExercises } from "@/domain/exercise-prescription/recommend";
