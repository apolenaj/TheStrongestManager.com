"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/services/auth/session";
import {
  applyToCreatorProgram,
  reviewCreatorPartnership,
} from "@/services/creator-program/creator-program-service";
import { CREATOR_CAPABILITIES, isCreatorCapability } from "@/domain/creator-program";

export type CreatorActionState = {
  ok: boolean;
  error?: string;
  message?: string;
};

export async function applyCreatorProgramAction(
  _prev: CreatorActionState,
  formData: FormData,
): Promise<CreatorActionState> {
  const session = await requireSession();
  const displayName = String(formData.get("displayName") ?? "");
  const handle = String(formData.get("handle") ?? "");
  const notes = String(formData.get("notes") ?? "");

  const requested: string[] = [];
  for (const cap of CREATOR_CAPABILITIES) {
    const val = formData.get(`cap_${cap}`);
    if (val === "on" || val === "true") requested.push(cap);
  }

  const result = await applyToCreatorProgram({
    userId: session.user.id,
    displayName,
    handle: handle || null,
    notes: notes || null,
    requestedCapabilities:
      requested.length > 0 ? requested.filter(isCreatorCapability) : undefined,
  });

  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/app/creator");
  return { ok: true, message: result.message };
}

export async function reviewCreatorPartnershipAction(
  formData: FormData,
): Promise<void> {
  const session = await requireSession();
  const partnershipId = String(formData.get("partnershipId") ?? "");
  const toStatus = String(formData.get("toStatus") ?? "");
  if (
    toStatus !== "approved" &&
    toStatus !== "rejected" &&
    toStatus !== "suspended"
  ) {
    return;
  }
  await reviewCreatorPartnership({
    partnershipId,
    actorUserId: session.user.id,
    toStatus,
  });
  revalidatePath("/app/creator/review");
  revalidatePath("/app/creator");
}
