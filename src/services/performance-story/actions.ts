"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/services/auth/session";
import { createPerformanceStoryShare } from "@/services/performance-story";

export type PerformanceStoryActionState = {
  ok: boolean;
  error?: string;
  sharePath?: string;
};

export async function createPerformanceStoryShareAction(
  _prev: PerformanceStoryActionState,
  formData: FormData,
): Promise<PerformanceStoryActionState> {
  const session = await requireSession();
  const yearRaw = String(formData.get("year") ?? "").trim();
  const year = yearRaw ? Number(yearRaw) : undefined;
  const result = await createPerformanceStoryShare({
    userId: session.user.id,
    year: year != null && Number.isFinite(year) ? year : undefined,
  });
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/app/performance-story");
  return { ok: true, sharePath: result.path };
}
