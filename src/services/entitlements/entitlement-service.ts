/**
 * EntitlementService (Prompt 158).
 * Central gate for technique, AI Coach, analytics, coach tools, programs.
 * Components and feature services must call this — not raw plan checks.
 */

import {
  hasEntitlement,
  type EntitlementKey,
  type PlanLimitValue,
  type ResolvedEntitlements,
} from "@/domain/billing";
import {
  isLimitDenied,
  isLimitUnlimited,
  isWithinNumericLimit,
  limitKeyForFeature,
  type FeatureEntitlementId,
} from "@/domain/entitlements";
import { getSubscriptionForUser } from "@/services/billing/billing-service";

export type EntitlementDenied = {
  ok: false;
  reason: "not_entitled";
  entitlements: ResolvedEntitlements;
  feature: FeatureEntitlementId;
  limitKey: EntitlementKey;
};

export type EntitlementAllowed = {
  ok: true;
  entitlements: ResolvedEntitlements;
  feature: FeatureEntitlementId;
  limitKey: EntitlementKey;
};

export type EntitlementCheckResult = EntitlementAllowed | EntitlementDenied;

/**
 * Load resolved entitlements for a user (referral + grace via billing).
 */
export async function getEntitlementsForUser(
  userId: string,
): Promise<ResolvedEntitlements> {
  const sub = await getSubscriptionForUser(userId);
  return sub.entitlements;
}

/**
 * Check a catalog PlanLimits key directly.
 */
export async function userHasLimitKey(
  userId: string,
  key: EntitlementKey,
): Promise<boolean> {
  const entitlements = await getEntitlementsForUser(userId);
  return hasEntitlement(entitlements, key);
}

/**
 * Check a product feature alias (Prompt 158 surface).
 */
export async function userHasFeature(
  userId: string,
  feature: FeatureEntitlementId,
): Promise<boolean> {
  const key = limitKeyForFeature(feature);
  return userHasLimitKey(userId, key);
}

/**
 * Require a feature — use in services/actions before paid work.
 */
export async function requireFeature(
  userId: string,
  feature: FeatureEntitlementId,
): Promise<EntitlementCheckResult> {
  const entitlements = await getEntitlementsForUser(userId);
  const limitKey = limitKeyForFeature(feature);
  if (!hasEntitlement(entitlements, limitKey)) {
    return {
      ok: false,
      reason: "not_entitled",
      entitlements,
      feature,
      limitKey,
    };
  }
  return { ok: true, entitlements, feature, limitKey };
}

/**
 * Read a numeric/unlimited limit (technique analyses, active programs).
 */
export async function getFeatureLimit(
  userId: string,
  feature: Extract<
    FeatureEntitlementId,
    "technique_analyses" | "programs"
  >,
): Promise<{
  limit: PlanLimitValue;
  entitlements: ResolvedEntitlements;
}> {
  const entitlements = await getEntitlementsForUser(userId);
  const limitKey = limitKeyForFeature(feature);
  return {
    limit: entitlements.limits[limitKey] as PlanLimitValue,
    entitlements,
  };
}

/**
 * Whether the user can consume one more unit of a capped feature.
 */
export async function canConsumeFeatureSlot(
  userId: string,
  feature: Extract<
    FeatureEntitlementId,
    "technique_analyses" | "programs"
  >,
  currentlyUsed: number,
): Promise<EntitlementCheckResult & { limit?: PlanLimitValue }> {
  const { limit, entitlements } = await getFeatureLimit(userId, feature);
  const limitKey = limitKeyForFeature(feature);
  if (isLimitDenied(limit) || !isWithinNumericLimit(currentlyUsed, limit)) {
    return {
      ok: false,
      reason: "not_entitled",
      entitlements,
      feature,
      limitKey,
      limit,
    };
  }
  return {
    ok: true,
    entitlements,
    feature,
    limitKey,
    limit,
  };
}

export function formatEntitlementDenial(
  result: EntitlementDenied,
): string {
  return `Your ${result.entitlements.planName} plan does not include ${result.feature.replaceAll("_", " ")}.`;
}

/** Convenience: technique monthly allocation amount from entitlements. */
export async function getTechniqueAnalysisMonthlyLimit(userId: string): Promise<{
  amount: number | "unlimited";
  planId: string;
  entitlements: ResolvedEntitlements;
}> {
  const { limit, entitlements } = await getFeatureLimit(
    userId,
    "technique_analyses",
  );
  if (isLimitUnlimited(limit)) {
    return { amount: "unlimited", planId: entitlements.planId, entitlements };
  }
  if (isLimitDenied(limit) || typeof limit !== "number") {
    return { amount: 0, planId: entitlements.planId, entitlements };
  }
  return { amount: limit, planId: entitlements.planId, entitlements };
}

export const EntitlementService = {
  getEntitlementsForUser,
  userHasLimitKey,
  userHasFeature,
  requireFeature,
  getFeatureLimit,
  canConsumeFeatureSlot,
  getTechniqueAnalysisMonthlyLimit,
  formatEntitlementDenial,
} as const;
