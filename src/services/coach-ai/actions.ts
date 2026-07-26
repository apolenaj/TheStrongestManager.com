"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/services/auth/session";
import {
  decideCoachAiSuggestion,
  generateCoachAiSuggestions,
} from "@/services/coach-ai/coach-ai-service";

export type CoachAiActionResult =
  | { ok: true; createdCount?: number }
  | { ok: false; error: string };

function revalidate(athleteProfileId: string) {
  revalidatePath("/app/coach");
  revalidatePath(`/app/coach/${athleteProfileId}`);
}

export async function generateCoachAiSuggestionsAction(
  formData: FormData,
): Promise<CoachAiActionResult> {
  const session = await requireSession();
  const athleteProfileId = String(formData.get("athleteProfileId") ?? "");
  if (!athleteProfileId) return { ok: false, error: "Missing athlete." };

  const result = await generateCoachAiSuggestions({
    coachUserId: session.user.id,
    athleteProfileId,
  });
  if (!result.ok) return result;
  revalidate(athleteProfileId);
  return { ok: true, createdCount: result.createdCount };
}

export async function decideCoachAiSuggestionAction(
  formData: FormData,
): Promise<CoachAiActionResult> {
  const session = await requireSession();
  const suggestionId = String(formData.get("suggestionId") ?? "");
  const athleteProfileId = String(formData.get("athleteProfileId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const editedChange = String(formData.get("editedChange") ?? "").trim();
  const decisionNote = String(formData.get("decisionNote") ?? "").trim();

  if (!suggestionId) return { ok: false, error: "Missing suggestion." };
  if (!athleteProfileId) return { ok: false, error: "Missing athlete." };

  const result = await decideCoachAiSuggestion({
    coachUserId: session.user.id,
    suggestionId,
    decision,
    editedChange: editedChange || undefined,
    decisionNote: decisionNote || undefined,
  });
  if (!result.ok) return result;
  revalidate(athleteProfileId);
  return { ok: true };
}
