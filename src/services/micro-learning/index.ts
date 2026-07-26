import { featureFlags } from "@/config/feature-flags";
import {
  buildMicroLearningSnapshot,
  selectMicroLesson,
  emptyMicroLearningHistory,
  type MicroLearningHistory,
  type MicroLesson,
  type MicroLearningSnapshot,
} from "@/domain/micro-learning";

export function getMicroLearningSnapshot(): MicroLearningSnapshot {
  return buildMicroLearningSnapshot();
}

export function isMicroLearningEnabled(): boolean {
  return featureFlags.microLearning;
}

export function pickMicroLessonForAthlete(input: {
  goalCategories: string[];
  primaryDiscipline: string | null;
  preferredSports?: string[];
  history?: MicroLearningHistory;
  now?: Date;
}): MicroLesson | null {
  if (!featureFlags.microLearning) return null;
  return selectMicroLesson({
    goalCategories: input.goalCategories,
    primaryDiscipline: input.primaryDiscipline,
    preferredSports: input.preferredSports,
    history: input.history ?? emptyMicroLearningHistory(),
    now: input.now ?? new Date(),
  });
}
