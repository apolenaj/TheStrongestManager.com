"use server";

import { redirect } from "next/navigation";
import { buildAthleteProfileFromOnboarding } from "@/services/onboarding/build-profile";
import {
  onboardingDraftSchema,
  toOnboardingDraft,
} from "@/services/onboarding/schemas";
import { requireSession } from "@/services/auth/session";
import { prisma } from "@/lib/db";

export type CompleteOnboardingState = {
  ok: boolean;
  error?: string;
};

export async function completeOnboardingAction(
  _prev: CompleteOnboardingState,
  formData: FormData,
): Promise<CompleteOnboardingState> {
  const session = await requireSession();

  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("payload") ?? "{}"));
  } catch {
    return { ok: false, error: "Invalid onboarding payload." };
  }

  const parsed = onboardingDraftSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error:
        parsed.error.issues[0]?.message ?? "Please complete required steps.",
    };
  }

  const result = await buildAthleteProfileFromOnboarding({
    userId: session.user.id,
    draft: toOnboardingDraft(parsed.data),
  });

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  redirect(result.redirectTo);
}

export async function getAthleteOnboardingStatus(userId: string) {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true, onboardingCompletedAt: true },
  });

  return {
    hasProfile: Boolean(profile),
    completed: Boolean(profile?.onboardingCompletedAt),
    athleteProfileId: profile?.id ?? null,
  };
}
