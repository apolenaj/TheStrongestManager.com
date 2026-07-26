"use server";

import { revalidatePath } from "next/cache";
import {
  isAdminEntityType,
  type AdminEntityType,
} from "@/domain/admin";
import { requireAdmin } from "@/services/admin/require-admin";
import {
  recordContentReview,
  recordFeatureFlagsReview,
} from "@/services/admin/admin-service";

function revalidateAdmin() {
  revalidatePath("/app/admin");
  revalidatePath("/app/admin/audit");
}

export async function recordContentReviewAction(formData: FormData): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const admin = await requireAdmin();
  const entityTypeRaw = String(formData.get("entityType") ?? "");
  const entityId = String(formData.get("entityId") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim() || undefined;

  if (!isAdminEntityType(entityTypeRaw)) {
    return { ok: false, error: "Invalid entity type." };
  }
  if (
    entityTypeRaw === "feature_flag" ||
    entityTypeRaw === "system"
  ) {
    return { ok: false, error: "Use the feature-flags review action." };
  }
  if (!entityId) return { ok: false, error: "Missing entity id." };

  await recordContentReview({
    actorUserId: admin.user.id,
    entityType: entityTypeRaw as Exclude<
      AdminEntityType,
      "feature_flag" | "system"
    >,
    entityId,
    note,
  });
  revalidateAdmin();
  return { ok: true };
}

export async function recordFeatureFlagsReviewAction(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  const note = String(formData.get("note") ?? "").trim() || undefined;
  await recordFeatureFlagsReview({
    actorUserId: admin.user.id,
    note,
  });
  revalidateAdmin();
  revalidatePath("/app/admin/feature-flags");
  return { ok: true };
}
