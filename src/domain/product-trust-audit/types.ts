import type {
  ProductTrustCriterionId,
  ProductTrustStatus,
} from "@/domain/product-trust-audit/constants";

export type ProductTrustCriterionScore = {
  status: ProductTrustStatus;
  /** Short audit note — what the UI does (or lacked before fix). */
  note: string;
};

export type ProductTrustFeatureEntry = {
  id: string;
  title: string;
  /** Primary athlete/coach route when applicable. */
  surface: string;
  flag: string | null;
  criteria: Record<ProductTrustCriterionId, ProductTrustCriterionScore>;
  overall: ProductTrustStatus;
  /** Gaps found in Prompt 182 review (may be fixed). */
  documentedGaps: readonly string[];
  /** Fixes applied in this prompt (empty if already compliant). */
  fixesApplied: readonly string[];
};

export type ProductTrustAuditSnapshot = {
  engineVersion: string;
  honesty: readonly string[];
  certaintyDisclaimer: string;
  criterionQuestions: Record<ProductTrustCriterionId, string>;
  features: readonly ProductTrustFeatureEntry[];
  counts: {
    total: number;
    pass: number;
    partial: number;
    fail: number;
  };
  openFailures: ProductTrustFeatureEntry[];
  docPath: "docs/PRODUCT_TRUST_AUDIT.md";
  generatedAt: string;
};
