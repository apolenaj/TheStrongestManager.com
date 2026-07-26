import { prisma } from "@/lib/db";
import { featureFlags } from "@/config/feature-flags";
import {
  buildLiveAutoregSnapshot,
  evaluateLiveAutoregulation,
  mayAutoApplyAutoregulation,
  type LiveAutoregSuggestion,
  type LiveAutoregSnapshot,
} from "@/domain/live-session-autoregulation";

export type AutoregulationOffer = {
  suggestion: LiveAutoregSuggestion;
  nextSessionSetId: string | null;
  completedSessionSetId: string;
};

export type AutoregulationApplyResult =
  | {
      ok: true;
      nextSessionSetId: string;
      appliedLoadKg: number;
    }
  | { ok: false; error: string };

/**
 * After a set is logged complete, evaluate whether to suggest reducing the next set.
 * Never applies changes — suggestion always requires confirmation.
 */
export async function getAutoregulationOfferAfterSet(input: {
  sessionSetId: string;
  userId: string;
}): Promise<AutoregulationOffer | null> {
  if (!featureFlags.liveSessionAutoregulation) return null;
  if (mayAutoApplyAutoregulation()) return null;

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: { id: true },
  });
  if (!profile) return null;

  const row = await prisma.sessionSet.findFirst({
    where: {
      id: input.sessionSetId,
      sessionExercise: {
        trainingSession: { athleteProfileId: profile.id },
      },
    },
    select: {
      id: true,
      setNumber: true,
      prescribedLoadKg: true,
      prescribedReps: true,
      prescribedRpe: true,
      performedLoadKg: true,
      performedReps: true,
      performedRpe: true,
      completedAt: true,
      sessionExerciseId: true,
    },
  });
  if (!row || !row.completedAt) return null;

  const next = await prisma.sessionSet.findFirst({
    where: {
      sessionExerciseId: row.sessionExerciseId,
      setNumber: { gt: row.setNumber },
      completedAt: null,
    },
    orderBy: { setNumber: "asc" },
    select: { id: true, prescribedLoadKg: true },
  });

  const evaluation = evaluateLiveAutoregulation({
    completed: {
      plannedLoadKg: row.prescribedLoadKg,
      plannedReps: row.prescribedReps,
      plannedRpe: row.prescribedRpe,
      actualLoadKg: row.performedLoadKg,
      actualReps: row.performedReps,
      actualRpe: row.performedRpe,
    },
    nextSetLoadKg: next?.prescribedLoadKg ?? row.performedLoadKg,
  });
  if (!evaluation.ok) return null;

  return {
    suggestion: evaluation.suggestion,
    nextSessionSetId: next?.id ?? null,
    completedSessionSetId: row.id,
  };
}

/**
 * Apply a confirmed reduce-next-set suggestion.
 * Refuses without explicit confirmation — never auto-applies.
 */
export async function applyAutoregulationSuggestion(input: {
  userId: string;
  nextSessionSetId: string;
  proposedLoadKg: number;
  confirmed: boolean;
}): Promise<AutoregulationApplyResult> {
  if (!featureFlags.liveSessionAutoregulation) {
    return { ok: false, error: "Live session autoregulation is not enabled." };
  }
  if (!input.confirmed) {
    return {
      ok: false,
      error: "Confirmation required — suggestions are never applied automatically.",
    };
  }
  if (mayAutoApplyAutoregulation()) {
    return { ok: false, error: "Auto-apply is forbidden." };
  }
  if (!Number.isFinite(input.proposedLoadKg) || input.proposedLoadKg <= 0) {
    return { ok: false, error: "Invalid proposed load." };
  }

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: { id: true },
  });
  if (!profile) return { ok: false, error: "Athlete profile not found." };

  const next = await prisma.sessionSet.findFirst({
    where: {
      id: input.nextSessionSetId,
      completedAt: null,
      sessionExercise: {
        trainingSession: {
          athleteProfileId: profile.id,
          status: "in_progress",
        },
      },
    },
    select: { id: true, notes: true },
  });
  if (!next) {
    return { ok: false, error: "Next set not found or already completed." };
  }

  const noteLine = `Autoreg: load reduced to ${input.proposedLoadKg} kg after athlete confirmation.`;
  const notes = next.notes?.trim()
    ? `${next.notes.trim()}\n${noteLine}`
    : noteLine;

  await prisma.sessionSet.update({
    where: { id: next.id },
    data: {
      prescribedLoadKg: input.proposedLoadKg,
      notes,
    },
  });

  return {
    ok: true,
    nextSessionSetId: next.id,
    appliedLoadKg: input.proposedLoadKg,
  };
}

export function getLiveAutoregAdminSnapshot(): LiveAutoregSnapshot {
  return buildLiveAutoregSnapshot();
}
