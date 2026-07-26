/**
 * Mobile workout experience — admin snapshot.
 */

import {
  buildMobileWorkoutSnapshot,
  type MobileWorkoutSnapshot,
} from "@/domain/mobile-workout";

export function getMobileWorkoutSnapshot(): MobileWorkoutSnapshot {
  return buildMobileWorkoutSnapshot();
}
