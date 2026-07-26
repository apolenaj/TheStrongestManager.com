"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/services/admin/require-admin";
import { requireSession } from "@/services/auth/session";
import {
  acceptCommunityAnswer,
  createCommunityAnswer,
  createCommunityQuestion,
  flagCommunityContent,
  moderateCommunityContent,
  refreshQuestionAiSummary,
  voteOnCommunityTarget,
} from "@/services/community-qa";

export type QaActionState = {
  ok: boolean;
  error?: string;
  message?: string;
  id?: string;
};

export async function askQuestionAction(
  _prev: QaActionState,
  formData: FormData,
): Promise<QaActionState> {
  const session = await requireSession();
  const result = await createCommunityQuestion(session.user.id, {
    category: String(formData.get("category") ?? ""),
    title: String(formData.get("title") ?? ""),
    body: String(formData.get("body") ?? ""),
  });
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/app/community-qa");
  return { ok: true, message: "Question posted.", id: result.id };
}

export async function answerQuestionAction(
  _prev: QaActionState,
  formData: FormData,
): Promise<QaActionState> {
  const session = await requireSession();
  const questionId = String(formData.get("questionId") ?? "");
  const result = await createCommunityAnswer(
    session.user.id,
    questionId,
    String(formData.get("body") ?? ""),
  );
  if (!result.ok) return { ok: false, error: result.error };
  await refreshQuestionAiSummary(questionId);
  revalidatePath(`/app/community-qa/${questionId}`);
  revalidatePath("/app/community-qa");
  return { ok: true, message: "Answer posted." };
}

export async function voteQaAction(
  _prev: QaActionState,
  formData: FormData,
): Promise<QaActionState> {
  const session = await requireSession();
  const targetType = String(formData.get("targetType") ?? "");
  if (targetType !== "question" && targetType !== "answer") {
    return { ok: false, error: "Invalid vote target." };
  }
  const result = await voteOnCommunityTarget(session.user.id, {
    targetType,
    targetId: String(formData.get("targetId") ?? ""),
    value: Number(formData.get("value")),
  });
  if (!result.ok) return { ok: false, error: result.error };
  const questionId = String(formData.get("questionId") ?? "");
  if (questionId) revalidatePath(`/app/community-qa/${questionId}`);
  revalidatePath("/app/community-qa");
  return { ok: true };
}

export async function acceptAnswerAction(
  _prev: QaActionState,
  formData: FormData,
): Promise<QaActionState> {
  const session = await requireSession();
  const questionId = String(formData.get("questionId") ?? "");
  const result = await acceptCommunityAnswer(
    session.user.id,
    questionId,
    String(formData.get("answerId") ?? ""),
  );
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath(`/app/community-qa/${questionId}`);
  return { ok: true, message: "Answer accepted." };
}

export async function flagQaAction(
  _prev: QaActionState,
  formData: FormData,
): Promise<QaActionState> {
  const session = await requireSession();
  const kind = String(formData.get("kind") ?? "");
  if (kind !== "question" && kind !== "answer") {
    return { ok: false, error: "Invalid flag target." };
  }
  const result = await flagCommunityContent(session.user.id, {
    kind,
    id: String(formData.get("id") ?? ""),
    reason: String(formData.get("reason") ?? "") || undefined,
  });
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/app/admin/community-qa");
  return { ok: true, message: "Thanks — flagged for moderation." };
}

export async function moderateQaAction(
  _prev: QaActionState,
  formData: FormData,
): Promise<QaActionState> {
  const admin = await requireAdmin();
  const kind = String(formData.get("kind") ?? "");
  if (kind !== "question" && kind !== "answer") {
    return { ok: false, error: "Invalid target." };
  }
  const result = await moderateCommunityContent(admin.user.id, {
    kind,
    id: String(formData.get("id") ?? ""),
    action: String(formData.get("action") ?? ""),
    reason: String(formData.get("reason") ?? "") || null,
  });
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/app/admin/community-qa");
  revalidatePath("/app/community-qa");
  return { ok: true, message: "Moderation applied." };
}

export async function summarizeQaAction(
  _prev: QaActionState,
  formData: FormData,
): Promise<QaActionState> {
  await requireSession();
  const questionId = String(formData.get("questionId") ?? "");
  const result = await refreshQuestionAiSummary(questionId);
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath(`/app/community-qa/${questionId}`);
  return { ok: true, message: "AI summary refreshed (labelled as AI)." };
}
