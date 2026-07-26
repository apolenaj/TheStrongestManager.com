import {
  PERFORMANCE_STORY_CAUSALITY_CAVEAT,
  PERFORMANCE_STORY_ENGINE_VERSION,
  PERFORMANCE_STORY_HONESTY,
} from "@/domain/performance-story/constants";
import type { PerformanceStorySnapshot } from "@/domain/performance-story/types";

export function buildPerformanceStorySnapshot(
  generatedAt: string = new Date().toISOString(),
): PerformanceStorySnapshot {
  return {
    engineVersion: PERFORMANCE_STORY_ENGINE_VERSION,
    honesty: PERFORMANCE_STORY_HONESTY,
    causalityCaveat: PERFORMANCE_STORY_CAUSALITY_CAVEAT,
    exampleChapterShape: [
      "January: Deadlift 280 kg.",
      "April: Deadlift 300 kg.",
      "July: Technique improved +12.",
      "July: Bodyweight −5 kg.",
    ],
    docPath: "docs/PERFORMANCE_STORY.md",
    generatedAt,
  };
}
