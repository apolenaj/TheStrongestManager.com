"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/services/auth/session";
import {
  ensureUserReferralCode,
  getReferralProgramView,
} from "@/services/referral-program/referral-program-service";

export type ReferralActionState = {
  ok: boolean;
  error?: string;
  code?: string;
  invitePath?: string;
};

export async function ensureReferralCodeAction(): Promise<ReferralActionState> {
  const session = await requireSession();
  try {
    const issued = await ensureUserReferralCode(session.user.id);
    revalidatePath("/app/referral");
    return {
      ok: true,
      code: issued.code,
      invitePath: issued.invitePath,
    };
  } catch {
    return { ok: false, error: "Could not issue referral code." };
  }
}

export async function refreshReferralViewAction(): Promise<
  | { ok: true }
  | { ok: false; error: string }
> {
  const session = await requireSession();
  const result = await getReferralProgramView({ userId: session.user.id });
  if (!result.ok) return result;
  revalidatePath("/app/referral");
  return { ok: true };
}
