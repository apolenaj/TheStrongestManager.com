"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/services/auth/session";
import { submitModelFeedback } from "@/services/model-feedback/model-feedback-service";
import type { ModelFeedbackRole } from "@/domain/model-feedback";

export async function submitModelFeedbackAction(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireSession();
  const role = String(formData.get("role") ?? "athlete") as ModelFeedbackRole;
  const relatedType = String(formData.get("relatedType") ?? "");
  const relatedId = String(formData.get("relatedId") ?? "");
  const verdict = String(formData.get("verdict") ?? "");
  const reason = String(formData.get("reason") ?? "");
  const athleteProfileId = String(formData.get("athleteProfileId") ?? "");

  const result = await submitModelFeedback({
    actorUserId: session.user.id,
    role: role === "coach" ? "coach" : "athlete",
    relatedType,
    relatedId,
    verdict,
    reason: reason || undefined,
    athleteProfileId: athleteProfileId || undefined,
  });

  if (!result.ok) return result;

  revalidatePath("/app/adaptations");
  revalidatePath("/app/insights");
  revalidatePath("/app/program-review");
  revalidatePath("/app/programs");
  if (athleteProfileId) {
    revalidatePath(`/app/coach/${athleteProfileId}`);
  }
  return { ok: true };
}
