/**
 * Normalize verified Stripe-compatible webhook JSON into billing commands.
 * Never trusts client payloads — only call after signature verification.
 */

import {
  isBillingInterval,
  planIdFromProviderMetadata,
  SUBSCRIPTION_STATUSES,
  type SubscriptionStatus,
} from "@/domain/billing/billing-2";
import type { BillingInterval, PlanId } from "@/domain/billing/catalog";

export type BillingWebhookCommand =
  | {
      kind: "upsert_subscription";
      userId: string;
      plan: PlanId;
      status: SubscriptionStatus;
      billingInterval?: BillingInterval | null;
      providerCustomerId?: string | null;
      providerSubscriptionId?: string | null;
      providerPriceId?: string | null;
      currentPeriodStart?: Date | null;
      currentPeriodEnd?: Date | null;
      trialEndsAt?: Date | null;
      graceEndsAt?: Date | null;
      pendingPlan?: PlanId | null;
      couponCode?: string | null;
      cancelAtPeriodEnd?: boolean;
    }
  | {
      kind: "record_invoice";
      userId: string;
      providerInvoiceId: string;
      status: string;
      amountDueCents: number;
      amountPaidCents: number;
      currency: string;
      billingInterval?: BillingInterval | null;
      periodStart?: Date | null;
      periodEnd?: Date | null;
      hostedInvoiceUrl?: string | null;
      invoicePdfUrl?: string | null;
    }
  | {
      kind: "grant_credit_pack";
      userId: string;
      packId: string;
      externalRef: string;
    }
  | {
      /** One-time program purchase — never grants Subscription. */
      kind: "grant_program_entitlement";
      userId: string;
      productId: string;
      orderId: string;
      stripeCheckoutSessionId: string;
      stripePaymentIntentId?: string | null;
      amountTotalCents?: number | null;
      currency?: string | null;
    }
  | {
      kind: "redeem_coupon";
      userId: string;
      couponCode: string;
      providerPromotionCodeId?: string | null;
      providerCouponId?: string | null;
      discountLabel?: string | null;
    }
  | { kind: "ignore"; reason: string };

