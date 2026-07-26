"use server";

import { redirect } from "next/navigation";
import { requireSession } from "@/services/auth/session";
import { deleteAllTechniqueVideosForUser } from "@/services/privacy/purge-media";

export type PrivacyActionState = {
  ok: boolean;
  error?: string;
  message?: string;
};

/** Opens the authenticated JSON export download (rate-limited on the route). */
export async function requestDataExportAction(): Promise<void> {
  await requireSession();
  redirect("/app/settings/export");
}

export async function deleteAllVideosAction(
  _prev: PrivacyActionState,
  formData: FormData,
): Promise<PrivacyActionState> {
  const session = await requireSession();
  const confirmation = String(formData.get("confirmation") ?? "");
  if (confirmation !== "DELETE VIDEOS") {
    return {
      ok: false,
      error:
        "Type DELETE VIDEOS to confirm removing all uploaded technique videos.",
    };
  }

  const result = await deleteAllTechniqueVideosForUser(session.user.id);
  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  return {
    ok: true,
    message:
      result.deletedCount === 0
        ? "No technique videos to delete."
        : `Deleted ${result.deletedCount} technique video${result.deletedCount === 1 ? "" : "s"} from private storage.`,
  };
}
