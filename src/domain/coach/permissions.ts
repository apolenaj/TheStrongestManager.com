/**
 * Coach platform permissions & scopes (Prompt 35).
 * Coach sees only athletes with an active grant. Health data is opt-in scope.
 */

export const COACH_ACCESS_STATUSES = [
  "pending",
  "active",
  "revoked",
  "declined",
  "expired",
] as const;
export type CoachAccessStatus = (typeof COACH_ACCESS_STATUSES)[number];

/**
 * Data scopes an athlete may grant.
 * Defaults exclude recovery, body-comp, and technique media.
 */
export const COACH_SCOPES = [
  "training",
  "programs",
  "technique_summary",
  "technique_media",
  "recovery",
  "body_metrics_detailed",
] as const;
export type CoachScope = (typeof COACH_SCOPES)[number];

export const COACH_SCOPE_LABELS: Record<CoachScope, string> = {
  training: "Training sessions & adherence",
  programs: "Programs & upcoming sessions",
  technique_summary: "Technique score trends (no video)",
  technique_media: "Technique video / media",
  recovery: "Recovery check-ins (sensitive)",
  body_metrics_detailed: "Detailed body metrics (sensitive)",
};

/** Safe default when scopesJson is empty or omitted. */
export const DEFAULT_COACH_SCOPES: readonly CoachScope[] = [
  "training",
  "programs",
  "technique_summary",
] as const;

/** Never included in defaults — must be explicitly granted. */
export const SENSITIVE_COACH_SCOPES: readonly CoachScope[] = [
  "recovery",
  "body_metrics_detailed",
  "technique_media",
] as const;

export const COACH_PLATFORM_HONESTY = [
  "Coaches only see athletes who explicitly grant access. Athletes can revoke at any time.",
  "Recovery check-ins, detailed body metrics, and technique media stay hidden unless the athlete grants those scopes.",
  "Coach Mode does not diagnose injuries or expose health data by accident.",
] as const;

export function parseCoachScopes(raw: string | null | undefined): CoachScope[] {
  if (!raw || raw.trim() === "" || raw === "[]") {
    return [...DEFAULT_COACH_SCOPES];
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [...DEFAULT_COACH_SCOPES];
    const allowed = new Set<string>(COACH_SCOPES);
    const scopes = parsed.filter(
      (s): s is CoachScope => typeof s === "string" && allowed.has(s),
    );
    return scopes.length > 0 ? scopes : [...DEFAULT_COACH_SCOPES];
  } catch {
    return [...DEFAULT_COACH_SCOPES];
  }
}

export function serializeCoachScopes(scopes: CoachScope[]): string {
  const unique = [...new Set(scopes)];
  return JSON.stringify(unique);
}

export function hasCoachScope(
  scopes: readonly CoachScope[],
  scope: CoachScope,
): boolean {
  return scopes.includes(scope);
}

export type UserRoles = {
  isAthlete: boolean;
  isCoach: boolean;
};

export function describeRoles(roles: UserRoles): string {
  if (roles.isAthlete && roles.isCoach) return "Athlete + Coach";
  if (roles.isCoach) return "Coach";
  return "Athlete";
}
