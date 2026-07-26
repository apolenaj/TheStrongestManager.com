"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/services/auth/session";
import {
  deleteTechniqueAnalysisForUser,
  updateVideoPrivacyForUser,
} from "@/services/technique/analysis-service";

export type TechniqueActionState = {
  ok: boolean;
  error?: string;
  message?: string;
};

export async function deleteTechniqueAnalysisAction(
  _prev: TechniqueActionState,
  formData: FormData,
): Promise<TechniqueActionState> {
  const session = await requireSession();
  const analysisId = String(formData.get("analysisId") ?? "");
  if (!analysisId) {
    return { ok: false, error: "Missing analysis id." };
  }

  const result = await deleteTechniqueAnalysisForUser(
    session.user.id,
    analysisId,
  );
  if (!result.ok) return result;

  revalidatePath("/app/technique");
  revalidatePath(`/app/technique/${analysisId}`);
  return {
    ok: true,
    message: "Upload deleted. Media removed from private storage.",
  };
}

export async function updateVideoPrivacyAction(
  _prev: TechniqueActionState,
  formData: FormData,
): Promise<TechniqueActionState> {
  const session = await requireSession();
  const analysisId = String(formData.get("analysisId") ?? "");
  if (!analysisId) {
    return { ok: false, error: "Missing analysis id." };
  }

  const result = await updateVideoPrivacyForUser({
    userId: session.user.id,
    analysisId,
    allowExpertReview: String(formData.get("allowExpertReview") ?? "") === "on",
    allowAnonymousModelImprovement:
      String(formData.get("allowAnonymousModelImprovement") ?? "") === "on",
  });
  if (!result.ok) return result;

  revalidatePath(`/app/technique/${analysisId}`);
  return {
    ok: true,
    message:
      "Video privacy settings updated. Optional sharing requires explicit opt-in.",
  };
}
