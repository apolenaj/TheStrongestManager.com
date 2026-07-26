import {
  ATHLETE_ASSESSMENT_CLAIM_LIMIT,
  ATHLETE_ASSESSMENT_CLAIM_WINDOW_MS,
  ATHLETE_ASSESSMENT_ENGINE_VERSION,
  ATHLETE_ASSESSMENT_FUNNEL_STEPS,
  ATHLETE_ASSESSMENT_HONESTY,
  ATHLETE_ASSESSMENT_LOCKED_SECTIONS,
  ATHLETE_ASSESSMENT_NOT_FULL_LABEL,
  ATHLETE_ASSESSMENT_PRIVACY_COPY,
  ATHLETE_ASSESSMENT_SELF_LABEL,
  ATHLETE_ASSESSMENT_SIGNUP_HREF,
  ATHLETE_ASSESSMENT_TICKET_TTL_SECONDS,
} from "@/domain/athlete-assessment/constants";

export type AthleteAssessmentQualityCheck = {
  id:
    | "value_before_signup"
    | "self_assessment_label"
    | "not_full_score_label"
    | "no_real_score_engine"
    | "rate_limit"
    | "product_cta";
  label: string;
  ok: boolean;
  detail: string;
};

export type AthleteAssessmentQualityResult = {
  passed: boolean;
  checks: AthleteAssessmentQualityCheck[];
};

export function evaluateAthleteAssessmentQuality(): AthleteAssessmentQualityResult {
  const honesty = ATHLETE_ASSESSMENT_HONESTY.join(" ").toLowerCase();
  const checks: AthleteAssessmentQualityCheck[] = [
    {
      id: "value_before_signup",
      label: "Partial profile before signup",
      ok: ATHLETE_ASSESSMENT_FUNNEL_STEPS.some((s) => s.id === "partial_profile"),
      detail: "partial_profile before signup_cta",
    },
    {
      id: "self_assessment_label",
      label: "Self-assessment estimate label",
      ok: ATHLETE_ASSESSMENT_SELF_LABEL === "Self-assessment estimate",
      detail: ATHLETE_ASSESSMENT_SELF_LABEL,
    },
    {
      id: "not_full_score_label",
      label: "Not full Athlete Score label",
      ok: ATHLETE_ASSESSMENT_NOT_FULL_LABEL === "Not full Athlete Score",
      detail: ATHLETE_ASSESSMENT_NOT_FULL_LABEL,
    },
    {
      id: "no_real_score_engine",
      label: "Refuse questionnaire → real score",
      ok:
        honesty.includes("never compute the real athlete score") ||
        honesty.includes("not full athlete score"),
      detail: "Honesty forbids computeAthleteScores from answers",
    },
    {
      id: "rate_limit",
      label: "Claim rate limit",
      ok:
        ATHLETE_ASSESSMENT_CLAIM_LIMIT > 0 &&
        ATHLETE_ASSESSMENT_CLAIM_WINDOW_MS > 0,
      detail: `${ATHLETE_ASSESSMENT_CLAIM_LIMIT}/${ATHLETE_ASSESSMENT_CLAIM_WINDOW_MS}ms`,
    },
    {
      id: "product_cta",
      label: "Signup for data-driven score",
      ok:
        ATHLETE_ASSESSMENT_SIGNUP_HREF.includes("/signup") &&
        ATHLETE_ASSESSMENT_SIGNUP_HREF.includes("/app/dashboard"),
      detail: ATHLETE_ASSESSMENT_SIGNUP_HREF,
    },
  ];
  return { passed: checks.every((c) => c.ok), checks };
}

export type AthleteAssessmentSnapshot = {
  engineVersion: typeof ATHLETE_ASSESSMENT_ENGINE_VERSION;
  generatedAt: string;
  honesty: readonly string[];
  privacyCopy: string;
  selfLabel: typeof ATHLETE_ASSESSMENT_SELF_LABEL;
  notFullLabel: typeof ATHLETE_ASSESSMENT_NOT_FULL_LABEL;
  funnelSteps: typeof ATHLETE_ASSESSMENT_FUNNEL_STEPS;
  lockedSections: readonly string[];
  claimLimit: number;
  claimWindowMs: number;
  ticketTtlSeconds: number;
  signupHref: string;
  quality: AthleteAssessmentQualityResult;
  publicPath: string;
};

export function buildAthleteAssessmentSnapshot(): AthleteAssessmentSnapshot {
  return {
    engineVersion: ATHLETE_ASSESSMENT_ENGINE_VERSION,
    generatedAt: new Date().toISOString(),
    honesty: ATHLETE_ASSESSMENT_HONESTY,
    privacyCopy: ATHLETE_ASSESSMENT_PRIVACY_COPY,
    selfLabel: ATHLETE_ASSESSMENT_SELF_LABEL,
    notFullLabel: ATHLETE_ASSESSMENT_NOT_FULL_LABEL,
    funnelSteps: ATHLETE_ASSESSMENT_FUNNEL_STEPS,
    lockedSections: ATHLETE_ASSESSMENT_LOCKED_SECTIONS,
    claimLimit: ATHLETE_ASSESSMENT_CLAIM_LIMIT,
    claimWindowMs: ATHLETE_ASSESSMENT_CLAIM_WINDOW_MS,
    ticketTtlSeconds: ATHLETE_ASSESSMENT_TICKET_TTL_SECONDS,
    signupHref: ATHLETE_ASSESSMENT_SIGNUP_HREF,
    quality: evaluateAthleteAssessmentQuality(),
    publicPath: "/athlete-assessment",
  };
}
