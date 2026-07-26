export {
  BILLING_INTERVALS,
  PLAN_IDS,
  PRICING_CANCELLATION_COPY,
  PRICING_HONESTY,
  annualSavingsCents,
  formatLimit,
  formatMoneyCents,
  getPlanById,
  getPlanCatalog,
  normalizePlanId,
  priceForInterval,
} from "@/domain/billing/catalog";
export type {
  BillingInterval,
  PlanDefinition,
  PlanFeature,
  PlanId,
  PlanLimitValue,
  PlanLimits,
  PlanPrice,
} from "@/domain/billing/catalog";
export {
  hasEntitlement,
  listPublicPlans,
  resolveEntitlements,
} from "@/domain/billing/entitlements";
export type {
  EntitlementKey,
  ResolvedEntitlements,
} from "@/domain/billing/entitlements";
export {
  getActiveBillingProvider,
  listBillingProviders,
  readStripeEnvConfig,
  registerBillingProvider,
  resetBillingProvidersForTests,
  unavailableStripeAdapter,
} from "@/domain/billing/provider";
export type {
  BillingProviderAdapter,
  BillingProviderStatus,
  CheckoutSessionRequest,
  CheckoutSessionResult,
  CustomerPortalRequest,
  CustomerPortalResult,
} from "@/domain/billing/provider";
export {
  CREDIT_HONESTY,
  CREDIT_PACKS,
  CREDIT_RELATED_TECHNIQUE,
  CREDIT_TRANSACTION_KINDS,
  TECHNIQUE_ANALYSIS_CREDIT_COST,
  creditPeriodKey,
  endOfUtcMonth,
  getCreditPackById,
} from "@/domain/billing/credits";
export type {
  CreditPackDefinition,
  CreditTransactionKind,
} from "@/domain/billing/credits";
export {
  isStripeWebhookConfigured,
  verifyStripeWebhookSignature,
} from "@/domain/billing/webhook";
export type { StripeWebhookVerifyResult } from "@/domain/billing/webhook";

export {
  BILLING_2_ENGINE_VERSION,
  BILLING_2_HONESTY,
  BILLING_2_CAPABILITIES,
  BILLING_GRACE_PERIOD_MS,
  PLAN_RANK,
  SUBSCRIPTION_STATUSES,
  comparePlans,
  computeGraceEndsAt,
  isBillingInterval,
  isWithinGracePeriod,
  planIdFromProviderMetadata,
} from "@/domain/billing/billing-2";
export type {
  Billing2Capability,
  SubscriptionStatus,
} from "@/domain/billing/billing-2";

export {
  buildBilling2Snapshot,
  type Billing2Snapshot,
} from "@/domain/billing/billing-2-snapshot";

export {
  parseStripeBillingEvent,
} from "@/domain/billing/webhook-parse";
export type {
  BillingWebhookCommand,
  ParsedBillingWebhook,
} from "@/domain/billing/webhook-parse";
