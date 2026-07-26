"use server";

import { requireSession } from "@/services/auth/session";
import { askCoachChat } from "@/services/coach-brain/chat-service";
import type { CoachChatTurnResult } from "@/services/coach-brain/chat-service";

export type CoachChatActionResult =
  | { ok: true; turn: CoachChatTurnResult }
  | { ok: false; error: string };

export async function askCoachChatAction(
  question: string,
): Promise<CoachChatActionResult> {
  const session = await requireSession();
  const trimmed = question.trim();
  if (!trimmed) {
    return { ok: false, error: "Enter a question about your training." };
  }
  if (trimmed.length > 500) {
    return { ok: false, error: "Keep questions under 500 characters." };
  }

  const turn = await askCoachChat({
    userId: session.user.id,
    question: trimmed,
  });

  if (!turn) {
    return {
      ok: false,
      error:
        "No athlete profile found. Complete onboarding before using the AI Coach chat.",
    };
  }

  return { ok: true, turn };
}
