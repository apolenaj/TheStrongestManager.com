import {
  getPlanById,
  normalizePlanId,
  type PlanDefinition,
  type PlanId,
  type PlanLimits,
} from "@/domain/billing/catalog";
import { isWithinGracePeriod } from "@/domain/billing/billing-2";

export type EntitlementKey = keyof PlanLimits;

export type ResolvedEntitlements = {
  planId: PlanId;
  planName: string;
  limits: PlanLimits;
  /** True when subscription status allows paid entitlements. */
  accessActive: boolean;
  /** True when access is only because of past_due grace. */
  inGracePeriod: boolean;
};

const ACTIVE_STATUSES = new Set(["active", "trialing"]);

/**
 * Resolve entitlements from a stored plan + status (+ optional grace).
 * Never upgrades access based on marketing copy or frontend checkout alone.
 */
export function resolveEntitlements(input: {
  plan: string | null | undefined;
  status: string | null | undefined;
  graceEndsAt?: Date | string | null;
  now?: Date;
}): ResolvedEntitlements {
  const planId = normalizePlanId(input.plan);
  const plan = getPlanById(planId) ?? getPlanById("free")!;
  const status = input.status ?? "active";
  const inGrace = isWithinGracePeriod({
    status,
    graceEndsAt: input.graceEndsAt,
    now: input.now,
  });
  const accessActive =
    planId === "free"
      ? true
      : ACTIVE_STATUSES.has(status) || inGrace;

  const limits: PlanLimits = accessActive
    ? plan.limits
    : (getPlanById("free")!.limits);

  return {
    planId: accessActive ? planId : "free",
    planName: accessActive ? plan.name : "Free",
    limits,
    accessActive,
    inGracePeriod: inGrace && planId !== "free",
  };
}

export function hasEntitlement(
  entitlements: ResolvedEntitlements,
  key: EntitlementKey,
): boolean {
  const value = entitlements.limits[key];
  if (typeof value === "boolean") return value;
  if (value === "none") return false;
  if (value === "unlimited") return true;
  return value > 0;
}

export function listPublicPlans(): PlanDefinition[] {
  return [
    getPlanById("free")!,
    getPlanById("pro")!,
    getPlanById("performance")!,
    getPlanById("elite_coaching")!,
  ].filter(Boolean);
}
