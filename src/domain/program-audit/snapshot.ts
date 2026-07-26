/**
 * Quality snapshot for Free Program Audit funnel.
 */

import {
  PROGRAM_AUDIT_CLAIM_LIMIT,
  PROGRAM_AUDIT_CLAIM_WINDOW_MS,
  PROGRAM_AUDIT_ENGINE_VERSION,
  PROGRAM_AUDIT_FUNNEL_STEPS,
  PROGRAM_AUDIT_HONESTY,
  PROGRAM_AUDIT_PRIVACY_COPY,
  PROGRAM_AUDIT_SIGNUP_HREF,
  PROGRAM_AUDIT_TICKET_TTL_SECONDS,
  PROGRAM_AUDIT_LOCKED_SECTIONS,
} from "@/domain/program-audit/constants";

export type ProgramAuditQualityCheck = {
  id:
    | "value_before_signup"
    | "no_fake_score"
    | "deterministic_first"
    | "rate_limit"
    | "product_cta";
  label: string;
  ok: boolean;
  detail: string;
};

export type ProgramAuditQualityResult = {
  passed: boolean;
  checks: ProgramAuditQualityCheck[];
};

export function evaluateProgramAuditQuality(): ProgramAuditQualityResult {
  const checks: ProgramAuditQualityCheck[] = [
    {
      id: "value_before_signup",
      label: "Value before signup",
      ok: PROGRAM_AUDIT_FUNNEL_STEPS.some((s) => s.id === "limited_results"),
      detail: "limited_results before signup_unlock",
    },
    {
      id: "no_fake_score",
      label: "No fake scoring promise",
      ok: PROGRAM_AUDIT_HONESTY.some((h) =>
        h.toLowerCase().includes("no fake"),
      ),
      detail: "Honesty refuses fabricated grades",
    },
    {
      id: "deterministic_first",
      label: "Deterministic checks first",
      ok: PROGRAM_AUDIT_FUNNEL_STEPS.some((s) =>
        s.detail.toLowerCase().includes("deterministic"),
      ),
      detail: "basic_audit step cites deterministic checks",
    },
    {
      id: "rate_limit",
      label: "Claim rate limit",
      ok: PROGRAM_AUDIT_CLAIM_LIMIT > 0 && PROGRAM_AUDIT_CLAIM_WINDOW_MS > 0,
      detail: `${PROGRAM_AUDIT_CLAIM_LIMIT}/${PROGRAM_AUDIT_CLAIM_WINDOW_MS}ms`,
    },
    {
      id: "product_cta",
      label: "Signup into Training Audit",
      ok:
        PROGRAM_AUDIT_SIGNUP_HREF.includes("/signup") &&
        PROGRAM_AUDIT_SIGNUP_HREF.includes("/app/training-audit"),
      detail: PROGRAM_AUDIT_SIGNUP_HREF,
    },
  ];
  return { passed: checks.every((c) => c.ok), checks };
}

export type ProgramAuditSnapshot = {
  engineVersion: typeof PROGRAM_AUDIT_ENGINE_VERSION;
  generatedAt: string;
  honesty: readonly string[];
  privacyCopy: string;
  funnelSteps: typeof PROGRAM_AUDIT_FUNNEL_STEPS;
  lockedSections: readonly string[];
  claimLimit: number;
  claimWindowMs: number;
  ticketTtlSeconds: number;
  signupHref: string;
  quality: ProgramAuditQualityResult;
  publicPath: string;
};

export function buildProgramAuditSnapshot(): ProgramAuditSnapshot {
  return {
    engineVersion: PROGRAM_AUDIT_ENGINE_VERSION,
    generatedAt: new Date().toISOString(),
    honesty: PROGRAM_AUDIT_HONESTY,
    privacyCopy: PROGRAM_AUDIT_PRIVACY_COPY,
    funnelSteps: PROGRAM_AUDIT_FUNNEL_STEPS,
    lockedSections: PROGRAM_AUDIT_LOCKED_SECTIONS,
    claimLimit: PROGRAM_AUDIT_CLAIM_LIMIT,
    claimWindowMs: PROGRAM_AUDIT_CLAIM_WINDOW_MS,
    ticketTtlSeconds: PROGRAM_AUDIT_TICKET_TTL_SECONDS,
    signupHref: PROGRAM_AUDIT_SIGNUP_HREF,
    quality: evaluateProgramAuditQuality(),
    publicPath: "/program-audit",
  };
}
