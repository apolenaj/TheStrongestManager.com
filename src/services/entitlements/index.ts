/**
 * Entitlement system service — admin snapshot + EntitlementService re-exports.
 */

import {
  buildEntitlementSystemSnapshot,
  type EntitlementSystemSnapshot,
} from "@/domain/entitlements";

export {
  EntitlementService,
  getEntitlementsForUser,
  userHasLimitKey,
  userHasFeature,
  requireFeature,
  getFeatureLimit,
  canConsumeFeatureSlot,
  getTechniqueAnalysisMonthlyLimit,
  formatEntitlementDenial,
} from "@/services/entitlements/entitlement-service";

export function getEntitlementSystemSnapshot(): EntitlementSystemSnapshot {
  return buildEntitlementSystemSnapshot();
}
