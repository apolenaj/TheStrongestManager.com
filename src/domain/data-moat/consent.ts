/**
 * Consent gates + anonymization / retention pure rules (Prompt 91).
 */

import {
  DATA_MOAT_FORBIDDEN_OUTPUT_KEYS,
  DATA_MOAT_MIN_COHORT_SIZE,
  DATA_MOAT_POLICY_VERSION,
  DEFAULT_DATA_MOAT_CONSENT_SCOPES,
  emptyConsentScopes,
  isDataMoatConsentScope,
  type DataMoatConsentScope,
  type DataMoatConsentScopes,
  type DataMoatInsightKind,
} from "@/domain/data-moat/constants";

export type DataMoatConsentRecord = {
  optedIn: boolean;
  scopes: DataMoatConsentScopes;
  policyVersion: string;
  consentedAt: Date | null;
  revokedAt: Date | null;
};

/** Which consent scopes each insight kind requires (all must be true). */
export const INSIGHT_REQUIRED_SCOPES: Record<
  DataMoatInsightKind,
  readonly DataMoatConsentScope[]
> = {
  technique_patterns: ["technique_aggregates"],
  training_outcomes: ["training_aggregates"],
  exercise_response: ["training_aggregates", "strength_aggregates"],
  programming_trends: ["training_aggregates"],
};

/**
 * Athlete may contribute to an insight kind only with optedIn + scopes + policy.
 */
export function athleteEligibleForInsight(input: {
  consent: DataMoatConsentRecord | null;
  insightKind: DataMoatInsightKind;
  requiredPolicyVersion?: string;
  /**
   * For technique_patterns: when provided, each contributing video must have
   * explicit model-improvement opt-in (Prompt 178). Omitted = profile-only gate
   * (legacy callers); aggregation jobs should pass per-video eligibility.
   */
  videoModelImprovementOptIn?: boolean;
}): boolean {
  const consent = input.consent;
  if (!consent || !consent.optedIn) return false;
  if (consent.revokedAt != null) return false;
  const requiredPolicy =
    input.requiredPolicyVersion ?? DATA_MOAT_POLICY_VERSION;
  if (consent.policyVersion !== requiredPolicy) return false;

  const needed = INSIGHT_REQUIRED_SCOPES[input.insightKind];
  if (!needed.every((scope) => consent.scopes[scope] === true)) return false;

  if (
    input.insightKind === "technique_patterns" &&
    input.videoModelImprovementOptIn !== undefined
  ) {
    return input.videoModelImprovementOptIn === true;
  }

  return true;
}

export function parseConsentScopesJson(
  raw: string | null | undefined,
): DataMoatConsentScopes {
  const base = emptyConsentScopes();
  if (!raw || raw.trim() === "" || raw === "{}") return base;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return base;
    const o = parsed as Record<string, unknown>;
    for (const key of Object.keys(DEFAULT_DATA_MOAT_CONSENT_SCOPES)) {
      if (
        isDataMoatConsentScope(key) &&
        typeof o[key] === "boolean"
      ) {
        base[key] = o[key];
      }
    }
    return base;
  } catch {
    return base;
  }
}

export function serializeConsentScopes(
  scopes: DataMoatConsentScopes,
): string {
  return JSON.stringify(scopes);
}

/**
 * k-anonymity: publish only when cohort size meets the floor.
 */
export function cohortPublishable(
  cohortSize: number,
  minSize: number = DATA_MOAT_MIN_COHORT_SIZE,
): boolean {
  return cohortSize >= minSize;
}

/**
 * Reject bags that still contain forbidden identity/sensitive keys.
 */
export function sanitizeMoatOutputProps(
  props: Record<string, unknown>,
):
  | { ok: true; props: Record<string, unknown> }
  | { ok: false; rejectedKeys: string[] } {
  const forbidden = new Set(
    DATA_MOAT_FORBIDDEN_OUTPUT_KEYS.map((k) => k.toLowerCase()),
  );
  const rejectedKeys: string[] = [];
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (forbidden.has(key.toLowerCase())) {
      rejectedKeys.push(key);
      continue;
    }
    clean[key] = value;
  }
  if (rejectedKeys.length > 0) {
    return { ok: false, rejectedKeys };
  }
  return { ok: true, props: clean };
}

/** Allowed source categories for documentation / job filters — not PII. */
export const DATA_MOAT_SOURCE_CATEGORIES = [
  "training_session_counts",
  "session_set_loads_reps_rpe",
  "technique_overall_score",
  "technique_metric_key_value",
  "athlete_score_numeric",
  "progress_metric_numeric",
  "program_structure_counts",
] as const;
export type DataMoatSourceCategory =
  (typeof DATA_MOAT_SOURCE_CATEGORIES)[number];

export type AnonymizedCohortStat = {
  insightKind: DataMoatInsightKind;
  /** Bucket labels only e.g. exerciseSlug, week, experienceBand — never user ids. */
  cohortKey: string;
  cohortSize: number;
  /** Statistical summary — means, percentiles, rates. */
  stats: Record<string, number>;
  suppressed: boolean;
};

/**
 * Build a publishable cohort row or mark suppressed when below k.
 */
export function toAnonymizedCohortStat(input: {
  insightKind: DataMoatInsightKind;
  cohortKey: string;
  cohortSize: number;
  stats: Record<string, number>;
}): AnonymizedCohortStat {
  const publishable = cohortPublishable(input.cohortSize);
  const sanitized = sanitizeMoatOutputProps(input.stats);
  const stats =
    sanitized.ok && publishable ? (sanitized.props as Record<string, number>) : {};
  return {
    insightKind: input.insightKind,
    cohortKey: input.cohortKey,
    cohortSize: publishable ? input.cohortSize : 0,
    stats,
    suppressed: !publishable,
  };
}
