"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  completeCatalogWorkoutSession,
  logCatalogWorkoutSet,
  resolveCatalogTmAdjustment,
} from "@/services/catalog-workout/workout-service";

export type CatalogWorkoutActionResult =
  | { ok: true; createdAdjustmentId?: string | null }
  | { ok: false; error: string };

async function requireUserId(): Promise<
  { ok: true; userId: string } | { ok: false; error: string }
> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Unauthorized." };
  return { ok: true, userId: session.user.id };
}

function revalidateWorkout(userProgramId: string, dayKey?: string) {
  revalidatePath("/app/programs");
  revalidatePath(`/app/programs/active/${userProgramId}`);
  if (dayKey) {
    revalidatePath(`/app/programs/active/${userProgramId}/day/${dayKey}`);
  }
}

export async function logCatalogSetAction(input: {
  sessionId: string;
  userProgramId: string;
  dayKey: string;
  exerciseId: string;
  exerciseName: string;
  setIndex: number;
  prescribedReps: number | null;
  prescribedPercent: number | null;
  prescribedRpe: number | null;
  suggestedWeight: number | null;
  actualWeight: string;
  actualRpe: string;
  actualRir: string;
  notes: string;
  painFlag: boolean;
}): Promise<CatalogWorkoutActionResult> {
  const authResult = await requireUserId();
  if (!authResult.ok) return authResult;

  const parseOptional = (raw: string): number | null => {
    const t = raw.trim();
    if (!t) return null;
    const n = Number(t);
    return Number.isFinite(n) ? n : Number.NaN;
  };

  const actualWeight = parseOptional(input.actualWeight);
  const actualRpe = parseOptional(input.actualRpe);
  const actualRir = parseOptional(input.actualRir);
  if (
    (actualWeight != null && Number.isNaN(actualWeight)) ||
    (actualRpe != null && Number.isNaN(actualRpe)) ||
    (actualRir != null && Number.isNaN(actualRir))
  ) {
    return { ok: false, error: "Weight, RPE, and RIR must be valid numbers." };
  }

  const result = await logCatalogWorkoutSet({
    userId: authResult.userId,
    sessionId: input.sessionId,
    exerciseId: input.exerciseId,
    exerciseName: input.exerciseName,
    setIndex: input.setIndex,
    prescribedReps: input.prescribedReps,
    prescribedPercent: input.prescribedPercent,
    prescribedRpe: input.prescribedRpe,
    suggestedWeight: input.suggestedWeight,
    actualWeight,
    actualRpe,
    actualRir,
    notes: input.notes.trim() || null,
    painFlag: input.painFlag,
  });

  if (!result.ok) return result;
  revalidateWorkout(input.userProgramId, input.dayKey);
  return {
    ok: true,
    createdAdjustmentId: result.createdAdjustmentId,
  };
}

export async function completeCatalogWorkoutAction(input: {
  sessionId: string;
  userProgramId: string;
  dayKey: string;
}): Promise<CatalogWorkoutActionResult> {
  const authResult = await requireUserId();
  if (!authResult.ok) return authResult;

  const result = await completeCatalogWorkoutSession({
    userId: authResult.userId,
    sessionId: input.sessionId,
  });
  if (!result.ok) return result;
  revalidateWorkout(input.userProgramId, input.dayKey);
  return { ok: true };
}

export async function resolveCatalogTmAdjustmentAction(input: {
  adjustmentId: string;
  userProgramId: string;
  dayKey?: string;
  decision: "approved" | "dismissed";
}): Promise<CatalogWorkoutActionResult> {
  const authResult = await requireUserId();
  if (!authResult.ok) return authResult;

  const result = await resolveCatalogTmAdjustment({
    userId: authResult.userId,
    adjustmentId: input.adjustmentId,
    decision: input.decision,
  });
  if (!result.ok) return result;
  revalidateWorkout(input.userProgramId, input.dayKey);
  return { ok: true };
}
