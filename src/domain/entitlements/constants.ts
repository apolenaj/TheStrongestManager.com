/**
 * Central product entitlements (Prompt 158).
 * Maps product features → PlanLimits keys. Do not scatter plan checks in UI.
 */

import type { EntitlementKey, PlanLimitValue } from "@/domain/billing";
import { hasEntitlement, listPublicPlans, resolveEntitlements } from "@/domain/billing";

export const ENTITLEMENT_ENGINE_VERSION = "entitlements.v1" as const;

export const ENTITLEMENT_HONESTY = [
  "Plan limits live in the billing catalog — EntitlementService is the only app entry for feature gates.",
  "Do not check Subscription.plan or PlanLimits directly in components; call EntitlementService.",
  "Entitlements follow Billing 2.0 (webhook + grace). Frontend checkout success never grants access.",
] as const;

/**
 * Product-facing feature ids → catalog PlanLimits keys.
 * Add aliases here instead of inventing a second catalog.
 */
export const FEATURE_ENTITLEMENTS = [
  {
    id: "technique_analyses",
    label: "Technique analyses per month",
    limitKey: "techniqueAnalysesPerMonth" as const,
    kind: "limit" as const,
  },
  {
    id: "ai_coach",
    label: "AI Coach access",
    limitKey: "adaptiveCoaching" as const,
    kind: "boolean" as const,
    note: "Maps to adaptiveCoaching until a dedicated AI Coach plan flag exists.",
  },
  {
    id: "adaptive_coaching",
    label: "Adaptive coaching suggestions",
    limitKey: "adaptiveCoaching" as const,
    kind: "boolean" as const,
  },
  {
    id: "progress_analytics",
    label: "Progress analytics",
    limitKey: "progressAnalytics" as const,
    kind: "boolean" as const,
  },
  {
    id: "advanced_analytics",
    label: "Advanced analytics / insights",
    limitKey: "advancedInsights" as const,
    kind: "boolean" as const,
  },
  {
    id: "coach_tools",
    label: "Coach tools / workspace",
    limitKey: "coachWorkspace" as const,
    kind: "boolean" as const,
    note: "Plan entitlement; Coach Mode role (isCoach) is still required.",
  },
  {
    id: "programs",
    label: "Active programs",
    limitKey: "activePrograms" as const,
    kind: "limit" as const,
  },
  {
    id: "training_tools",
    label: "Training tools",
    limitKey: "trainingTools" as const,
    kind: "boolean" as const,
  },
  {
    id: "mealnexio",
    label: "Mealnexio integration entitlement",
    limitKey: "mealnexioIntegration" as const,
    kind: "boolean" as const,
  },
] as const;

export type FeatureEntitlementId = (typeof FEATURE_ENTITLEMENTS)[number]["id"];

export function featureEntitlementById(
  id: FeatureEntitlementId,
): (typeof FEATURE_ENTITLEMENTS)[number] {
  return FEATURE_ENTITLEMENTS.find((f) => f.id === id)!;
}

export function limitKeyForFeature(
  id: FeatureEntitlementId,
): EntitlementKey {
  return featureEntitlementById(id).limitKey;
}

export function isLimitUnlimited(value: PlanLimitValue): boolean {
  return value === "unlimited";
}

export function isLimitDenied(value: PlanLimitValue): boolean {
  return value === "none" || (typeof value === "number" && value <= 0);
}

/**
 * Whether a numeric usage count is within the plan limit.
 */
export function isWithinNumericLimit(
  used: number,
  limit: PlanLimitValue,
): boolean {
  if (limit === "unlimited") return true;
  if (limit === "none") return false;
  return used < limit;
}

export type EntitlementSystemSnapshot = {
  engineVersion: typeof ENTITLEMENT_ENGINE_VERSION;
  features: typeof FEATURE_ENTITLEMENTS;
  honesty: typeof ENTITLEMENT_HONESTY;
  /** Plan × feature matrix for admin (from catalog, free fallback when inactive). */
  matrix: Array<{
    planId: string;
    planName: string;
    features: Record<string, string | boolean | number>;
  }>;
  generatedAt: string;
};

export function buildEntitlementSystemSnapshot(
  generatedAt: string = new Date().toISOString(),
): EntitlementSystemSnapshot {
  const plans = listPublicPlans();
  const matrix = plans.map((plan) => {
    const resolved = resolveEntitlements({
      plan: plan.id,
      status: "active",
    });
    const features: Record<string, string | boolean | number> = {};
    for (const f of FEATURE_ENTITLEMENTS) {
      const raw = resolved.limits[f.limitKey];
      if (f.kind === "boolean") {
        features[f.id] = hasEntitlement(resolved, f.limitKey);
      } else {
        features[f.id] = raw as string | number;
      }
    }
    return {
      planId: plan.id,
      planName: plan.name,
      features,
    };
  });

  return {
    engineVersion: ENTITLEMENT_ENGINE_VERSION,
    features: FEATURE_ENTITLEMENTS,
    honesty: ENTITLEMENT_HONESTY,
    matrix,
    generatedAt,
  };
}
