"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/services/auth/session";
import {
  decideTechniqueExpertReview,
  requestTechniqueExpertReview,
} from "@/services/technique-review/technique-review-service";

export type TechniqueReviewActionState = {
  ok: boolean;
  error?: string;
};

export async function requestTechniqueExpertReviewAction(
  _prev: TechniqueReviewActionState,
  formData: FormData,
): Promise<TechniqueReviewActionState> {
  const session = await requireSession();
  const analysisId = String(formData.get("analysisId") ?? "").trim();
  const consent = formData.get("consent") === "on" || formData.get("consent") === "true";

  const result = await requestTechniqueExpertReview({
    userId: session.user.id,
    analysisId,
    consent,
  });

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  revalidatePath(`/app/technique/${analysisId}`);
  revalidatePath("/app/technique-review");
  return { ok: true };
}

export async function decideTechniqueExpertReviewAction(
  _prev: TechniqueReviewActionState,
  formData: FormData,
): Promise<TechniqueReviewActionState> {
  const session = await requireSession();
  const reviewId = String(formData.get("reviewId") ?? "").trim();
  const decision = String(formData.get("decision") ?? "").trim();
  const comment = String(formData.get("comment") ?? "");
  const correctedSummary = String(formData.get("correctedSummary") ?? "");
  const scoreRaw = String(formData.get("correctedOverallScore") ?? "").trim();
  const correctedOverallScore =
    scoreRaw === "" ? null : Number.parseFloat(scoreRaw);

  const result = await decideTechniqueExpertReview({
    expertUserId: session.user.id,
    reviewId,
    decision,
    comment: comment || undefined,
    correctedSummary: correctedSummary || undefined,
    correctedOverallScore:
      correctedOverallScore != null && Number.isFinite(correctedOverallScore)
        ? correctedOverallScore
        : null,
  });

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  revalidatePath("/app/technique-review");
  revalidatePath(`/app/technique-review/${reviewId}`);
  return { ok: true };
}
