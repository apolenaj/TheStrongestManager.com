/**
 * Billing 2.0 — lifecycle, grace, coupons, invoices (Prompt 157).
 * Entitlements never come from frontend checkout success alone.
 */

import {
  BILLING_INTERVALS,
  normalizePlanId,
  type BillingInterval,
  type PlanId,
} from "@/domain/billing/catalog";

export const BILLING_2_ENGINE_VERSION = "billing.v2" as const;

export const BILLING_2_HONESTY = [
  "Subscription and credit grants apply only from verified provider webhooks (or trusted admin with audit) — never from frontend state alone.",
  "Monthly and annual intervals, trials, coupons, upgrades/downgrades, grace, and invoices are first-class; checkout still requires a ready Stripe adapter.",
  "Webhook retries are idempotent via BillingWebhookEvent.providerEventId.",
] as const;

/** Default past-due grace before paid entitlements fall back to free. */
export const BILLING_GRACE_PERIOD_MS = 3 * 24 * 60 * 60 * 1000;

export const SUBSCRIPTION_STATUSES = [
  "trialing",
  "active",
  "past_due",
  "canceled",
  "incomplete",
] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export const PLAN_RANK: Record<PlanId, number> = {
  free: 0,
  pro: 1,
  performance: 2,
  elite_coaching: 3,
};

export function isBillingInterval(
  value: string | null | undefined,
): value is BillingInterval {
  return (
    !!value &&
    (BILLING_INTERVALS as readonly string[]).includes(value)
  );
}

export function comparePlans(
  from: PlanId,
  to: PlanId,
): "upgrade" | "downgrade" | "same" {
  const a = PLAN_RANK[from];
  const b = PLAN_RANK[to];
  if (b > a) return "upgrade";
  if (b < a) return "downgrade";
  return "same";
}

/**
 * Effective access during past_due while graceEndsAt is in the future.
 */
export function isWithinGracePeriod(input: {
  status: string | null | undefined;
  graceEndsAt: Date | string | null | undefined;
  now?: Date;
}): boolean {
  if (input.status !== "past_due") return false;
  if (!input.graceEndsAt) return false;
  const end =
    typeof input.graceEndsAt === "string"
      ? new Date(input.graceEndsAt)
      : input.graceEndsAt;
  if (Number.isNaN(end.getTime())) return false;
  const now = input.now ?? new Date();
  return end.getTime() > now.getTime();
}

export function computeGraceEndsAt(
  from: Date = new Date(),
  graceMs: number = BILLING_GRACE_PERIOD_MS,
): Date {
  return new Date(from.getTime() + graceMs);
}

/** Capability checklist for admin / docs. */
export const BILLING_2_CAPABILITIES = [
  {
    id: "monthly",
    title: "Monthly billing",
    detail: "Catalog interval monthly + Subscription.billingInterval.",
    status: "shipped" as const,
  },
  {
    id: "annual",
    title: "Annual billing",
    detail: "Catalog interval annual + Subscription.billingInterval.",
    status: "shipped" as const,
  },
  {
    id: "trials",
    title: "Trials",
    detail:
      "status=trialing + trialEndsAt from provider webhook — not frontend.",
    status: "shipped" as const,
  },
  {
    id: "coupons",
    title: "Coupons",
    detail: "CouponRedemption audit + Subscription.couponCode from webhook.",
    status: "shipped" as const,
  },
  {
    id: "credits",
    title: "Credits",
    detail:
      "Technique credit ledger; pack grants require externalRef from webhook.",
    status: "shipped" as const,
  },
  {
    id: "upgrades",
    title: "Upgrades",
    detail: "comparePlans + upsert from subscription.updated (immediate).",
    status: "shipped" as const,
  },
  {
    id: "downgrades",
    title: "Downgrades",
    detail:
      "pendingPlan for period-end downgrades; apply when period rolls or webhook confirms.",
    status: "shipped" as const,
  },
  {
    id: "grace",
    title: "Grace periods",
    detail:
      "past_due + graceEndsAt keeps paid entitlements until grace expires.",
    status: "shipped" as const,
  },
  {
    id: "invoices",
    title: "Invoices",
    detail: "BillingInvoice mirror from invoice.* webhook events.",
    status: "shipped" as const,
  },
  {
    id: "webhook_idempotency",
    title: "Webhook idempotency",
    detail: "BillingWebhookEvent.providerEventId unique — safe retries.",
    status: "shipped" as const,
  },
  {
    id: "no_frontend_grant",
    title: "No frontend entitlement grant",
    detail:
      "Checkout success URLs must not write Subscription; only verified webhooks.",
    status: "shipped" as const,
  },
] as const;

export type Billing2Capability = (typeof BILLING_2_CAPABILITIES)[number];

/**
 * Normalize opaque plan string from provider metadata.
 */
export function planIdFromProviderMetadata(
  raw: string | null | undefined,
): PlanId {
  return normalizePlanId(raw);
}
