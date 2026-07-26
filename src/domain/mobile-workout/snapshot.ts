import {
  MOBILE_WORKOUT_ENGINE_VERSION,
  MOBILE_WORKOUT_HONESTY,
  MOBILE_WORKOUT_PRINCIPLES,
  MOBILE_WORKOUT_AUTO_SAVE_MS,
  MOBILE_WORKOUT_LOAD_STEP,
  MOBILE_WORKOUT_REST_PRESETS_SEC,
  MOBILE_WORKOUT_MIN_TOUCH_PX,
} from "@/domain/mobile-workout/constants";

export type MobileWorkoutSnapshot = {
  engineVersion: typeof MOBILE_WORKOUT_ENGINE_VERSION;
  honesty: typeof MOBILE_WORKOUT_HONESTY;
  principles: typeof MOBILE_WORKOUT_PRINCIPLES;
  autoSaveMs: typeof MOBILE_WORKOUT_AUTO_SAVE_MS;
  loadStep: typeof MOBILE_WORKOUT_LOAD_STEP;
  restPresetsSec: typeof MOBILE_WORKOUT_REST_PRESETS_SEC;
  minTouchPx: typeof MOBILE_WORKOUT_MIN_TOUCH_PX;
  playerRoute: "/app/training/[sessionId]";
  docPath: "docs/MOBILE_WORKOUT.md";
  generatedAt: string;
};

export function buildMobileWorkoutSnapshot(
  generatedAt: string = new Date().toISOString(),
): MobileWorkoutSnapshot {
  return {
    engineVersion: MOBILE_WORKOUT_ENGINE_VERSION,
    honesty: MOBILE_WORKOUT_HONESTY,
    principles: MOBILE_WORKOUT_PRINCIPLES,
    autoSaveMs: MOBILE_WORKOUT_AUTO_SAVE_MS,
    loadStep: MOBILE_WORKOUT_LOAD_STEP,
    restPresetsSec: MOBILE_WORKOUT_REST_PRESETS_SEC,
    minTouchPx: MOBILE_WORKOUT_MIN_TOUCH_PX,
    playerRoute: "/app/training/[sessionId]",
    docPath: "docs/MOBILE_WORKOUT.md",
    generatedAt,
  };
}
