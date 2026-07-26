/**
 * Resolve travel equipment overlays and adaptation messaging.
 */

import type { OnboardingEquipmentId } from "@/domain/equipment-profiles";
import { mapOnboardingEquipmentToCatalog } from "@/domain/equipment-profiles";
import type { EquipmentKey } from "@/domain/exercises/types";
import type { FitEquipment } from "@/domain/fit/types";
import {
  TRAVEL_PRESETS,
  type TravelPresetId,
} from "@/domain/travel-training-mode/constants";

export function isTravelPresetId(value: string): value is TravelPresetId {
  return value === "hotel_gym" || value === "no_gym" || value === "limited";
}

/**
 * Onboarding checklist for a travel preset.
 * `limited` may override with a custom checklist.
 */
export function resolveTravelOnboardingIds(input: {
  preset: TravelPresetId;
  limitedEquipment?: readonly string[] | null;
}): OnboardingEquipmentId[] {
  if (input.preset === "limited") {
    const custom = (input.limitedEquipment ?? []).filter(Boolean);
    if (custom.length > 0) {
      return custom as OnboardingEquipmentId[];
    }
  }
  return [...TRAVEL_PRESETS[input.preset].onboardingIds];
}

export function resolveTravelCatalogKeys(input: {
  preset: TravelPresetId;
  limitedEquipment?: readonly string[] | null;
}): EquipmentKey[] {
  const onboarding = resolveTravelOnboardingIds(input);
  const fromChecklist = mapOnboardingEquipmentToCatalog(onboarding);
  if (fromChecklist.length > 0) return fromChecklist;
  return [...TRAVEL_PRESETS[input.preset].catalogKeys];
}

export function resolveTravelFitEquipment(
  preset: TravelPresetId,
): FitEquipment {
  return TRAVEL_PRESETS[preset].fitEquipment;
}

export function travelAdaptationLines(input: {
  preset: TravelPresetId;
  hasProgramCheckpoint: boolean;
  catalogKeys: readonly EquipmentKey[];
}): string[] {
  const preset = TRAVEL_PRESETS[input.preset];
  const lines = [
    preset.adaptationSummary,
    `Effective travel gear: ${
      input.catalogKeys.length > 0
        ? input.catalogKeys.join(", ")
        : "none listed"
    }.`,
  ];
  if (input.hasProgramCheckpoint) {
    lines.push(
      "A pre-travel program checkpoint was saved — ending travel restores that version.",
    );
  } else {
    lines.push(
      "No active athlete program was found to checkpoint; home equipment still restores when travel ends.",
    );
  }
  return lines;
}

export type HomeEquipmentSnapshot = {
  availableEquipment: string[];
  equipmentProfileId: string | null;
};

export function parseHomeEquipmentSnapshot(
  raw: string | null | undefined,
): HomeEquipmentSnapshot | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const obj = parsed as Record<string, unknown>;
    const available = Array.isArray(obj.availableEquipment)
      ? obj.availableEquipment.filter((x): x is string => typeof x === "string")
      : [];
    const profileId =
      typeof obj.equipmentProfileId === "string"
        ? obj.equipmentProfileId
        : null;
    return { availableEquipment: available, equipmentProfileId: profileId };
  } catch {
    return null;
  }
}

export function serializeHomeEquipmentSnapshot(
  snapshot: HomeEquipmentSnapshot,
): string {
  return JSON.stringify(snapshot);
}
