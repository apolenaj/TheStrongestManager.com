import {
  PRODUCT_TRUST_AUDIT_ENGINE_VERSION,
  PRODUCT_TRUST_AUDIT_HONESTY,
  PRODUCT_TRUST_CERTAINTY_DISCLAIMER,
  PRODUCT_TRUST_CRITERION_QUESTIONS,
} from "@/domain/product-trust-audit/constants";
import {
  PRODUCT_TRUST_AI_FEATURES,
  listProductTrustOpenFailures,
  summarizeProductTrustCounts,
} from "@/domain/product-trust-audit/registry";
import type { ProductTrustAuditSnapshot } from "@/domain/product-trust-audit/types";

export function buildProductTrustAuditSnapshot(
  generatedAt: string = new Date().toISOString(),
): ProductTrustAuditSnapshot {
  return {
    engineVersion: PRODUCT_TRUST_AUDIT_ENGINE_VERSION,
    honesty: PRODUCT_TRUST_AUDIT_HONESTY,
    certaintyDisclaimer: PRODUCT_TRUST_CERTAINTY_DISCLAIMER,
    criterionQuestions: PRODUCT_TRUST_CRITERION_QUESTIONS,
    features: PRODUCT_TRUST_AI_FEATURES,
    counts: summarizeProductTrustCounts(),
    openFailures: listProductTrustOpenFailures(),
    docPath: "docs/PRODUCT_TRUST_AUDIT.md",
    generatedAt,
  };
}
