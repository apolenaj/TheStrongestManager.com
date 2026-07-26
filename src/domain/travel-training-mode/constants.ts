/**
 * Travel Training Mode (Prompt 129).
 * Temporary equipment overlay — original program preserved via checkpoint.
 */

import type { EquipmentKey } from "@/domain/exercises/types";
import type { FitEquipment } from "@/domain/fit/types";
import type { OnboardingEquipmentId } from "@/domain/equipment-profiles/constants";

export const TRAVEL_TRAINING_ENGINE_VERSION =
  "travel_training_mode.v1" as const;

export const TRAVEL_TRAINING_HONESTY = [
  "Travel Mode temporarily adapts training to the gear you have on the road.",
  "Your original program is preserved — ending travel returns you to the pre-travel program and home equipment.",
  "Suggestions while traveling never treat hotel or limited gear as your permanent gym profile.",
  "Travel Mode is temporary by design; it is not a permanent equipment profile change.",
] as const;

export const TRAVEL_PRESET_IDS = [
  "hotel_gym",
  "no_gym",
  "limited",
] as const;

export type TravelPresetId = (typeof TRAVEL_PRESET_IDS)[number];

export const TRAVEL_MODE_STATUSES = ["active", "ended"] as const;
export type TravelModeStatus = (typeof TRAVEL_MODE_STATUSES)[number];

export type TravelPreset = {
  id: TravelPresetId;
  label: string;
  description: string;
  fitEquipment: FitEquipment;
  catalogKeys: readonly EquipmentKey[];
  onboardingIds: readonly OnboardingEquipmentId[];
  /** How the temporary program adaptation is framed. */
  adaptationSummary: string;
};

export const TRAVEL_PRESETS: Record<TravelPresetId, TravelPreset> = {
  hotel_gym: {
    id: "hotel_gym",
    label: "Hotel gym",
    description:
      "Typical hotel floor — dumbbells, maybe a cable or machine, bodyweight. No competition barbell assumed.",
    fitEquipment: "minimal",
    catalogKeys: [
      "dumbbell",
      "machine",
      "cable",
      "bands",
      "bodyweight",
      "other",
    ],
    onboardingIds: ["dumbbells", "machines", "cables", "bodyweight"],
    adaptationSummary:
      "Priority work shifts toward dumbbell, machine, cable, and bodyweight options available in a hotel gym.",
  },
  no_gym: {
    id: "no_gym",
    label: "No gym",
    description:
      "Bodyweight and bands only — room, park, or hallway training.",
    fitEquipment: "minimal",
    catalogKeys: ["bodyweight", "bands", "other"],
    onboardingIds: ["bodyweight"],
    adaptationSummary:
      "Sessions lean on bodyweight patterns; barbell and machine prescriptions are not primary while traveling.",
  },
  limited: {
    id: "limited",
    label: "Limited equipment",
    description:
      "You choose a short checklist of what you can access on this trip.",
    fitEquipment: "minimal",
    catalogKeys: ["dumbbell", "bands", "bodyweight", "other"],
    onboardingIds: ["dumbbells", "bodyweight"],
    adaptationSummary:
      "Programming respects only the limited gear you list for this trip.",
  },
};

export const TRAVEL_PRESET_LABELS: Record<TravelPresetId, string> = {
  hotel_gym: TRAVEL_PRESETS.hotel_gym.label,
  no_gym: TRAVEL_PRESETS.no_gym.label,
  limited: TRAVEL_PRESETS.limited.label,
};
