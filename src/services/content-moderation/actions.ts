"use server";

import { revalidatePath } from "next/cache";
import {
  isContentModerationAction,
  isContentModerationRelatedType,
  isContentModerationReportReason,
} from "@/domain/content-moderation";
import { requireSession } from "@/services/auth/session";
import {
  reviewContentModerationReport,
  submitContentModerationReport,
} from "@/services/content-moderation/content-moderation-service";

export type ContentModerationActionState = {
  ok: boolean;
  error?: string;
  message?: string;
};

export async function submitContentReportAction(
  _prev: ContentModerationActionState,
  formData: FormData,
): Promise<ContentModerationActionState> {
  const session = await requireSession();
  const relatedType = String(formData.get("relatedType") ?? "");
  const relatedId = String(formData.get("relatedId") ?? "");
  const reason = String(formData.get("reason") ?? "");
  const details = String(formData.get("details") ?? "");

  if (!isContentModerationRelatedType(relatedType)) {
    return { ok: false, error: "Invalid content type." };
  }
  if (!isContentModerationReportReason(reason)) {
    return { ok: false, error: "Choose a valid reason." };
  }

  const result = await submitContentModerationReport({
    reporterUserId: session.user.id,
    relatedType,
    relatedId,
    reason,
    details: details || null,
  });

  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/app/moderation");
  return { ok: true, message: result.message };
}

export async function reviewContentReportAction(
  formData: FormData,
): Promise<void> {
  const session = await requireSession();
  const reportId = String(formData.get("reportId") ?? "");
  const action = String(formData.get("action") ?? "");
  const note = String(formData.get("note") ?? "");
  if (!isContentModerationAction(action)) return;

  await reviewContentModerationReport({
    reportId,
    actorUserId: session.user.id,
    action,
    note: note || null,
  });
  revalidatePath("/app/moderation");
}
