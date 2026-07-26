/**
 * Gym / team organization architecture (Prompt 87).
 * Org roles never bypass CoachAthleteAccess for private athlete data.
 */

export const ORG_ENGINE_VERSION = "org_gym_team.v1" as const;

export const ORG_KINDS = [
  "gym",
  "team",
  "club",
  "facility",
  "other",
] as const;
export type OrgKind = (typeof ORG_KINDS)[number];

export const ORG_KIND_LABELS: Record<OrgKind, string> = {
  gym: "Gym",
  team: "Team",
  club: "Club",
  facility: "Facility",
  other: "Organization",
};

export const ORG_MEMBER_ROLES = [
  "org_admin",
  "org_coach",
  "org_athlete",
  "org_staff",
] as const;
export type OrgMemberRole = (typeof ORG_MEMBER_ROLES)[number];

export const ORG_MEMBER_ROLE_LABELS: Record<OrgMemberRole, string> = {
  org_admin: "Organization admin",
  org_coach: "Organization coach",
  org_athlete: "Athlete member",
  org_staff: "Staff",
};

export const ORG_MEMBER_STATUSES = [
  "invited",
  "active",
  "revoked",
] as const;
export type OrgMemberStatus = (typeof ORG_MEMBER_STATUSES)[number];

export const TEAM_MEMBER_ROLES = [
  "team_coach",
  "team_athlete",
  "team_lead",
] as const;
export type TeamMemberRole = (typeof TEAM_MEMBER_ROLES)[number];

/** Org capability permissions — never athlete health scopes. */
export const ORG_CAPABILITIES = [
  "manage_members",
  "manage_teams",
  "view_aggregates",
  "invite",
  "billing_view",
  "billing_manage",
] as const;
export type OrgCapability = (typeof ORG_CAPABILITIES)[number];

export const ORG_CAPABILITY_LABELS: Record<OrgCapability, string> = {
  manage_members: "Manage members",
  manage_teams: "Manage teams",
  view_aggregates: "View aggregate analytics",
  invite: "Invite members",
  billing_view: "View billing",
  billing_manage: "Manage billing / upgrades",
};

/** Default capabilities by role (org admin gets all except billing unless added). */
export const DEFAULT_ORG_ROLE_CAPABILITIES: Record<
  OrgMemberRole,
  readonly OrgCapability[]
> = {
  org_admin: [
    "manage_members",
    "manage_teams",
    "view_aggregates",
    "invite",
    "billing_view",
    "billing_manage",
  ],
  org_coach: ["view_aggregates", "invite", "manage_teams"],
  org_athlete: [],
  org_staff: ["view_aggregates"],
};

/**
 * Fields / data classes that must NEVER appear on org dashboards
 * via org role alone — require CoachAthleteAccess + scopes.
 */
export const ORG_FORBIDDEN_PRIVATE_CLASSES = [
  "recovery_entries",
  "body_metrics",
  "technique_media",
  "coach_notes",
  "session_notes",
  "sex",
  "birth_year",
  "movement_notes",
  "pain_caution",
] as const;

export const ORG_GYM_HONESTY = [
  "Organization admins see aggregate training analytics only for athletes who opted in — never a bypass of private health data.",
  "Recovery, body metrics, technique media, and coach notes stay off the org dashboard. Open those only with an athlete’s coach grant.",
  "Org membership is separate from Coach Mode: being an org coach does not grant 1:1 athlete workspace access.",
] as const;

export function isOrgMemberRole(value: string): value is OrgMemberRole {
  return (ORG_MEMBER_ROLES as readonly string[]).includes(value);
}

export function isOrgCapability(value: string): value is OrgCapability {
  return (ORG_CAPABILITIES as readonly string[]).includes(value);
}

export function isOrgKind(value: string): value is OrgKind {
  return (ORG_KINDS as readonly string[]).includes(value);
}
