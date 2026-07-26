/**
 * Free Program Audit service (Prompt 170).
 */

import { featureFlags } from "@/config/feature-flags";
import {
  buildProgramAuditSnapshot,
  runFreeProgramAudit,
  type LimitedProgramAuditResult,
  type ProgramAuditRunFailure,
  type ProgramAuditSnapshot,
} from "@/domain/program-audit";
import {
  createProgramAuditTicket,
  verifyProgramAuditTicket,
} from "@/services/program-audit/ticket";

export function getProgramAuditSnapshot(): ProgramAuditSnapshot {
  return buildProgramAuditSnapshot();
}

export function isProgramAuditEnabled(): boolean {
  return featureFlags.programAudit;
}

export function claimProgramAuditTicket() {
  return createProgramAuditTicket();
}

export function validateProgramAuditTicket(token: string) {
  return verifyProgramAuditTicket(token);
}

export function auditPastedProgram(
  paste: string,
): LimitedProgramAuditResult | ProgramAuditRunFailure {
  return runFreeProgramAudit(paste);
}

export {
  createProgramAuditTicket,
  verifyProgramAuditTicket,
} from "@/services/program-audit/ticket";
