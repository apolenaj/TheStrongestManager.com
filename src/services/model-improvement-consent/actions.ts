"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/services/auth/session";
import {
  revokeExpertReviewOnAllVideos,
  revokeResearchOnAllVideos,
  setExpertReviewAccountConsent,
  setResearchModelImprovementConsent,
} from "@/services/model-improvement-consent";

export type ConsentActionState = {
  ok: boolean;
  error?: string;
  message?: string;
};

function revalidateConsent() {
  revalidatePath("/app/settings");
  revalidatePath("/app/settings/consent");
  revalidatePath("/app/technique");
}

export async function setExpertReviewConsentAction(
  _prev: ConsentActionState,
  formData: FormData,
): Promise<ConsentActionState> {
  const session = await requireSession();
  const optedIn = String(formData.get("optedIn") ?? "") === "on";
  const result = await setExpertReviewAccountConsent({
    userId: session.user.id,
    optedIn,
  });
  if (!result.ok) return result;
  revalidateConsent();
  return {
    ok: true,
    message: optedIn
      ? "Expert review preference saved. Per-video opt-in is still required when uploading or sharing."
      : "Expert review account preference turned off.",
  };
}

export async function revokeExpertReviewAction(
  _prev: ConsentActionState,
  _formData: FormData,
): Promise<ConsentActionState> {
  const session = await requireSession();
  const result = await revokeExpertReviewOnAllVideos({
    userId: session.user.id,
  });
  if (!result.ok) return result;
  revalidateConsent();
  return {
    ok: true,
    message: `Revoked expert share on ${result.updated} video${result.updated === 1 ? "" : "s"} and turned off the account preference.`,
  };
}

export async function setResearchConsentAction(
  _prev: ConsentActionState,
  formData: FormData,
): Promise<ConsentActionState> {
  const session = await requireSession();
  const optedIn = String(formData.get("optedIn") ?? "") === "on";
  const result = await setResearchModelImprovementConsent({
    userId: session.user.id,
    optedIn,
    includeTechniqueAggregates: true,
  });
  if (!result.ok) return result;
  revalidateConsent();
  return {
    ok: true,
    message: optedIn
      ? "Research / model-improvement consent saved. This does not enable expert review. Per-video flags remain separate."
      : "Research consent revoked. Video model-improvement flags cleared.",
  };
}

export async function revokeResearchVideosAction(
  _prev: ConsentActionState,
  _formData: FormData,
): Promise<ConsentActionState> {
  const session = await requireSession();
  const result = await revokeResearchOnAllVideos({ userId: session.user.id });
  if (!result.ok) return result;
  revalidateConsent();
  return {
    ok: true,
    message: `Cleared model-improvement flags on ${result.updated} video${result.updated === 1 ? "" : "s"}.`,
  };
}
