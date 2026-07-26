"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/services/admin/require-admin";
import { requireSession } from "@/services/auth/session";
import {
  reviewExpertContributor,
  saveExpertArticle,
  upsertExpertApplication,
} from "@/services/expert-contributor";

export type ExpertActionState = {
  ok: boolean;
  error?: string;
  message?: string;
  slug?: string;
};

export async function saveExpertProfileAction(
  _prev: ExpertActionState,
  formData: FormData,
): Promise<ExpertActionState> {
  const session = await requireSession();
  const specs = String(formData.get("specializations") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const result = await upsertExpertApplication(session.user.id, {
    displayName: String(formData.get("displayName") ?? ""),
    bio: String(formData.get("bio") ?? "") || null,
    specializations: specs,
    credentialsSummary: String(formData.get("credentialsSummary") ?? "") || null,
    experienceSummary: String(formData.get("experienceSummary") ?? "") || null,
    submitForReview: formData.get("submitForReview") === "on",
  });
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/app/expert-contributor");
  revalidatePath("/app/admin/expert-contributors");
  return { ok: true, message: "Profile saved." };
}

export async function saveExpertArticleAction(
  _prev: ExpertActionState,
  formData: FormData,
): Promise<ExpertActionState> {
  const session = await requireSession();
  const result = await saveExpertArticle(session.user.id, {
    id: String(formData.get("articleId") ?? "") || null,
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    body: String(formData.get("body") ?? ""),
    publish: formData.get("publish") === "on",
  });
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/app/expert-contributor");
  revalidatePath(`/experts`);
  return {
    ok: true,
    message: "Article saved.",
    slug: result.slug,
  };
}

export async function reviewExpertAction(
  _prev: ExpertActionState,
  formData: FormData,
): Promise<ExpertActionState> {
  const admin = await requireAdmin();
  const decisionRaw = String(formData.get("decision") ?? "");
  const decision =
    decisionRaw === "verify" ||
    decisionRaw === "reject" ||
    decisionRaw === "revoke"
      ? decisionRaw
      : null;
  if (!decision) return { ok: false, error: "Invalid decision." };

  const result = await reviewExpertContributor(
    admin.user.id,
    String(formData.get("profileId") ?? ""),
    decision,
    String(formData.get("note") ?? "") || null,
  );
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/app/admin/expert-contributors");
  revalidatePath("/app/expert-contributor");
  return { ok: true, message: `Application ${decision}d.` };
}
