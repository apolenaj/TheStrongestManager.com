"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/services/auth/session";
import {
  isTravelPresetId,
  type TravelPresetId,
} from "@/domain/travel-training-mode";
import {
  endTravelMode,
  startTravelMode,
} from "@/services/travel-training-mode";
import type { EquipmentId } from "@/services/onboarding/options";
import { EQUIPMENT_OPTIONS } from "@/services/onboarding/options";

function revalidateTravelSurfaces() {
  revalidatePath("/app/travel-mode");
  revalidatePath("/app/equipment-profiles");
  revalidatePath("/app/profile");
  revalidatePath("/app/program-builder");
  revalidatePath("/app/exercise-prescription");
  revalidatePath("/app/exercise-substitutions");
  revalidatePath("/app/today");
  revalidatePath("/app");
}

export async function startTravelModeAction(formData: FormData) {
  const session = await requireSession();
  const raw = String(formData.get("preset") ?? "");
  if (!isTravelPresetId(raw)) return;

  const allowed = new Set(EQUIPMENT_OPTIONS.map((o) => o.id));
  const limitedEquipment = formData
    .getAll("equipment")
    .map(String)
    .filter((id): id is EquipmentId => allowed.has(id as EquipmentId));

  const notes = String(formData.get("notes") ?? "").trim() || null;

  await startTravelMode({
    userId: session.user.id,
    preset: raw as TravelPresetId,
    limitedEquipment:
      raw === "limited" ? limitedEquipment : undefined,
    notes,
  });
  revalidateTravelSurfaces();
}

export async function endTravelModeAction() {
  const session = await requireSession();
  await endTravelMode({ userId: session.user.id });
  revalidateTravelSurfaces();
}
