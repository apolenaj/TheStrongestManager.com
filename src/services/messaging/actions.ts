"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/services/auth/session";
import {
  flagMessage,
  openOrGetThread,
  sendMessage,
} from "@/services/messaging";

function revalidateMessaging(threadId?: string) {
  revalidatePath("/app/messages");
  revalidatePath("/app/notifications");
  if (threadId) {
    revalidatePath(`/app/messages?thread=${threadId}`);
  }
}

export async function openThreadAction(formData: FormData) {
  const session = await requireSession();
  const coachUserId = String(formData.get("coachUserId") ?? "");
  const athleteProfileId = String(formData.get("athleteProfileId") ?? "");
  if (!coachUserId || !athleteProfileId) return;

  const result = await openOrGetThread({
    actorUserId: session.user.id,
    coachUserId,
    athleteProfileId,
  });
  if (result.ok) {
    revalidateMessaging(result.threadId);
  }
  return result;
}

export async function sendMessageAction(formData: FormData): Promise<
  { ok: true; messageId: string } | { ok: false; error: string }
> {
  const session = await requireSession();
  const threadId = String(formData.get("threadId") ?? "");
  if (!threadId) return { ok: false, error: "Missing thread." };

  const body = String(formData.get("body") ?? "");
  const relatedType = String(formData.get("relatedType") ?? "") || null;
  const relatedId = String(formData.get("relatedId") ?? "") || null;

  let attachment: {
    buffer: Buffer;
    fileName: string;
    mimeType: string;
  } | null = null;

  const file = formData.get("attachment");
  if (file && typeof file === "object" && "arrayBuffer" in file) {
    const f = file as File;
    if (f.size > 0) {
      const buf = Buffer.from(await f.arrayBuffer());
      attachment = {
        buffer: buf,
        fileName: f.name || "attachment.bin",
        mimeType: f.type || "application/octet-stream",
      };
    }
  }

  const result = await sendMessage({
    userId: session.user.id,
    threadId,
    body,
    relatedType,
    relatedId,
    attachment,
  });

  if (result.ok) revalidateMessaging(threadId);
  return result;
}

export async function flagMessageAction(formData: FormData) {
  const session = await requireSession();
  const messageId = String(formData.get("messageId") ?? "");
  if (!messageId) return;
  const reason = String(formData.get("reason") ?? "") || null;
  await flagMessage({
    userId: session.user.id,
    messageId,
    reason,
  });
  revalidateMessaging();
}
