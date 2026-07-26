/**
 * Apply verified billing webhook commands idempotently (Prompt 157).
 */

import {
  comparePlans,
  computeGraceEndsAt,
} from "@/domain/billing/billing-2";
import {
  parseStripeBillingEvent,
  type BillingWebhookCommand,
} from "@/domain/billing/webhook-parse";
import { normalizePlanId, type PlanId } from "@/domain/billing/catalog";
import { prisma } from "@/lib/db";
import { grantCreditPack } from "@/services/billing/credit-service";
import { emitSubscriptionActivatedEvent } from "@/services/billing/billing-service";

export type ApplyWebhookResult =
  | {
      ok: true;
      providerEventId: string;
      eventType: string;
      duplicate: boolean;
      handled: boolean;
      actions: string[];
    }
  | { ok: false; error: string; status: number };

async function applyCommand(
  command: BillingWebhookCommand,
  actions: string[],
): Promise<void> {
  switch (command.kind) {
    case "ignore":
      actions.push(`ignore:${command.reason}`);
      return;

    case "upsert_subscription": {
      const existing = await prisma.subscription.findUnique({
        where: { userId: command.userId },
      });
      const previousPlan = existing
        ? normalizePlanId(existing.plan)
        : ("free" as PlanId);

      let nextPlan = command.plan;
      if (
        nextPlan === "free" &&
        command.status !== "canceled" &&
        previousPlan !== "free"
      ) {
        nextPlan = previousPlan;
      }

      let graceEndsAt =
        command.graceEndsAt === undefined
          ? (existing?.graceEndsAt ?? null)
          : command.graceEndsAt;
      if (command.status === "past_due" && command.graceEndsAt === undefined) {
        graceEndsAt = computeGraceEndsAt();
      }
      if (
        (command.status === "active" || command.status === "trialing") &&
        command.graceEndsAt === null
      ) {
        graceEndsAt = null;
      }
      if (command.status === "active" || command.status === "trialing") {
        if (command.graceEndsAt === undefined && existing?.graceEndsAt) {
          graceEndsAt = null;
        }
      }

      let pendingPlan =
        command.pendingPlan === undefined
          ? (existing?.pendingPlan ?? null)
          : command.pendingPlan;

      const transition = comparePlans(previousPlan, nextPlan);
      if (transition === "downgrade" && command.cancelAtPeriodEnd) {
        pendingPlan = nextPlan;
        nextPlan = previousPlan;
      }
      if (transition === "upgrade") {
        pendingPlan = null;
      }

      await prisma.subscription.upsert({
        where: { userId: command.userId },
        create: {
          userId: command.userId,
          plan: nextPlan,
          status: command.status,
          billingInterval: command.billingInterval ?? null,
          provider: "stripe",
          providerCustomerId: command.providerCustomerId ?? null,
          providerSubscriptionId: command.providerSubscriptionId ?? null,
          providerPriceId: command.providerPriceId ?? null,
          currentPeriodStart: command.currentPeriodStart ?? null,
          currentPeriodEnd: command.currentPeriodEnd ?? null,
          trialEndsAt: command.trialEndsAt ?? null,
          graceEndsAt,
          pendingPlan,
          couponCode: command.couponCode ?? null,
          cancelAtPeriodEnd: command.cancelAtPeriodEnd ?? false,
        },
        update: {
          plan: nextPlan,
          status: command.status,
          ...(command.billingInterval !== undefined
            ? { billingInterval: command.billingInterval }
            : {}),
          provider: "stripe",
          ...(command.providerCustomerId !== undefined
            ? { providerCustomerId: command.providerCustomerId }
            : {}),
          ...(command.providerSubscriptionId !== undefined
            ? { providerSubscriptionId: command.providerSubscriptionId }
            : {}),
          ...(command.providerPriceId !== undefined
            ? { providerPriceId: command.providerPriceId }
            : {}),
          ...(command.currentPeriodStart !== undefined
            ? { currentPeriodStart: command.currentPeriodStart }
            : {}),
          ...(command.currentPeriodEnd !== undefined
            ? { currentPeriodEnd: command.currentPeriodEnd }
            : {}),
          ...(command.trialEndsAt !== undefined
            ? { trialEndsAt: command.trialEndsAt }
            : {}),
          graceEndsAt,
          pendingPlan,
          ...(command.couponCode !== undefined
            ? { couponCode: command.couponCode }
            : {}),
          ...(command.cancelAtPeriodEnd !== undefined
            ? { cancelAtPeriodEnd: command.cancelAtPeriodEnd }
            : {}),
        },
      });

      actions.push(
        `upsert_subscription:${command.userId}:${nextPlan}:${command.status}:${transition}`,
      );

      if (
        (command.status === "active" || command.status === "trialing") &&
        nextPlan !== "free" &&
        nextPlan !== previousPlan
      ) {
        emitSubscriptionActivatedEvent({
          userId: command.userId,
          planId: nextPlan,
          fromPlanId: previousPlan,
        });
      }
      return;
    }

    case "record_invoice": {
      await prisma.billingInvoice.upsert({
        where: { providerInvoiceId: command.providerInvoiceId },
        create: {
          userId: command.userId,
          providerInvoiceId: command.providerInvoiceId,
          status: command.status,
          amountDueCents: command.amountDueCents,
          amountPaidCents: command.amountPaidCents,
          currency: command.currency,
          billingInterval: command.billingInterval ?? null,
          periodStart: command.periodStart ?? null,
          periodEnd: command.periodEnd ?? null,
          hostedInvoiceUrl: command.hostedInvoiceUrl ?? null,
          invoicePdfUrl: command.invoicePdfUrl ?? null,
        },
        update: {
          status: command.status,
          amountDueCents: command.amountDueCents,
          amountPaidCents: command.amountPaidCents,
          currency: command.currency,
          billingInterval: command.billingInterval ?? null,
          periodStart: command.periodStart ?? null,
          periodEnd: command.periodEnd ?? null,
          hostedInvoiceUrl: command.hostedInvoiceUrl ?? null,
          invoicePdfUrl: command.invoicePdfUrl ?? null,
        },
      });
      actions.push(`record_invoice:${command.providerInvoiceId}`);
      return;
    }

    case "grant_credit_pack": {
      const result = await grantCreditPack({
        userId: command.userId,
        packId: command.packId,
        externalRef: command.externalRef,
      });
      actions.push(
        result.ok
          ? `grant_credit_pack:${command.packId}:${result.credits}`
          : `grant_credit_pack_failed:${command.packId}`,
      );
      return;
    }

    case "redeem_coupon": {
      try {
        await prisma.couponRedemption.create({
          data: {
            userId: command.userId,
            couponCode: command.couponCode,
            providerPromotionCodeId: command.providerPromotionCodeId ?? null,
            providerCouponId: command.providerCouponId ?? null,
            discountLabel: command.discountLabel ?? null,
          },
        });
        actions.push(`redeem_coupon:${command.couponCode}`);
      } catch {
        actions.push(`redeem_coupon_duplicate:${command.couponCode}`);
      }
      return;
    }
  }
}

