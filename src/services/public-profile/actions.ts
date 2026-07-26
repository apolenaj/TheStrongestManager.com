"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/services/auth/session";
import {
  upsertPublicProfileSettings,
} from "@/services/public-profile";
import {
  PUBLIC_PROFILE_FIELD_OPTIONS,
  type PublicProfileFieldId,
  type PublicProfileVisibility,
  defaultVisibility,
} from "@/domain/public-profile";

export type PublicProfileActionState = {
  ok: boolean;
  error?: string;
  message?: string;
  publicPath?: string | null;
};

export async function savePublicProfileAction(
  _prev: PublicProfileActionState,
  formData: FormData,
): Promise<PublicProfileActionState> {
  const session = await requireSession();

  const isPublic = formData.get("isPublic") === "on";
  const slug = String(formData.get("slug") ?? "");
  const bio = String(formData.get("bio") ?? "");

  const visibility = defaultVisibility();
  for (const opt of PUBLIC_PROFILE_FIELD_OPTIONS) {
    const id = opt.id as PublicProfileFieldId;
    visibility[id] = formData.get(`vis_${id}`) === "on";
  }

  // Safety: body metrics never forced on
  if (formData.get("vis_body_metrics") !== "on") {
    visibility.body_metrics = false;
  }

  const result = await upsertPublicProfileSettings(session.user.id, {
    isPublic,
    slug: slug || null,
    bio: bio || null,
    visibility: visibility as PublicProfileVisibility,
  });

  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/app/profile");
  revalidatePath("/app/settings");
  if (result.publicPath) revalidatePath(result.publicPath);

  return {
    ok: true,
    message: isPublic
      ? "Public profile enabled."
      : "Public profile saved (private).",
    publicPath: result.publicPath,
  };
}
