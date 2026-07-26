/**
 * Restore planning — protect completed training history.
 */

import { isSessionPrescriptionLocked } from "@/domain/programming/guards";
import { formatProgramVersionLabel } from "@/domain/program-version/labels";
import type {
  ProgramVersionRestorePlan,
  ProgramVersionSnapshot,
} from "@/domain/program-version/types";

export type SessionForRestoreGuard = {
  id: string;
  status: string;
  prescriptionLockedAt: Date | string | null;
  workoutId: string | null;
};

/**
 * Build a restore plan that lists protected sessions and mutable exercises.
 * Locked / completed sessions are never included in mutation targets.
 */
export function planProgramVersionRestore(input: {
  targetVersionNumber: number;
  snapshot: ProgramVersionSnapshot;
  sessions: SessionForRestoreGuard[];
  liveExerciseIds: string[];
}): ProgramVersionRestorePlan {
  const protectedSessions = input.sessions.filter((s) =>
    isSessionPrescriptionLocked({
      status: s.status,
      prescriptionLockedAt: s.prescriptionLockedAt
        ? new Date(s.prescriptionLockedAt)
        : null,
    }),
  );

  const live = new Set(input.liveExerciseIds);
  const mutableExerciseIds = input.snapshot.exercises
    .filter((ex) => live.has(ex.workoutExerciseId))
    .map((ex) => ex.workoutExerciseId);

  return {
    targetVersionNumber: input.targetVersionNumber,
    targetLabel: formatProgramVersionLabel(input.targetVersionNumber),
    mutableExerciseIds,
    protectedSessionIds: protectedSessions.map((s) => s.id),
    protectedSessionCount: protectedSessions.length,
  };
}

/**
 * Hard rule: restore mutation lists must not include protected session ids.
 */
export function restorePlanProtectsCompletedHistory(
  plan: ProgramVersionRestorePlan,
  mutationSessionIds: string[],
): boolean {
  const protectedSet = new Set(plan.protectedSessionIds);
  return mutationSessionIds.every((id) => !protectedSet.has(id));
}

export function parseProgramVersionSnapshot(
  raw: string,
):
  | { ok: true; snapshot: ProgramVersionSnapshot }
  | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(raw) as ProgramVersionSnapshot;
    if (!parsed?.program?.name || !Array.isArray(parsed.exercises)) {
      return { ok: false, error: "Invalid program version snapshot." };
    }
    return { ok: true, snapshot: parsed };
  } catch {
    return { ok: false, error: "Corrupt program version snapshot JSON." };
  }
}
