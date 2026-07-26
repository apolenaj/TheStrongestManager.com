/**
 * Quality / catalog snapshot for the free technique-check funnel.
 */

import {
  TECHNIQUE_CHECK_ENGINE_VERSION,
  TECHNIQUE_CHECK_FUNNEL_STEPS,
  TECHNIQUE_CHECK_HONESTY,
  TECHNIQUE_CHECK_PRIVACY_COPY,
  TECHNIQUE_CHECK_CLAIM_LIMIT,
  TECHNIQUE_CHECK_CLAIM_WINDOW_MS,
  TECHNIQUE_CHECK_TICKET_TTL_SECONDS,
  TECHNIQUE_CHECK_SUPPORTED_EXERCISES,
  TECHNIQUE_CHECK_LOCKED_SECTIONS,
  TECHNIQUE_CHECK_SIGNUP_HREF,
} from "@/domain/technique-check/constants";

export type TechniqueCheckQualityCheck = {
  id:
    | "value_before_signup"
    | "privacy_ephemeral"
    | "rate_limit"
    | "honesty_labels"
    | "product_cta";
  label: string;
  ok: boolean;
  detail: string;
};

export type TechniqueCheckQualityResult = {
  passed: boolean;
  checks: TechniqueCheckQualityCheck[];
};

export function evaluateTechniqueCheckQuality(): TechniqueCheckQualityResult {
  const checks: TechniqueCheckQualityCheck[] = [
    {
      id: "value_before_signup",
      label: "Value before signup",
      ok: TECHNIQUE_CHECK_FUNNEL_STEPS.some((s) => s.id === "limited_insight"),
      detail: "Limited insight step exists before signup_to_save",
    },
    {
      id: "privacy_ephemeral",
      label: "Guest video stays local",
      ok: TECHNIQUE_CHECK_PRIVACY_COPY.toLowerCase().includes("not uploaded"),
      detail: "Privacy copy states no guest upload",
    },
    {
      id: "rate_limit",
      label: "Claim rate limit configured",
      ok:
        TECHNIQUE_CHECK_CLAIM_LIMIT > 0 &&
        TECHNIQUE_CHECK_CLAIM_WINDOW_MS > 0 &&
        TECHNIQUE_CHECK_TICKET_TTL_SECONDS > 0,
      detail: `${TECHNIQUE_CHECK_CLAIM_LIMIT} / ${TECHNIQUE_CHECK_CLAIM_WINDOW_MS}ms`,
    },
    {
      id: "honesty_labels",
      label: "Honesty + labels",
      ok: TECHNIQUE_CHECK_HONESTY.length >= 3,
      detail: `${TECHNIQUE_CHECK_HONESTY.length} honesty lines`,
    },
    {
      id: "product_cta",
      label: "Signup CTA into technique product",
      ok: TECHNIQUE_CHECK_SIGNUP_HREF.includes("/signup") &&
        TECHNIQUE_CHECK_SIGNUP_HREF.includes("/app/technique"),
      detail: TECHNIQUE_CHECK_SIGNUP_HREF,
    },
  ];
  return { passed: checks.every((c) => c.ok), checks };
}

export type TechniqueCheckSnapshot = {
  engineVersion: typeof TECHNIQUE_CHECK_ENGINE_VERSION;
  generatedAt: string;
  honesty: readonly string[];
  privacyCopy: string;
  funnelSteps: typeof TECHNIQUE_CHECK_FUNNEL_STEPS;
  supportedExercises: readonly string[];
  lockedSections: readonly string[];
  claimLimit: number;
  claimWindowMs: number;
  ticketTtlSeconds: number;
  signupHref: string;
  quality: TechniqueCheckQualityResult;
  publicPath: string;
};

export function buildTechniqueCheckSnapshot(): TechniqueCheckSnapshot {
  return {
    engineVersion: TECHNIQUE_CHECK_ENGINE_VERSION,
    generatedAt: new Date().toISOString(),
    honesty: TECHNIQUE_CHECK_HONESTY,
    privacyCopy: TECHNIQUE_CHECK_PRIVACY_COPY,
    funnelSteps: TECHNIQUE_CHECK_FUNNEL_STEPS,
    supportedExercises: TECHNIQUE_CHECK_SUPPORTED_EXERCISES,
    lockedSections: TECHNIQUE_CHECK_LOCKED_SECTIONS,
    claimLimit: TECHNIQUE_CHECK_CLAIM_LIMIT,
    claimWindowMs: TECHNIQUE_CHECK_CLAIM_WINDOW_MS,
    ticketTtlSeconds: TECHNIQUE_CHECK_TICKET_TTL_SECONDS,
    signupHref: TECHNIQUE_CHECK_SIGNUP_HREF,
    quality: evaluateTechniqueCheckQuality(),
    publicPath: "/technique-check",
  };
}
