import {
  WARMUP_DEFAULT_LADDER,
  WARMUP_ENGINE_VERSION,
  WARMUP_FATIGUE_LADDER,
  WARMUP_HONESTY,
  WARMUP_KNOWN_EXERCISES,
  WARMUP_MAX_SETS,
  WARMUP_TOP_FRACTION_CAP,
} from "@/domain/warmup-generator/constants";
import type { WarmupGeneratorSnapshot } from "@/domain/warmup-generator/types";

export function buildWarmupGeneratorSnapshot(
  generatedAt: string = new Date().toISOString(),
): WarmupGeneratorSnapshot {
  return {
    engineVersion: WARMUP_ENGINE_VERSION,
    honesty: WARMUP_HONESTY,
    maxSets: WARMUP_MAX_SETS,
    topFractionCap: WARMUP_TOP_FRACTION_CAP,
    defaultLadderSteps: WARMUP_DEFAULT_LADDER.length,
    fatigueLadderSteps: WARMUP_FATIGUE_LADDER.length,
    knownExercises: WARMUP_KNOWN_EXERCISES.map((e) => ({
      id: e.id,
      label: e.label,
    })),
    docPath: "docs/WARMUP_GENERATOR.md",
    generatedAt,
  };
}
