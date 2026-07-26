"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/services/auth/session";
import {
  applyAutoregulationSuggestion,
  type AutoregulationApplyResult,
} from "@/services/live-session-autoregulation";

export async function confirmAutoregulationSuggestionAction(input: {
  sessionId: string;
  nextSessionSetId: string;
  proposedLoadKg: number;
}): Promise<AutoregulationApplyResult> {
  const session = await requireSession();
  const result = await applyAutoregulationSuggestion({
    userId: session.user.id,
    nextSessionSetId: input.nextSessionSetId,
    proposedLoadKg: input.proposedLoadKg,
    confirmed: true,
  });
  if (result.ok) {
    revalidatePath("/app/today");
    revalidatePath("/app/training");
    revalidatePath(`/app/training/${input.sessionId}`);
  }
  return result;
}
