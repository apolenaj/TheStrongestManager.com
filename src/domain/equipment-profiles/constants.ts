/**
 * Equipment-Aware Programming (Prompt 128).
 * User equipment profiles — program generation and suggestions must respect gear.
 */

import type { EquipmentKey } from "@/domain/exercises/types";
import type { FitEquipment } from "@/domain/fit/types";

export const EQUIPMENT_AWARE_ENGINE_VERSION =
  "equipment_aware_programming.v1" as const;

export const EQUIPMENT_AWARE_HONESTY = [
  "Program generation and exercise suggestions respect your equipment profile.",
  "Unavailable equipment is never recommended as a primary pick — only as a clearly labelled alternative.",
  "Presets are starting points; you can refine the checklist to match what you actually have.",
  "Empty equipment lists are treated as incomplete — not as permission to recommend everything.",
] as const;

export const EQUIPMENT_PROFILE_IDS = [
  "commercial_gym",
  "home_gym",
  "powerlifting_gym",
  "minimal",
  "custom",
] as const;

export type EquipmentProfileId = (typeof EQUIPMENT_PROFILE_IDS)[number];

/** Onboarding checklist IDs (from EQUIPMENT_OPTIONS). */
export type OnboardingEquipmentId =
  | "barbell"
  | "dumbbells"
  | "rack"
  | "bench"
  | "machines"
  | "cables"
  | "kettlebells"
  | "bodyweight"
  | "specialty";

export type EquipmentProfilePreset = {
  id: Exclude<EquipmentProfileId, "custom">;
  label: string;
  description: string;
  /** Coarse Fit / Program Builder equipment. */
  fitEquipment: FitEquipment;
  /** Catalog EquipmentKey[] for hard gates. */
  catalogKeys: readonly EquipmentKey[];
  /** Onboarding checklist IDs to persist. */
  onboardingIds: readonly OnboardingEquipmentId[];
};

export const EQUIPMENT_PROFILE_PRESETS: Record<
  Exclude<EquipmentProfileId, "custom">,
  EquipmentProfilePreset
> = {
  commercial_gym: {
    id: "commercial_gym",
    label: "Commercial gym",
    description:
      "Full commercial floor — barbells, machines, cables, dumbbells, and racks.",
    fitEquipment: "full_gym",
    catalogKeys: [
      "barbell",
      "dumbbell",
      "kettlebell",
      "machine",
      "cable",
      "rack",
      "bench",
      "plates",
      "bands",
      "bodyweight",
    ],
    onboardingIds: [
      "barbell",
      "dumbbells",
      "rack",
      "bench",
      "machines",
      "cables",
      "kettlebells",
      "bodyweight",
    ],
  },
  home_gym: {
    id: "home_gym",
    label: "Home gym",
    description:
      "Typical home setup — barbell, rack, bench, plates, and often dumbbells or bands.",
    fitEquipment: "home_barbell",
    catalogKeys: [
      "barbell",
      "rack",
      "bench",
      "plates",
      "dumbbell",
      "bands",
      "bodyweight",
    ],
    onboardingIds: ["barbell", "rack", "bench", "dumbbells", "bodyweight"],
  },
  powerlifting_gym: {
    id: "powerlifting_gym",
    label: "Powerlifting gym",
    description:
      "Strength-focused gym — competition barbells, racks, benches, and plates; limited machines.",
    fitEquipment: "full_gym",
    catalogKeys: [
      "barbell",
      "rack",
      "bench",
      "plates",
      "bands",
      "bodyweight",
      "dumbbell",
    ],
    onboardingIds: ["barbell", "rack", "bench", "bodyweight", "dumbbells"],
  },
  minimal: {
    id: "minimal",
    label: "Minimal equipment",
    description:
      "Bodyweight, dumbbells, and bands — no barbell competition setup assumed.",
    fitEquipment: "minimal",
    catalogKeys: ["dumbbell", "bands", "bodyweight", "other"],
    onboardingIds: ["dumbbells", "bodyweight"],
  },
};

export const EQUIPMENT_PROFILE_LABELS: Record<EquipmentProfileId, string> = {
  commercial_gym: EQUIPMENT_PROFILE_PRESETS.commercial_gym.label,
  home_gym: EQUIPMENT_PROFILE_PRESETS.home_gym.label,
  powerlifting_gym: EQUIPMENT_PROFILE_PRESETS.powerlifting_gym.label,
  minimal: EQUIPMENT_PROFILE_PRESETS.minimal.label,
  custom: "Custom",
};
