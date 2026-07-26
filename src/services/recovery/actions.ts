"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/services/auth/session";
import { saveRecoveryCheckIn } from "@/services/recovery/recovery-service";

export type RecoveryActionResult =
  | { ok: true; readiness: number | null }
  | { ok: false; error: string };

function parseOptionalNumber(raw: FormDataEntryValue | null): number | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s || s === "skip") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export async function saveRecoveryCheckInAction(
  formData: FormData,
): Promise<RecoveryActionResult> {
  const session = await requireSession();
  const result = await saveRecoveryCheckIn({
    userId: session.user.id,
    sleepHours: parseOptionalNumber(formData.get("sleepHours")),
    sleepQuality: parseOptionalNumber(formData.get("sleepQuality")),
    stress: parseOptionalNumber(formData.get("stress")),
    soreness: parseOptionalNumber(formData.get("soreness")),
    motivation: parseOptionalNumber(formData.get("motivation")),
    fatigue: parseOptionalNumber(formData.get("fatigue")),
    notes: String(formData.get("notes") ?? "").trim() || null,
  });
  if (!result.ok) return result;
  revalidatePath("/app/recovery");
  revalidatePath("/app/progress");
  revalidatePath("/app/dashboard");
  revalidatePath("/app/today");
  return { ok: true, readiness: result.readiness };
}
