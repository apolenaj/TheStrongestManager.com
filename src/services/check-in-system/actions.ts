"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/services/auth/session";
import {
  saveCoachCheckInConfig,
  submitWeeklyCheckIn,
  summarizeWeeklyCheckIn,
} from "@/services/check-in-system";
import { CHECK_IN_QUESTION_CATALOG } from "@/domain/check-in-system";

function revalidateCheckIn(athleteProfileId?: string) {
  revalidatePath("/app/check-in");
  if (athleteProfileId) {
    revalidatePath(`/app/coach/${athleteProfileId}`);
    revalidatePath(`/app/check-in/configure?athlete=${athleteProfileId}`);
  }
}

export async function submitWeeklyCheckInAction(formData: FormData): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const session = await requireSession();
  const responses: Record<string, string | number | boolean | null> = {};

  for (const q of CHECK_IN_QUESTION_CATALOG) {
    const raw = formData.get(`q_${q.key}`);
    if (raw === null || raw === undefined || raw === "") continue;
    const value = String(raw);
    if (q.answerType === "boolean") {
      responses[q.key] = value === "true" || value === "on" || value === "yes";
    } else if (q.answerType === "number" || q.answerType === "scale_1_5") {
      const n = Number(value);
      responses[q.key] = Number.isFinite(n) ? n : null;
    } else {
      responses[q.key] = value.slice(0, 500);
    }
  }

  const result = await submitWeeklyCheckIn({
    userId: session.user.id,
    responses,
  });
  if (result.ok) revalidateCheckIn();
  return result.ok ? { ok: true } : result;
}

export async function saveCoachCheckInConfigAction(formData: FormData): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const session = await requireSession();
  const athleteProfileId = String(formData.get("athleteProfileId") ?? "");
  if (!athleteProfileId) return { ok: false, error: "Missing athlete." };

  const enabledKeys = formData
    .getAll("questionKey")
    .map(String)
    .filter(Boolean);
  const applyAsDefault = formData.get("applyAsDefault") === "on";

  const result = await saveCoachCheckInConfig({
    coachUserId: session.user.id,
    athleteProfileId,
    enabledKeys,
    applyAsDefault,
  });
  if (result.ok) revalidateCheckIn(athleteProfileId);
  return result.ok ? { ok: true } : result;
}

export async function summarizeWeeklyCheckInAction(formData: FormData) {
  const session = await requireSession();
  const checkInId = String(formData.get("checkInId") ?? "");
  if (!checkInId) return;
  await summarizeWeeklyCheckIn({
    userId: session.user.id,
    checkInId,
  });
  revalidateCheckIn();
}
