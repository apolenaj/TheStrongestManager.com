export {
  PROGRAM_AUDIT_ENGINE_VERSION,
  PROGRAM_AUDIT_HONESTY,
  PROGRAM_AUDIT_PRIVACY_COPY,
  PROGRAM_AUDIT_CLAIM_LIMIT,
  PROGRAM_AUDIT_CLAIM_WINDOW_MS,
  PROGRAM_AUDIT_TICKET_TTL_SECONDS,
  PROGRAM_AUDIT_MAX_FREE_FINDINGS,
  PROGRAM_AUDIT_MAX_PASTE_CHARS,
  PROGRAM_AUDIT_FUNNEL_STEPS,
  PROGRAM_AUDIT_LOCKED_SECTIONS,
  PROGRAM_AUDIT_SIGNUP_HREF,
  PROGRAM_AUDIT_EXAMPLE_PASTE,
} from "@/domain/program-audit/constants";

export {
  findProgramAuditExtraIssues,
  toAuditShapedFinding,
} from "@/domain/program-audit/deterministic";

export {
  runFreeProgramAudit,
  type LimitedProgramAuditFinding,
  type LimitedProgramAuditResult,
  type ProgramAuditRunFailure,
} from "@/domain/program-audit/run";

export {
  isProgramAuditTicketPayload,
  type ProgramAuditTicketPayload,
} from "@/domain/program-audit/ticket";

export {
  buildProgramAuditSnapshot,
  evaluateProgramAuditQuality,
  type ProgramAuditSnapshot,
  type ProgramAuditQualityResult,
} from "@/domain/program-audit/snapshot";
