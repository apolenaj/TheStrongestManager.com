"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/services/auth/session";
import type { AdaptationParams } from "@/domain/adaptive/engine";
import {
  decideAdaptation,
  proposeAdaptationsForAthlete,
} from "@/services/adaptive/adaptation-service";

export type AdaptationActionResult =
  | { ok: true; createdCount?: number; skippedReason?: string }
  | { ok: false; error: string };

function revalidateAdaptationPaths() {
  revalidatePath("/app/programs");
  revalidatePath("/app/adaptations");
  revalidatePath("/app/today");
  revalidatePath("/app/training");
}

export async function refreshAdaptationsAction(): Promise<AdaptationActionResult> {
  const session = await requireSession();
  const result = await proposeAdaptationsForAthlete({
    userId: session.user.id,
  });
  if (!result.ok) return result;
  revalidateAdaptationPaths();
  return {
    ok: true,
    createdCount: result.createdIds.length,
    skippedReason: result.skippedReason,
  };
}

export async function acceptAdaptationAction(
  adaptationId: string,
): Promise<AdaptationActionResult> {
  const session = await requireSession();
  const result = await decideAdaptation({
    userId: session.user.id,
    adaptationId,
    decision: "accept",
  });
  if (!result.ok) return result;
  revalidateAdaptationPaths();
  return { ok: true };
}

export async function modifyAdaptationAction(input: {
  adaptationId: string;
  deltaKg?: number;
  loadMultiplier?: number;
  setsDelta?: number;
  decisionNote?: string;
}): Promise<AdaptationActionResult> {
  const session = await requireSession();
  const modifiedParams: AdaptationParams = {};
  if (input.deltaKg != null && Number.isFinite(input.deltaKg)) {
    modifiedParams.deltaKg = input.deltaKg;
  }
  if (input.loadMultiplier != null && Number.isFinite(input.loadMultiplier)) {
    modifiedParams.loadMultiplier = input.loadMultiplier;
  }
  if (input.setsDelta != null && Number.isFinite(input.setsDelta)) {
    modifiedParams.setsDelta = Math.trunc(input.setsDelta);
  }

  const result = await decideAdaptation({
    userId: session.user.id,
    adaptationId: input.adaptationId,
    decision: "modify",
    modifiedParams,
    decisionNote: input.decisionNote,
  });
  if (!result.ok) return result;
  revalidateAdaptationPaths();
  return { ok: true };
}

export async function declineAdaptationAction(input: {
  adaptationId: string;
  decisionNote?: string;
}): Promise<AdaptationActionResult> {
  const session = await requireSession();
  const result = await decideAdaptation({
    userId: session.user.id,
    adaptationId: input.adaptationId,
    decision: "decline",
    decisionNote: input.decisionNote,
  });
  if (!result.ok) return result;
  revalidateAdaptationPaths();
  return { ok: true };
}
