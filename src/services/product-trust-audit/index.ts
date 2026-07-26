/**
 * Product Trust Audit — admin snapshot.
 */

import {
  buildProductTrustAuditSnapshot,
  type ProductTrustAuditSnapshot,
} from "@/domain/product-trust-audit";

export function getProductTrustAuditSnapshot(): ProductTrustAuditSnapshot {
  return buildProductTrustAuditSnapshot();
}
