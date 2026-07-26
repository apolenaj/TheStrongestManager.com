/**
 * Resolve org entitlements from OrgSubscription + catalog.
 */

import {
  getOrgPlanById,
  normalizeOrgPlanId,
  type OrgLimitValue,
  type OrgPlanId,
  type OrgPlanLimits,
} from "@/domain/org-billing/catalog";

export type OrgSeatUsage = {
  coachesUsed: number;
  athletesUsed: number;
};

export type ResolvedOrgEntitlements = {
  planId: OrgPlanId;
  planName: string;
  limits: OrgPlanLimits;
  accessActive: boolean;
  /** Effective seat caps (subscription overrides when set). */
  maxCoaches: OrgLimitValue;
  maxAthletes: OrgLimitValue;
};

const ACTIVE_STATUSES = new Set(["active", "trialing"]);

export function resolveOrgEntitlements(input: {
  plan: string | null | undefined;
  status: string | null | undefined;
  /** Optional sold seat overrides on OrgSubscription. */
  coachSeatLimitOverride?: number | null;
  athleteSeatLimitOverride?: number | null;
}): ResolvedOrgEntitlements {
  const planId = normalizeOrgPlanId(input.plan);
  const plan = getOrgPlanById(planId) ?? getOrgPlanById("org_free")!;
  const status = input.status ?? "active";
  const accessActive =
    planId === "org_free" ? true : ACTIVE_STATUSES.has(status);

  const limits: OrgPlanLimits = accessActive
    ? plan.limits
    : getOrgPlanById("org_free")!.limits;

  const maxCoaches =
    input.coachSeatLimitOverride != null && input.coachSeatLimitOverride >= 0
      ? input.coachSeatLimitOverride
      : limits.maxCoaches;
  const maxAthletes =
    input.athleteSeatLimitOverride != null &&
    input.athleteSeatLimitOverride >= 0
      ? input.athleteSeatLimitOverride
      : limits.maxAthletes;

  return {
    planId: accessActive ? planId : "org_free",
    planName: accessActive ? plan.name : "Org Free",
    limits: accessActive ? limits : getOrgPlanById("org_free")!.limits,
    accessActive,
    maxCoaches,
    maxAthletes,
  };
}

export function seatAvailable(
  limit: OrgLimitValue,
  used: number,
): boolean {
  if (limit === "unlimited") return true;
  return used < limit;
}

export function canAddCoachSeat(
  entitlements: ResolvedOrgEntitlements,
  usage: OrgSeatUsage,
): boolean {
  return seatAvailable(entitlements.maxCoaches, usage.coachesUsed);
}

export function canAddAthleteSeat(
  entitlements: ResolvedOrgEntitlements,
  usage: OrgSeatUsage,
): boolean {
  return seatAvailable(entitlements.maxAthletes, usage.athletesUsed);
}

export function usageWithinLimit(
  limit: OrgLimitValue,
  used: number,
): boolean {
  if (limit === "unlimited") return true;
  return used <= limit;
}

export type SeatCheckResult =
  | { ok: true }
  | { ok: false; reason: string; limit: OrgLimitValue; used: number };

export function assertCoachSeat(
  entitlements: ResolvedOrgEntitlements,
  usage: OrgSeatUsage,
): SeatCheckResult {
  if (canAddCoachSeat(entitlements, usage)) return { ok: true };
  return {
    ok: false,
    reason: "Coach seat limit reached for this organization plan.",
    limit: entitlements.maxCoaches,
    used: usage.coachesUsed,
  };
}

export function assertAthleteSeat(
  entitlements: ResolvedOrgEntitlements,
  usage: OrgSeatUsage,
): SeatCheckResult {
  if (canAddAthleteSeat(entitlements, usage)) return { ok: true };
  return {
    ok: false,
    reason: "Athlete seat limit reached for this organization plan.",
    limit: entitlements.maxAthletes,
    used: usage.athletesUsed,
  };
}
