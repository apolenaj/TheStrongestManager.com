export {
  MICRO_LEARNING_ENGINE_VERSION,
  MICRO_LEARNING_HONESTY,
  MICRO_LEARNING_MAX_PER_DAY,
  MICRO_LEARNING_DISMISS_COOLDOWN_HOURS,
  MICRO_LEARNING_COMPLETE_COOLDOWN_HOURS,
  MICRO_LEARNING_LESSON_COOLDOWN_HOURS,
  MICRO_LEARNING_STORAGE_KEY,
} from "@/domain/micro-learning/constants";
export type {
  MicroLesson,
  MicroLessonGoalTag,
  MicroLessonSportTag,
  MicroLearningHistory,
} from "@/domain/micro-learning/constants";

export {
  MICRO_LESSONS,
  getMicroLesson,
  allMicroLessonIds,
} from "@/domain/micro-learning/catalog";

export {
  selectMicroLesson,
  emptyMicroLearningHistory,
  recordMicroLessonShown,
  recordMicroLessonDismissed,
  recordMicroLessonCompleted,
  dayKeyFromDate,
  type MicroLearningSelectInput,
} from "@/domain/micro-learning/select";

export {
  buildMicroLearningSnapshot,
  evaluateMicroLearningQuality,
  type MicroLearningSnapshot,
} from "@/domain/micro-learning/snapshot";