export type ParsedBillingWebhook = {
  providerEventId: string;
  eventType: string;
  commands: BillingWebhookCommand[];
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function num(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function unixToDate(value: unknown): Date | null {
  const n = num(value);
  if (n == null || n <= 0) return null;
  return new Date(n * 1000);
}

function parseStatus(raw: string | null): SubscriptionStatus | null {
  if (!raw) return null;
  if ((SUBSCRIPTION_STATUSES as readonly string[]).includes(raw)) {
    return raw as SubscriptionStatus;
  }
  // Stripe maps
  if (raw === "unpaid") return "past_due";
  return null;
}

/**
 * Parse a verified Stripe event body into idempotent apply commands.
 * Requires metadata.userId (or client_reference_id) — never invents users.
 */
export function parseStripeBillingEvent(
  payload: unknown,
): ParsedBillingWebhook | { ok: false; error: string } {
  const root = asRecord(payload);
  if (!root) return { ok: false, error: "Event must be an object." };

  const providerEventId = str(root.id);
  const eventType = str(root.type);
  if (!providerEventId || !eventType) {
    return { ok: false, error: "Event id and type are required." };
  }

  const data = asRecord(root.data);
  const object = data ? asRecord(data.object) : null;
  const commands: BillingWebhookCommand[] = [];

  if (!object) {
    return {
      providerEventId,
      eventType,
      commands: [{ kind: "ignore", reason: "missing_data_object" }],
    };
  }

  if (
    eventType === "customer.subscription.created" ||
    eventType === "customer.subscription.updated" ||
    eventType === "customer.subscription.deleted"
  ) {
    const meta = asRecord(object.metadata);
    const userId = str(meta?.userId) ?? str(meta?.user_id);
    if (!userId) {
      commands.push({
        kind: "ignore",
        reason: "subscription_missing_userId_metadata",
      });
    } else {
      const status =
        eventType === "customer.subscription.deleted"
          ? ("canceled" as const)
          : parseStatus(str(object.status)) ?? "incomplete";
      const plan = planIdFromProviderMetadata(
        str(meta?.planId) ?? str(meta?.plan_id) ?? str(meta?.plan),
      );
      const intervalRaw =
        str(meta?.billingInterval) ??
        str(meta?.billing_interval) ??
        str(asRecord(object.items)?.data ? null : null);
      // Prefer items.data[0].price.recurring.interval
      let billingInterval: BillingInterval | null = null;
      const items = asRecord(object.items);
      const itemList = items?.data;
      if (Array.isArray(itemList) && itemList[0]) {
        const price = asRecord(asRecord(itemList[0])?.price);
        const recurring = asRecord(price?.recurring);
        const iv = str(recurring?.interval);
        if (iv === "month") billingInterval = "monthly";
        if (iv === "year") billingInterval = "annual";
      }
      if (!billingInterval && isBillingInterval(intervalRaw)) {
        billingInterval = intervalRaw;
      }

      const pendingRaw =
        str(meta?.pendingPlan) ?? str(meta?.pending_plan) ?? null;
      const pendingPlan = pendingRaw
        ? planIdFromProviderMetadata(pendingRaw)
        : null;

      commands.push({
        kind: "upsert_subscription",
        userId,
        plan: status === "canceled" ? "free" : plan,
        status: status === "canceled" ? "canceled" : status,
        billingInterval,
        providerCustomerId: str(object.customer),
        providerSubscriptionId: str(object.id),
        providerPriceId: (() => {
          if (Array.isArray(itemList) && itemList[0]) {
            const price = asRecord(asRecord(itemList[0])?.price);
            return str(price?.id);
          }
          return null;
        })(),
        currentPeriodStart: unixToDate(object.current_period_start),
        currentPeriodEnd: unixToDate(object.current_period_end),
        trialEndsAt: unixToDate(object.trial_end),
        pendingPlan:
          pendingPlan && pendingPlan !== "free" ? pendingPlan : null,
        couponCode: str(meta?.couponCode) ?? str(meta?.coupon_code),
        cancelAtPeriodEnd: Boolean(object.cancel_at_period_end),
        graceEndsAt: status === "past_due" ? undefined : null,
      });

      const couponCode = str(meta?.couponCode) ?? str(meta?.coupon_code);
      if (couponCode && status !== "canceled") {
        commands.push({
          kind: "redeem_coupon",
          userId,
          couponCode,
          providerPromotionCodeId: str(meta?.promotionCodeId),
          providerCouponId: str(meta?.couponId),
          discountLabel: str(meta?.discountLabel),
        });
      }
    }
  } else if (
    eventType === "invoice.paid" ||
    eventType === "invoice.payment_failed" ||
    eventType === "invoice.finalized"
  ) {
    const meta = asRecord(object.metadata);
    const userId =
      str(meta?.userId) ??
      str(meta?.user_id) ??
      str(asRecord(object.subscription_details)?.metadata ? null : null);
    // Stripe often puts user on customer metadata — require explicit userId in metadata for honesty.
    const resolvedUser =
      userId ??
      str(asRecord(asRecord(object.parent)?.subscription_details)?.metadata ? null : null);

    // Fall back: lines metadata
    let finalUserId = resolvedUser;
    if (!finalUserId) {
      const lines = asRecord(object.lines);
      const line0 = Array.isArray(lines?.data)
        ? asRecord(lines.data[0])
        : null;
      const lineMeta = asRecord(line0?.metadata);
      finalUserId = str(lineMeta?.userId) ?? str(lineMeta?.user_id);
    }

    if (!finalUserId) {
      commands.push({ kind: "ignore", reason: "invoice_missing_userId" });
    } else {
      const invStatus =
        eventType === "invoice.paid"
          ? "paid"
          : eventType === "invoice.payment_failed"
            ? "open"
            : str(object.status) ?? "open";
      commands.push({
        kind: "record_invoice",
        userId: finalUserId,
        providerInvoiceId: str(object.id) ?? providerEventId,
        status: invStatus,
        amountDueCents: num(object.amount_due) ?? 0,
        amountPaidCents: num(object.amount_paid) ?? 0,
        currency: str(object.currency) ?? "usd",
        periodStart: unixToDate(object.period_start),
        periodEnd: unixToDate(object.period_end),
        hostedInvoiceUrl: str(object.hosted_invoice_url),
        invoicePdfUrl: str(object.invoice_pdf),
      });

      if (eventType === "invoice.payment_failed") {
        commands.push({
          kind: "upsert_subscription",
          userId: finalUserId,
          plan: planIdFromProviderMetadata(
            str(meta?.planId) ?? str(meta?.plan),
          ),
          status: "past_due",
          providerSubscriptionId: str(object.subscription),
        });
      }
      if (eventType === "invoice.paid") {
        const subId = str(object.subscription);
        if (subId) {
          commands.push({
            kind: "upsert_subscription",
            userId: finalUserId,
            plan: planIdFromProviderMetadata(
              str(meta?.planId) ?? str(meta?.plan),
            ),
            status: "active",
            providerSubscriptionId: subId,
            graceEndsAt: null,
          });
        }
      }
    }
  } else if (eventType === "checkout.session.completed") {
    const meta = asRecord(object.metadata);
    const userId =
      str(meta?.userId) ??
      str(meta?.user_id) ??
      str(object.client_reference_id);
    const mode = str(object.mode);
    if (!userId) {
      commands.push({ kind: "ignore", reason: "checkout_missing_userId" });
    } else if (mode === "payment") {
      const commerceKind = str(meta?.commerceKind) ?? str(meta?.commerce_kind);
      const productId = str(meta?.productId) ?? str(meta?.product_id);
      const orderId = str(meta?.orderId) ?? str(meta?.order_id);
      const sessionId = str(object.id);
      const paymentStatus = str(object.payment_status);

      if (
        commerceKind === "program_product" &&
        productId &&
        orderId &&
        sessionId
      ) {
        if (paymentStatus && paymentStatus !== "paid" && paymentStatus !== "no_payment_required") {
          commands.push({
            kind: "ignore",
            reason: `program_checkout_unpaid_${paymentStatus}`,
          });
        } else {
          commands.push({
            kind: "grant_program_entitlement",
            userId,
            productId,
            orderId,
            stripeCheckoutSessionId: sessionId,
            stripePaymentIntentId: str(object.payment_intent),
            amountTotalCents: num(object.amount_total),
            currency: str(object.currency),
          });
        }
      } else {
        const packId = str(meta?.packId) ?? str(meta?.pack_id);
        if (packId && sessionId) {
          commands.push({
            kind: "grant_credit_pack",
            userId,
            packId,
            externalRef: sessionId,
          });
        } else {
          commands.push({
            kind: "ignore",
            reason: "checkout_payment_missing_packId_or_program",
          });
        }
      }
    } else if (mode === "subscription") {
      const plan = planIdFromProviderMetadata(
        str(meta?.planId) ?? str(meta?.plan),
      );
      const intervalRaw =
        str(meta?.billingInterval) ?? str(meta?.billing_interval);
      commands.push({
        kind: "upsert_subscription",
        userId,
        plan,
        status: "active",
        billingInterval: isBillingInterval(intervalRaw) ? intervalRaw : null,
        providerCustomerId: str(object.customer),
        providerSubscriptionId: str(object.subscription),
        couponCode: str(meta?.couponCode),
      });
    } else {
      commands.push({ kind: "ignore", reason: `checkout_mode_${mode ?? "unknown"}` });
    }
  } else {
    commands.push({ kind: "ignore", reason: `unhandled_type_${eventType}` });
  }

  return { providerEventId, eventType, commands };
}
