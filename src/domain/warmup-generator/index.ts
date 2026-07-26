export {
  WARMUP_ENGINE_VERSION,
  WARMUP_HONESTY,
  WARMUP_ROUND_KG,
  WARMUP_BAR_KG,
  WARMUP_MAX_SETS,
  WARMUP_MIN_SETS_WHEN_FATIGUED,
  WARMUP_DEFAULT_LADDER,
  WARMUP_FATIGUE_LADDER,
  WARMUP_TOP_FRACTION_CAP,
  WARMUP_FATIGUE_VOLUME_RATIO,
  WARMUP_HISTORY_LOOKBACK_DAYS,
  WARMUP_KNOWN_EXERCISES,
} from "@/domain/warmup-generator/constants";
export type { WarmupExerciseId } from "@/domain/warmup-generator/constants";
export type {
  WarmupHistorySignal,
  WarmupGeneratorInput,
  WarmupSetPlan,
  WarmupPlan,
  WarmupGeneratorResult,
  WarmupGeneratorSnapshot,
} from "@/domain/warmup-generator/types";
export {
  roundWarmupKg,
  shouldPreferFewerSets,
  generateWarmupPlan,
  applyWarmupSetEdits,
  removeWarmupSet,
  addWarmupSet,
} from "@/domain/warmup-generator/plan";
export { buildWarmupGeneratorSnapshot } from "@/domain/warmup-generator/snapshot";
