"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/services/auth/session";
import { createYearInReviewShare } from "@/services/year-in-review";

export type YearInReviewActionState = {
  ok: boolean;
  error?: string;
  sharePath?: string;
};

export async function createYearInReviewShareAction(
  _prev: YearInReviewActionState,
  formData: FormData,
): Promise<YearInReviewActionState> {
  const session = await requireSession();
  const yearRaw = String(formData.get("year") ?? "").trim();
  const year = yearRaw ? Number(yearRaw) : undefined;
  const result = await createYearInReviewShare({
    userId: session.user.id,
    year: year != null && Number.isFinite(year) ? year : undefined,
  });
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/app/year-in-review");
  return { ok: true, sharePath: result.path };
}
