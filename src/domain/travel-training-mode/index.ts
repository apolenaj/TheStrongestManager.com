export {
  TRAVEL_TRAINING_ENGINE_VERSION,
  TRAVEL_TRAINING_HONESTY,
  TRAVEL_PRESET_IDS,
  TRAVEL_PRESETS,
  TRAVEL_PRESET_LABELS,
  TRAVEL_MODE_STATUSES,
  type TravelPresetId,
  type TravelPreset,
  type TravelModeStatus,
} from "@/domain/travel-training-mode/constants";

export {
  isTravelPresetId,
  resolveTravelOnboardingIds,
  resolveTravelCatalogKeys,
  resolveTravelFitEquipment,
  travelAdaptationLines,
  parseHomeEquipmentSnapshot,
  serializeHomeEquipmentSnapshot,
  type HomeEquipmentSnapshot,
} from "@/domain/travel-training-mode/resolve";

export { gateExerciseForTravel } from "@/domain/travel-training-mode/gate";
