/**
 * Map onboarding IDs ↔ catalog keys; resolve active equipment profile.
 */

import type { EquipmentKey } from "@/domain/exercises/types";
import type { FitEquipment } from "@/domain/fit/types";
import {
  EQUIPMENT_PROFILE_PRESETS,
  type EquipmentProfileId,
  type OnboardingEquipmentId,
} from "@/domain/equipment-profiles/constants";

const ONBOARDING_TO_CATALOG: Record<string, EquipmentKey[]> = {
  barbell: ["barbell"],
  dumbbells: ["dumbbell"],
  dumbbell: ["dumbbell"],
  kettlebells: ["kettlebell"],
  kettlebell: ["kettlebell"],
  machines: ["machine"],
  machine: ["machine"],
  cables: ["cable"],
  cable: ["cable"],
  rack: ["rack"],
  bench: ["bench"],
  bodyweight: ["bodyweight"],
  body_weight: ["bodyweight"],
  specialty: ["other"],
  bands: ["bands"],
  band: ["bands"],
  plates: ["plates"],
  plates_bumper: ["plates"],
};

/**
 * Map onboarding / free-form equipment IDs → catalog EquipmentKey[].
 */
export function mapOnboardingEquipmentToCatalog(
  raw: string[] | null | undefined,
): EquipmentKey[] {
  if (!raw?.length) return [];
  const out = new Set<EquipmentKey>();
  for (const item of raw) {
    const keys = ONBOARDING_TO_CATALOG[item.toLowerCase()];
    if (keys) {
      for (const k of keys) out.add(k);
    }
  }
  return [...out];
}

/**
 * Hard availability: every required catalog key is present.
 * `plates` are implied when `barbell` is available.
 */
export function equipmentFullyAvailable(
  required: readonly EquipmentKey[],
  available: readonly EquipmentKey[],
): boolean {
  if (required.length === 0) return true;
  if (available.length === 0) return false;
  const set = new Set(available);
  if (set.has("barbell")) set.add("plates");
  return required.every((eq) => set.has(eq));
}

/**
 * Soft overlap — used only to detect “needs other gear” for alternative labels.
 */
export function equipmentPartiallyAvailable(
  required: readonly EquipmentKey[],
  available: readonly EquipmentKey[],
): boolean {
  if (required.length === 0) return true;
  if (available.length === 0) return false;
  return required.some((eq) => available.includes(eq));
}

export function missingEquipmentKeys(
  required: readonly EquipmentKey[],
  available: readonly EquipmentKey[],
): EquipmentKey[] {
  if (available.length === 0) return [...required];
  const set = new Set(available);
  if (set.has("barbell")) set.add("plates");
  return required.filter((eq) => !set.has(eq));
}

export function alternativeEquipmentNote(
  required: readonly EquipmentKey[],
  available: readonly EquipmentKey[],
): string | null {
  const missing = missingEquipmentKeys(required, available);
  if (missing.length === 0) return null;
  return `Alternative — needs ${missing.join(", ")} (not in your profile).`;
}

/**
 * Infer preset from checklist when no explicit profile id is stored.
 */
export function inferEquipmentProfileId(
  onboardingIds: readonly string[],
): EquipmentProfileId {
  const set = new Set(onboardingIds.map((id) => id.toLowerCase()));
  if (set.size === 0) return "custom";

  const matchesPreset = (
    ids: readonly OnboardingEquipmentId[],
  ): boolean => {
    const preset = new Set(ids);
    if (preset.size !== set.size) return false;
    for (const id of set) {
      if (!preset.has(id as OnboardingEquipmentId)) return false;
    }
    return true;
  };

  for (const preset of Object.values(EQUIPMENT_PROFILE_PRESETS)) {
    if (matchesPreset(preset.onboardingIds)) return preset.id;
  }

  // Fuzzy: commercial-like if machines + cables + barbell
  if (
    set.has("barbell") &&
    set.has("machines") &&
    (set.has("cables") || set.has("dumbbells"))
  ) {
    return "commercial_gym";
  }
  if (
    set.has("barbell") &&
    set.has("rack") &&
    set.has("bench") &&
    !set.has("machines")
  ) {
    return set.has("dumbbells") || set.has("bands")
      ? "home_gym"
      : "powerlifting_gym";
  }
  if (!set.has("barbell") && (set.has("dumbbells") || set.has("bodyweight"))) {
    return "minimal";
  }
  return "custom";
}

export function fitEquipmentForProfile(
  profileId: EquipmentProfileId,
): FitEquipment {
  if (profileId === "custom") return "full_gym";
  return EQUIPMENT_PROFILE_PRESETS[profileId].fitEquipment;
}

export function resolveCatalogKeys(input: {
  profileId: EquipmentProfileId | null;
  onboardingIds: readonly string[];
}): EquipmentKey[] {
  const fromChecklist = mapOnboardingEquipmentToCatalog([...input.onboardingIds]);
  if (fromChecklist.length > 0) return fromChecklist;
  if (input.profileId && input.profileId !== "custom") {
    return [...EQUIPMENT_PROFILE_PRESETS[input.profileId].catalogKeys];
  }
  return [];
}
