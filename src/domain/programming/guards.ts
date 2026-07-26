import {
  PROGRAM_EDITABLE_STATUSES,
  SESSION_PRESCRIPTION_LOCKED_STATUSES,
  type ProgramKind,
  type ProgramStatus,
  type SessionStatus,
} from "@/domain/programming/constants";

export function isProgramEditable(status: string): boolean {
  return (PROGRAM_EDITABLE_STATUSES as readonly string[]).includes(status);
}

export function isSessionPrescriptionLocked(session: {
  status: string;
  prescriptionLockedAt: Date | null;
}): boolean {
  if (session.prescriptionLockedAt) return true;
  return (SESSION_PRESCRIPTION_LOCKED_STATUSES as readonly string[]).includes(
    session.status,
  );
}

export function assertProgramKind(kind: string): ProgramKind {
  if (kind === "template" || kind === "athlete") return kind;
  throw new Error(`Invalid program kind: ${kind}`);
}

export function assertProgramStatus(status: string): ProgramStatus {
  if (
    status === "draft" ||
    status === "active" ||
    status === "completed" ||
    status === "archived"
  ) {
    return status;
  }
  throw new Error(`Invalid program status: ${status}`);
}

export function assertSessionStatus(status: string): SessionStatus {
  if (
    status === "planned" ||
    status === "in_progress" ||
    status === "completed" ||
    status === "skipped"
  ) {
    return status;
  }
  throw new Error(`Invalid session status: ${status}`);
}

/**
 * Templates are library rows (no athlete owner required).
 * Athlete programs must be owned by a profile.
 */
export function validateProgramOwnership(input: {
  kind: ProgramKind;
  athleteProfileId: string | null;
}): { ok: true } | { ok: false; error: string } {
  if (input.kind === "template" && input.athleteProfileId) {
    // Allowed but unusual — treat as coach-owned template library later.
  }
  if (input.kind === "athlete" && !input.athleteProfileId) {
    return {
      ok: false,
      error: "Athlete programs require an athleteProfileId.",
    };
  }
  return { ok: true };
}
