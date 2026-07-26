/**
 * Equipment profiles service (Prompt 128).
 */

import { prisma } from "@/lib/db";
import { featureFlags } from "@/config/feature-flags";
import {
  EQUIPMENT_AWARE_HONESTY,
  EQUIPMENT_PROFILE_PRESETS,
  fitEquipmentForProfile,
  inferEquipmentProfileId,
  mapOnboardingEquipmentToCatalog,
  resolveCatalogKeys,
  type EquipmentProfileId,
} from "@/domain/equipment-profiles";
import type { FitEquipment } from "@/domain/fit/types";
import type { EquipmentKey } from "@/domain/exercises/types";
import type { EquipmentId } from "@/services/onboarding/options";

export type AthleteEquipmentProfileView = {
  profileId: EquipmentProfileId;
  label: string;
  description: string | null;
  onboardingIds: string[];
  catalogKeys: EquipmentKey[];
  fitEquipment: FitEquipment;
  honesty: readonly string[];
  presets: Array<{
    id: Exclude<EquipmentProfileId, "custom">;
    label: string;
    description: string;
    onboardingIds: readonly string[];
  }>;
};

function parseJsonArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

export async function getAthleteEquipmentProfile(input: {
  userId: string;
}): Promise<
  | { ok: true; view: AthleteEquipmentProfileView }
  | { ok: false; error: string }
> {
  if (!featureFlags.equipmentAwareProgramming) {
    return {
      ok: false,
      error: "Equipment-Aware Programming is not enabled.",
    };
  }

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    include: { trainingExperience: true },
  });
  if (!profile) {
    return { ok: false, error: "No athlete profile." };
  }

  const onboardingIds = parseJsonArray(
    profile.trainingExperience?.availableEquipment,
  );
  const storedId = profile.trainingExperience?.equipmentProfileId;
  const profileId: EquipmentProfileId =
    storedId === "commercial_gym" ||
    storedId === "home_gym" ||
    storedId === "powerlifting_gym" ||
    storedId === "minimal" ||
    storedId === "custom"
      ? storedId
      : inferEquipmentProfileId(onboardingIds);

  const preset =
    profileId !== "custom" ? EQUIPMENT_PROFILE_PRESETS[profileId] : null;

  return {
    ok: true,
    view: {
      profileId,
      label: preset?.label ?? "Custom",
      description: preset?.description ?? "Custom checklist of available gear.",
      onboardingIds,
      catalogKeys: resolveCatalogKeys({ profileId, onboardingIds }),
      fitEquipment: fitEquipmentForProfile(profileId),
      honesty: EQUIPMENT_AWARE_HONESTY,
      presets: Object.values(EQUIPMENT_PROFILE_PRESETS).map((p) => ({
        id: p.id,
        label: p.label,
        description: p.description,
        onboardingIds: p.onboardingIds,
      })),
    },
  };
}

export async function applyEquipmentPreset(input: {
  userId: string;
  profileId: Exclude<EquipmentProfileId, "custom">;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!featureFlags.equipmentAwareProgramming) {
    return { ok: false, error: "Feature off." };
  }
  if (featureFlags.travelTrainingMode) {
    const { isTravelModeActiveForUser } = await import(
      "@/services/travel-training-mode"
    );
    if (await isTravelModeActiveForUser(input.userId)) {
      return {
        ok: false,
        error:
          "Travel Mode is active — end travel before changing your home equipment profile.",
      };
    }
  }
  const preset = EQUIPMENT_PROFILE_PRESETS[input.profileId];
  const athlete = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: { id: true },
  });
  if (!athlete) return { ok: false, error: "No athlete profile." };

  await prisma.trainingExperience.upsert({
    where: { athleteProfileId: athlete.id },
    create: {
      athleteProfileId: athlete.id,
      availableEquipment: JSON.stringify(preset.onboardingIds),
      equipmentProfileId: preset.id,
    },
    update: {
      availableEquipment: JSON.stringify(preset.onboardingIds),
      equipmentProfileId: preset.id,
    },
  });
  return { ok: true };
}

export async function saveCustomEquipmentChecklist(input: {
  userId: string;
  equipment: EquipmentId[];
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!featureFlags.equipmentAwareProgramming) {
    return { ok: false, error: "Feature off." };
  }
  if (featureFlags.travelTrainingMode) {
    const { isTravelModeActiveForUser } = await import(
      "@/services/travel-training-mode"
    );
    if (await isTravelModeActiveForUser(input.userId)) {
      return {
        ok: false,
        error:
          "Travel Mode is active — end travel before changing your home equipment profile.",
      };
    }
  }
  const athlete = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: { id: true },
  });
  if (!athlete) return { ok: false, error: "No athlete profile." };

  const profileId = inferEquipmentProfileId(input.equipment);
  await prisma.trainingExperience.upsert({
    where: { athleteProfileId: athlete.id },
    create: {
      athleteProfileId: athlete.id,
      availableEquipment: JSON.stringify(input.equipment),
      equipmentProfileId: profileId,
    },
    update: {
      availableEquipment: JSON.stringify(input.equipment),
      equipmentProfileId: profileId,
    },
  });
  return { ok: true };
}

/** Catalog keys for other services (prescription, substitutions, builder). */
export async function getResolvedCatalogEquipment(
  userId: string,
): Promise<EquipmentKey[]> {
  const result = await getAthleteEquipmentProfile({ userId });
  if (!result.ok) return [];
  return result.view.catalogKeys;
}

export { mapOnboardingEquipmentToCatalog };
