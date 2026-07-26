/**
 * Org permission checks — pure, no DB.
 */

import {
  DEFAULT_ORG_ROLE_CAPABILITIES,
  ORG_CAPABILITIES,
  ORG_FORBIDDEN_PRIVATE_CLASSES,
  type OrgCapability,
  type OrgMemberRole,
} from "@/domain/org/constants";

export type OrgPrincipal = {
  role: OrgMemberRole;
  status: "invited" | "active" | "revoked";
  /** Extra capabilities from OrgPermission rows. */
  extraCapabilities?: readonly OrgCapability[];
};

export function capabilitiesForPrincipal(
  principal: OrgPrincipal,
): OrgCapability[] {
  if (principal.status !== "active") return [];
  const base = DEFAULT_ORG_ROLE_CAPABILITIES[principal.role] ?? [];
  const extra = principal.extraCapabilities ?? [];
  return [...new Set([...base, ...extra])];
}

export function hasOrgCapability(
  principal: OrgPrincipal,
  capability: OrgCapability,
): boolean {
  return capabilitiesForPrincipal(principal).includes(capability);
}

export function canViewOrgAggregates(principal: OrgPrincipal): boolean {
  return hasOrgCapability(principal, "view_aggregates");
}

export function canManageOrgMembers(principal: OrgPrincipal): boolean {
  return hasOrgCapability(principal, "manage_members");
}

export function canManageOrgTeams(principal: OrgPrincipal): boolean {
  return hasOrgCapability(principal, "manage_teams");
}

export function canViewOrgBilling(principal: OrgPrincipal): boolean {
  return hasOrgCapability(principal, "billing_view");
}

export function canManageOrgBilling(principal: OrgPrincipal): boolean {
  return hasOrgCapability(principal, "billing_manage");
}

/**
 * Org role never unlocks individual private athlete detail.
 * Coach workspace requires CoachAthleteAccess separately.
 */
export function orgRoleUnlocksPrivateAthleteData(
  _principal: OrgPrincipal,
): boolean {
  return false;
}

export function isForbiddenOrgPrivateClass(value: string): boolean {
  return (ORG_FORBIDDEN_PRIVATE_CLASSES as readonly string[]).includes(value);
}

/**
 * Parse OrgPermission.permissionsJson — unknown keys dropped.
 */
export function parseOrgCapabilities(
  raw: string | null | undefined,
): OrgCapability[] {
  if (!raw || raw.trim() === "" || raw === "[]") return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const allowed = new Set<string>(ORG_CAPABILITIES);
    return parsed.filter(
      (s): s is OrgCapability => typeof s === "string" && allowed.has(s),
    );
  } catch {
    return [];
  }
}

export function serializeOrgCapabilities(
  capabilities: readonly OrgCapability[],
): string {
  return JSON.stringify([...new Set(capabilities)]);
}

/**
 * Athlete may appear in org aggregates only with active membership + opt-in.
 */
export function athleteIncludedInOrgAggregates(input: {
  membershipStatus: string;
  aggregateOptIn: boolean;
}): boolean {
  return input.membershipStatus === "active" && input.aggregateOptIn === true;
}
