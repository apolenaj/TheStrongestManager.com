"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/services/auth/session";
import { getProgramAiReview } from "@/services/program-review/program-review-service";

export type SaveProgramReviewResult =
  | { ok: true; storedId: string }
  | { ok: false; error: string };

export async function saveProgramAiReviewAction(
  programId: string,
): Promise<SaveProgramReviewResult> {
  const session = await requireSession();
  if (!programId) {
    return { ok: false, error: "Select a program to save a review." };
  }
  const view = await getProgramAiReview({
    userId: session.user.id,
    programId,
    persist: true,
  });
  if (!view?.storedId) {
    return { ok: false, error: "Could not save program review." };
  }
  revalidatePath("/app/program-review");
  return { ok: true, storedId: view.storedId };
}
