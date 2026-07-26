export {
  ENTITLEMENT_ENGINE_VERSION,
  ENTITLEMENT_HONESTY,
  FEATURE_ENTITLEMENTS,
  featureEntitlementById,
  limitKeyForFeature,
  isLimitUnlimited,
  isLimitDenied,
  isWithinNumericLimit,
  buildEntitlementSystemSnapshot,
} from "@/domain/entitlements/constants";
export type {
  FeatureEntitlementId,
  EntitlementSystemSnapshot,
} from "@/domain/entitlements/constants";
