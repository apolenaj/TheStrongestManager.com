"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/services/auth/session";
import {
  updateActivityFeedPreferences,
} from "@/services/activity-feed";
import type { ActivityFeedVisibility } from "@/domain/activity-feed";

export type ActivityFeedActionState = {
  ok: boolean;
  error?: string;
};

function boolFromForm(formData: FormData, key: string): boolean {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

export async function updateActivityFeedVisibilityAction(
  _prev: ActivityFeedActionState,
  formData: FormData,
): Promise<ActivityFeedActionState> {
  const session = await requireSession();

  const prefs: ActivityFeedVisibility = {
    feedEnabled: boolFromForm(formData, "feedEnabled"),
    showPrs: boolFromForm(formData, "showPrs"),
    showCompetitionResults: boolFromForm(formData, "showCompetitionResults"),
    showAchievements: boolFromForm(formData, "showAchievements"),
    showSharedTechnique: boolFromForm(formData, "showSharedTechnique"),
  };

  const result = await updateActivityFeedPreferences({
    userId: session.user.id,
    prefs,
  });

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  revalidatePath("/app/activity-feed");
  return { ok: true };
}
