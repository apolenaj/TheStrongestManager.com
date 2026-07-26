/**
 * Shared equipment gate for recommendations.
 */

import type { EquipmentKey } from "@/domain/exercises/types";
import {
  alternativeEquipmentNote,
  equipmentFullyAvailable,
  equipmentPartiallyAvailable,
} from "@/domain/equipment-profiles/resolve";

export type EquipmentGateDecision = {
  /** Allowed as a primary recommendation. */
  allowPrimary: boolean;
  /** Allowed only as a clearly labelled alternative. */
  allowAsAlternative: boolean;
  equipmentNote: string | null;
};

/**
 * Primary picks require full equipment availability.
 * Empty available list → no primary (incomplete profile), not “everything allowed”.
 * Alternatives may surface with an explicit missing-equipment note.
 */
export function gateExerciseEquipment(input: {
  required: readonly EquipmentKey[];
  available: readonly EquipmentKey[];
}): EquipmentGateDecision {
  const { required, available } = input;

  if (available.length === 0) {
    return {
      allowPrimary: false,
      allowAsAlternative: false,
      equipmentNote:
        "Set an equipment profile before primary recommendations can respect your gear.",
    };
  }

  if (equipmentFullyAvailable(required, available)) {
    return {
      allowPrimary: true,
      allowAsAlternative: true,
      equipmentNote: null,
    };
  }

  if (equipmentPartiallyAvailable(required, available)) {
    return {
      allowPrimary: false,
      allowAsAlternative: true,
      equipmentNote: alternativeEquipmentNote(required, available),
    };
  }

  return {
    allowPrimary: false,
    allowAsAlternative: true,
    equipmentNote: alternativeEquipmentNote(required, available),
  };
}
