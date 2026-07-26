"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/services/auth/session";
import {
  EQUIPMENT_PROFILE_PRESETS,
  type EquipmentProfileId,
} from "@/domain/equipment-profiles";
import {
  applyEquipmentPreset,
  saveCustomEquipmentChecklist,
} from "@/services/equipment-profiles";
import type { EquipmentId } from "@/services/onboarding/options";
import { EQUIPMENT_OPTIONS } from "@/services/onboarding/options";

export async function applyEquipmentPresetAction(formData: FormData) {
  const session = await requireSession();
  const raw = String(formData.get("profileId") ?? "");
  if (!(raw in EQUIPMENT_PROFILE_PRESETS)) return;
  await applyEquipmentPreset({
    userId: session.user.id,
    profileId: raw as Exclude<EquipmentProfileId, "custom">,
  });
  revalidatePath("/app/equipment-profiles");
  revalidatePath("/app/profile");
  revalidatePath("/app/program-builder");
  revalidatePath("/app/exercise-prescription");
  revalidatePath("/app/exercise-substitutions");
}

export async function saveCustomEquipmentAction(formData: FormData) {
  const session = await requireSession();
  const allowed = new Set(EQUIPMENT_OPTIONS.map((o) => o.id));
  const equipment = formData
    .getAll("equipment")
    .map(String)
    .filter((id): id is EquipmentId => allowed.has(id as EquipmentId));
  await saveCustomEquipmentChecklist({
    userId: session.user.id,
    equipment,
  });
  revalidatePath("/app/equipment-profiles");
  revalidatePath("/app/profile");
  revalidatePath("/app/program-builder");
}
