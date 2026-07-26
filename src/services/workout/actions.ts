"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/services/auth/session";
import {
  parseMassInput,
  normalizeMassUnit,
} from "@/services/units/convert";
import { prisma } from "@/lib/db";
import {
  completeWorkoutSession,
  logSessionSet,
  startTodaysWorkout,
  updateSessionNotes,
} from "@/services/workout/workout-service";
import { proposeAdaptationsForAthlete } from "@/services/adaptive/adaptation-service";
import {
  getAutoregulationOfferAfterSet,
  type AutoregulationOffer,
} from "@/services/live-session-autoregulation";

export type WorkoutActionResult =
  | { ok: true; sessionId?: string; autoregulation?: AutoregulationOffer | null }
  | { ok: false; error: string };

function revalidateWorkoutPaths(sessionId?: string) {
  revalidatePath("/app/today");
  revalidatePath("/app/training");
  if (sessionId) {
    revalidatePath(`/app/training/${sessionId}`);
  }
}

export async function startTodaysWorkoutAction(): Promise<WorkoutActionResult> {
  const session = await requireSession();
  const result = await startTodaysWorkout(session.user.id);
  if (!result.ok) return result;
  revalidateWorkoutPaths(result.sessionId);
  return { ok: true, sessionId: result.sessionId };
}

export async function logSessionSetAction(input: {
  sessionSetId: string;
  sessionId: string;
  load: string;
  reps: string;
  rpe: string;
  rir: string;
  notes: string;
  markComplete: boolean;
}): Promise<WorkoutActionResult> {
  const session = await requireSession();
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: session.user.id },
    select: { units: true },
  });
  const units = normalizeMassUnit(profile?.units);

  const loadTrim = input.load.trim();
  let performedLoadKg: number | null = null;
  if (loadTrim) {
    performedLoadKg = parseMassInput(loadTrim, units);
    if (performedLoadKg == null) {
      return { ok: false, error: "Enter a valid load." };
    }
  }

  const repsTrim = input.reps.trim();
  let performedReps: number | null = null;
  if (repsTrim) {
    const n = Number(repsTrim);
    if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) {
      return { ok: false, error: "Enter whole-number reps." };
    }
    performedReps = n;
  }

  const rpeTrim = input.rpe.trim();
  let performedRpe: number | null = null;
  if (rpeTrim) {
    const n = Number(rpeTrim);
    if (!Number.isFinite(n) || n < 0 || n > 10) {
      return { ok: false, error: "RPE must be between 0 and 10." };
    }
    performedRpe = n;
  }

  const rirTrim = input.rir.trim();
  let performedRir: number | null = null;
  if (rirTrim) {
    const n = Number(rirTrim);
    if (!Number.isFinite(n) || n < 0 || n > 10) {
      return { ok: false, error: "RIR must be between 0 and 10." };
    }
    performedRir = n;
  }

  if (input.markComplete && performedReps == null && performedLoadKg == null) {
    return {
      ok: false,
      error: "Log weight or reps before marking the set complete.",
    };
  }

  const result = await logSessionSet({
    userId: session.user.id,
    sessionSetId: input.sessionSetId,
    performedLoadKg,
    performedReps,
    performedRpe,
    performedRir,
    notes: input.notes || null,
    markComplete: input.markComplete,
  });
  if (!result.ok) return result;

  let autoregulation: AutoregulationOffer | null = null;
  if (input.markComplete) {
    autoregulation = await getAutoregulationOfferAfterSet({
      sessionSetId: input.sessionSetId,
      userId: session.user.id,
    });
  }

  revalidateWorkoutPaths(input.sessionId);
  return { ok: true, sessionId: input.sessionId, autoregulation };
}

export async function completeWorkoutAction(
  sessionId: string,
): Promise<WorkoutActionResult> {
  const session = await requireSession();
  const result = await completeWorkoutSession(session.user.id, sessionId);
  if (!result.ok) return result;

  // Propose adaptations — never auto-apply. Failures do not block completion.
  await proposeAdaptationsForAthlete({
    userId: session.user.id,
    trainingSessionId: sessionId,
  }).catch(() => undefined);

  revalidateWorkoutPaths(sessionId);
  revalidatePath("/app/adaptations");
  revalidatePath("/app/programs");
  return { ok: true, sessionId };
}

export async function updateWorkoutNotesAction(input: {
  sessionId: string;
  notes: string;
}): Promise<WorkoutActionResult> {
  const session = await requireSession();
  const result = await updateSessionNotes({
    userId: session.user.id,
    sessionId: input.sessionId,
    notes: input.notes,
  });
  if (!result.ok) return result;
  revalidateWorkoutPaths(input.sessionId);
  return { ok: true, sessionId: input.sessionId };
}
