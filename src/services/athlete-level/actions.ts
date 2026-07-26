"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/services/auth/session";
import { setAthleteLevelOptIn } from "@/services/athlete-level";

export type AthleteLevelActionState = {
  ok: boolean;
  error?: string;
  message?: string;
};

export async function saveAthleteLevelOptInAction(
  _prev: AthleteLevelActionState,
  formData: FormData,
): Promise<AthleteLevelActionState> {
  const session = await requireSession();
  const result = await setAthleteLevelOptIn(
    session.user.id,
    formData.get("optedIn") === "on",
  );
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/app/athlete-level");
  return { ok: true, message: "Athlete Level preference saved." };
}
