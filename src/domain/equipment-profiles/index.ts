export {
  EQUIPMENT_AWARE_ENGINE_VERSION,
  EQUIPMENT_AWARE_HONESTY,
  EQUIPMENT_PROFILE_IDS,
  EQUIPMENT_PROFILE_PRESETS,
  EQUIPMENT_PROFILE_LABELS,
  type EquipmentProfileId,
  type OnboardingEquipmentId,
  type EquipmentProfilePreset,
} from "@/domain/equipment-profiles/constants";

export {
  mapOnboardingEquipmentToCatalog,
  equipmentFullyAvailable,
  equipmentPartiallyAvailable,
  missingEquipmentKeys,
  alternativeEquipmentNote,
  inferEquipmentProfileId,
  fitEquipmentForProfile,
  resolveCatalogKeys,
} from "@/domain/equipment-profiles/resolve";

export {
  gateExerciseEquipment,
  type EquipmentGateDecision,
} from "@/domain/equipment-profiles/gate";
