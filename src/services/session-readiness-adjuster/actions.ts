"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/services/auth/session";
import { saveSessionReadinessCheckIn } from "@/services/session-readiness-adjuster";
import type { SessionReadinessAdjustment } from "@/domain/session-readiness-adjuster";

export type SessionReadinessActionResult =
  | { ok: true; adjustment: SessionReadinessAdjustment }
  | { ok: false; error: string };

function parseOptionalNumber(raw: FormDataEntryValue | null): number | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s || s === "skip") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export async function saveSessionReadinessCheckInAction(
  formData: FormData,
): Promise<SessionReadinessActionResult> {
  const session = await requireSession();
  const result = await saveSessionReadinessCheckIn({
    userId: session.user.id,
    checkIn: {
      sleepHours: parseOptionalNumber(formData.get("sleepHours")),
      fatigue: parseOptionalNumber(formData.get("fatigue")),
      soreness: parseOptionalNumber(formData.get("soreness")),
      motivation: parseOptionalNumber(formData.get("motivation")),
    },
  });
  if (!result.ok) return result;
  revalidatePath("/app/session-readiness");
  revalidatePath("/app/recovery");
  revalidatePath("/app/today");
  revalidatePath("/app/dashboard");
  return result;
}
