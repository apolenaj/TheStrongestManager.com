"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/services/auth/session";
import { summarizeCoachNotes } from "@/services/coaching-notes-intelligence";

export async function summarizeCoachNotesAction(formData: FormData): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const session = await requireSession();
  const athleteProfileId = String(formData.get("athleteProfileId") ?? "");
  if (!athleteProfileId) return { ok: false, error: "Missing athlete." };

  const result = await summarizeCoachNotes({
    coachUserId: session.user.id,
    athleteProfileId,
  });

  if (result.ok) {
    revalidatePath(`/app/coach/${athleteProfileId}`);
    revalidatePath("/app/coaching-notes");
  }
  return result.ok ? { ok: true } : result;
}

/** Form-action wrapper (must return void for native form actions). */
export async function summarizeCoachNotesFormAction(formData: FormData) {
  await summarizeCoachNotesAction(formData);
}
