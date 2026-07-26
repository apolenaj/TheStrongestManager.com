"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/services/auth/session";
import {
  isPremiumCoachingAvailability,
  isPremiumCoachingBudgetRange,
  isPremiumCoachingExperience,
  isPremiumCoachingGoal,
  isPremiumCoachingStatus,
  type PremiumCoachingStatus,
} from "@/domain/premium-coaching-sales";
import {
  advancePremiumCoachingApplication,
  submitPremiumCoachingApplication,
  withdrawPremiumCoachingApplication,
} from "@/services/premium-coaching-sales";

function revalidatePremium() {
  revalidatePath("/coaching/premium");
  revalidatePath("/coaching/premium/apply");
  revalidatePath("/app/premium-coaching");
  revalidatePath("/app/premium-coaching/review");
}

export async function submitPremiumCoachingApplicationAction(
  formData: FormData,
): Promise<
  | { ok: true; message: string; applicationId: string }
  | { ok: false; error: string }
> {
  const session = await requireSession();
  const goal = String(formData.get("goal") ?? "");
  const experienceLevel = String(formData.get("experienceLevel") ?? "");
  const budgetRange = String(formData.get("budgetRange") ?? "");
  const availability = String(formData.get("availability") ?? "");
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (
    !isPremiumCoachingGoal(goal) ||
    !isPremiumCoachingExperience(experienceLevel) ||
    !isPremiumCoachingBudgetRange(budgetRange) ||
    !isPremiumCoachingAvailability(availability)
  ) {
    return { ok: false, error: "Complete all required application fields." };
  }

  const result = await submitPremiumCoachingApplication({
    userId: session.user.id,
    goal,
    experienceLevel,
    budgetRange,
    availability,
    notes,
  });

  if (result.ok) revalidatePremium();
  return result.ok
    ? {
        ok: true,
        message: result.message,
        applicationId: result.applicationId,
      }
    : result;
}

export async function withdrawPremiumCoachingApplicationAction(
  formData: FormData,
) {
  const session = await requireSession();
  const applicationId = String(formData.get("applicationId") ?? "");
  if (!applicationId) return;
  await withdrawPremiumCoachingApplication({
    userId: session.user.id,
    applicationId,
  });
  revalidatePremium();
}

export async function advancePremiumCoachingApplicationAction(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireSession();
  const applicationId = String(formData.get("applicationId") ?? "");
  const toStatus = String(formData.get("toStatus") ?? "");
  const offerNotes = String(formData.get("offerNotes") ?? "").trim() || null;

  if (!applicationId || !isPremiumCoachingStatus(toStatus)) {
    return { ok: false, error: "Invalid stage change." };
  }

  const result = await advancePremiumCoachingApplication({
    actorUserId: session.user.id,
    applicationId,
    toStatus: toStatus as PremiumCoachingStatus,
    offerNotes,
  });
  if (result.ok) revalidatePremium();
  return result;
}
