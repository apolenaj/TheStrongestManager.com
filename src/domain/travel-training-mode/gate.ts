/**
 * Travel-mode gates — primary picks must respect travel gear.
 */

import { gateExerciseEquipment } from "@/domain/equipment-profiles";
import type { EquipmentKey } from "@/domain/exercises/types";

/**
 * While travel is active, exercise suggestions use travel equipment only.
 * Unavailable home-gym gear is never a primary pick unless it is in the travel list.
 */
export function gateExerciseForTravel(input: {
  required: readonly EquipmentKey[];
  travelEquipment: readonly EquipmentKey[];
  travelActive: boolean;
}) {
  if (!input.travelActive) {
    return gateExerciseEquipment({
      required: input.required,
      available: input.travelEquipment,
    });
  }
  return gateExerciseEquipment({
    required: input.required,
    available: input.travelEquipment,
  });
}
