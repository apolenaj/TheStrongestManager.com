"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/services/auth/session";
import {
  isInjuryDeclarationKind,
  type InjuryDeclarationKind,
} from "@/domain/injury-modification";
import {
  clearInjuryModification,
  createInjuryModification,
} from "@/services/injury-modification";

function revalidateInjurySurfaces() {
  revalidatePath("/app/injury-modification");
  revalidatePath("/app/exercise-substitutions");
  revalidatePath("/app/exercise-prescription");
  revalidatePath("/app/adaptations");
  revalidatePath("/app/pain-safe-response");
  revalidatePath("/app/today");
}

export async function createInjuryModificationAction(formData: FormData) {
  const session = await requireSession();
  const raw = String(formData.get("declarationKind") ?? "");
  if (!isInjuryDeclarationKind(raw)) return;

  const notes = String(formData.get("notes") ?? "").trim() || null;
  const affectedArea =
    String(formData.get("affectedArea") ?? "").trim() || null;
  const instructionSource =
    String(formData.get("instructionSource") ?? "").trim() || null;

  await createInjuryModification({
    userId: session.user.id,
    declarationKind: raw as InjuryDeclarationKind,
    notes,
    affectedArea,
    instructionSource,
  });
  revalidateInjurySurfaces();
}

export async function clearInjuryModificationAction(formData: FormData) {
  const session = await requireSession();
  const modificationId = String(formData.get("modificationId") ?? "");
  if (!modificationId) return;
  await clearInjuryModification({
    userId: session.user.id,
    modificationId,
  });
  revalidateInjurySurfaces();
}
