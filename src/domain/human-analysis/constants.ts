/**
 * Premium Expert Technique Review products (Prompt 96).
 * Paid human analysis — separate from free optional review (Prompt 95).
 */

export const HUMAN_ANALYSIS_ENGINE_VERSION = "human_analysis.v1" as const;

export const HUMAN_ANALYSIS_PRODUCT_SKUS = [
  "single_lift_review",
  "full_training_review",
  "competition_prep_review",
] as const;
export type HumanAnalysisProductSku =
  (typeof HUMAN_ANALYSIS_PRODUCT_SKUS)[number];

/**
 * Purchase → Upload → Queue → Expert review → Report
 * Never invent intermediate states.
 */
export const HUMAN_ANALYSIS_ORDER_STATUSES = [
  "awaiting_purchase",
  "purchased",
  "awaiting_upload",
  "queued",
  "in_review",
  "report_ready",
  "canceled",
  "refunded",
] as const;
export type HumanAnalysisOrderStatus =
  (typeof HUMAN_ANALYSIS_ORDER_STATUSES)[number];

export const HUMAN_ANALYSIS_PAYMENT_STATUSES = [
  "unpaid",
  "paid",
  "refunded",
  "waived_dev",
] as const;
export type HumanAnalysisPaymentStatus =
  (typeof HUMAN_ANALYSIS_PAYMENT_STATUSES)[number];

export const HUMAN_ANALYSIS_ORDER_STATUS_LABELS: Record<
  HumanAnalysisOrderStatus,
  string
> = {
  awaiting_purchase: "Awaiting purchase",
  purchased: "Purchased",
  awaiting_upload: "Awaiting upload",
  queued: "In queue",
  in_review: "Expert reviewing",
  report_ready: "Report ready",
  canceled: "Canceled",
  refunded: "Refunded",
};

export const HUMAN_ANALYSIS_HONESTY = [
  "Expert Technique Review is a paid human product — separate from free optional AI review.",
  "Prices appear only when published via environment catalog — never invented in the UI.",
  "Status tracking is honest. Turnaround time is never promised unless operational capacity is published.",
  "Checkout requires billing readiness (Stripe + flag). Until then, orders stay awaiting purchase.",
  "Reports are expert-authored. AI analysis may be attached as input — never labeled as the expert report.",
] as const;

export function isHumanAnalysisProductSku(
  value: string,
): value is HumanAnalysisProductSku {
  return (HUMAN_ANALYSIS_PRODUCT_SKUS as readonly string[]).includes(value);
}

export function isHumanAnalysisOrderStatus(
  value: string,
): value is HumanAnalysisOrderStatus {
  return (HUMAN_ANALYSIS_ORDER_STATUSES as readonly string[]).includes(value);
}