/**
 * Process a verified raw webhook body. Idempotent on provider event id.
 */
export async function applyVerifiedBillingWebhookPayload(
  payloadText: string,
): Promise<ApplyWebhookResult> {
  let payload: unknown;
  try {
    payload = JSON.parse(payloadText);
  } catch {
    return { ok: false, error: "Invalid JSON payload.", status: 400 };
  }

  const parsed = parseStripeBillingEvent(payload);
  if ("ok" in parsed && parsed.ok === false) {
    return { ok: false, error: parsed.error, status: 400 };
  }

  const { providerEventId, eventType, commands } = parsed as Exclude<
    ReturnType<typeof parseStripeBillingEvent>,
    { ok: false }
  >;

  try {
    await prisma.billingWebhookEvent.create({
      data: {
        providerEventId,
        eventType,
        status: "received",
      },
    });
  } catch {
    const existing = await prisma.billingWebhookEvent.findUnique({
      where: { providerEventId },
    });
    return {
      ok: true,
      providerEventId,
      eventType,
      duplicate: true,
      handled:
        existing?.status === "processed" || existing?.status === "ignored",
      actions: ["duplicate"],
    };
  }

  const actions: string[] = [];
  let userId: string | null = null;
  try {
    for (const command of commands) {
      if ("userId" in command && typeof command.userId === "string") {
        userId = command.userId;
      }
      await applyCommand(command, actions);
    }

    const onlyIgnored =
      commands.length > 0 && commands.every((c) => c.kind === "ignore");

    await prisma.billingWebhookEvent.update({
      where: { providerEventId },
      data: {
        status: onlyIgnored ? "ignored" : "processed",
        userId,
        resultJson: JSON.stringify({ actions }),
        processedAt: new Date(),
        errorMessage: null,
      },
    });

    return {
      ok: true,
      providerEventId,
      eventType,
      duplicate: false,
      handled: !onlyIgnored,
      actions,
    };
  } catch (error) {
    await prisma.billingWebhookEvent.update({
      where: { providerEventId },
      data: {
        status: "failed",
        errorMessage: error instanceof Error ? error.name : "apply_failed",
        processedAt: new Date(),
      },
    });
    return {
      ok: false,
      error: "Failed to apply billing event.",
      status: 500,
    };
  }
}

/** Test helper — apply a single command without webhook ledger. */
export async function applyBillingCommandForTests(
  command: BillingWebhookCommand,
): Promise<string[]> {
  const actions: string[] = [];
  await applyCommand(command, actions);
  return actions;
}
