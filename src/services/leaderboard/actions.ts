"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/services/auth/session";
import { upsertLeaderboardOptIn } from "@/services/leaderboard";
import {
  defaultCategoryParticipation,
  LEADERBOARD_CATEGORY_OPTIONS,
  type LeaderboardCategoryId,
} from "@/domain/leaderboard";

export type LeaderboardOptInActionState = {
  ok: boolean;
  error?: string;
  message?: string;
};

export async function saveLeaderboardOptInAction(
  _prev: LeaderboardOptInActionState,
  formData: FormData,
): Promise<LeaderboardOptInActionState> {
  const session = await requireSession();

  const categories = defaultCategoryParticipation();
  for (const opt of LEADERBOARD_CATEGORY_OPTIONS) {
    const id = opt.id as LeaderboardCategoryId;
    categories[id] = formData.get(`cat_${id}`) === "on";
  }

  const classKgRaw = String(formData.get("bodyweightClassMaxKg") ?? "");
  const classKg = classKgRaw ? Number(classKgRaw) : null;

  const result = await upsertLeaderboardOptIn(session.user.id, {
    optedIn: formData.get("optedIn") === "on",
    countryCode: String(formData.get("countryCode") ?? "") || null,
    bodyweightClassLabel:
      String(formData.get("bodyweightClassLabel") ?? "") || null,
    bodyweightClassMaxKg:
      classKg != null && Number.isFinite(classKg) && classKg > 0
        ? classKg
        : null,
    sport: String(formData.get("sport") ?? "") || null,
    categories,
    showDisplayName: formData.get("showDisplayName") === "on",
  });

  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/app/leaderboards");
  return { ok: true, message: "Leaderboard preferences saved." };
}
