import { Prisma } from "@prisma/client";
import { PROGRAM_COMMERCE_KIND } from "@/domain/program-commerce/constants";
import { prisma } from "@/lib/db";

export type FulfillProgramPurchaseInput = {
  userId: string;
  productId: string;
  orderId: string;
  stripeCheckoutSessionId: string;
  stripePaymentIntentId?: string | null;
  amountTotalCents?: number | null;
  currency?: string | null;
};

/**
 * Idempotent fulfillment for one-time program checkout.
 * Does not touch Subscription rows.
 */
export async function fulfillProgramPurchase(
  input: FulfillProgramPurchaseInput,
): Promise<{ ok: true; entitlementId: string; created: boolean } | { ok: false; error: string }> {
  const order = await prisma.programOrder.findFirst({
    where: { id: input.orderId },
    select: {
      id: true,
      userId: true,
      productId: true,
      status: true,
      amountCents: true,
      currency: true,
      stripeCheckoutSessionId: true,
    },
  });

  if (!order) return { ok: false, error: "order_not_found" };
  if (order.userId !== input.userId) {
    return { ok: false, error: "order_user_mismatch" };
  }
  if (order.productId !== input.productId) {
    return { ok: false, error: "order_product_mismatch" };
  }

  // Already fulfilled
  if (order.status === "paid") {
    const existing = await prisma.programEntitlement.findFirst({
      where: { orderId: order.id, userId: input.userId },
      select: { id: true },
    });
    if (existing) {
      return { ok: true, entitlementId: existing.id, created: false };
    }
  }

  if (
    input.amountTotalCents != null &&
    input.amountTotalCents !== order.amountCents
  ) {
    return { ok: false, error: "amount_mismatch" };
  }

  const product = await prisma.programProduct.findFirst({
    where: { id: input.productId, status: "published" },
    select: { id: true, bundleIds: true, isFree: true },
  });
  if (!product || product.isFree) {
    return { ok: false, error: "product_not_purchasable" };
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.programOrder.update({
      where: { id: order.id },
      data: {
        status: "paid",
        paidAt: new Date(),
        stripeCheckoutSessionId: input.stripeCheckoutSessionId,
        stripePaymentIntentId: input.stripePaymentIntentId ?? undefined,
        providerMetaJson: {
          commerceKind: PROGRAM_COMMERCE_KIND,
          commerceChannel: "program_one_time",
          fulfilledAt: new Date().toISOString(),
        } as Prisma.InputJsonValue,
        ...(input.currency
          ? { currency: input.currency.toLowerCase() }
          : {}),
      },
    });

    let entitlement = await tx.programEntitlement.findFirst({
      where: {
        userId: input.userId,
        productId: input.productId,
        orderId: order.id,
      },
      select: { id: true },
    });

    let created = false;
    if (!entitlement) {
      entitlement = await tx.programEntitlement.create({
        data: {
          userId: input.userId,
          productId: input.productId,
          source: "purchase",
          orderId: order.id,
          grantedAt: new Date(),
        },
        select: { id: true },
      });
      created = true;
    }

    // Bundle: grant included paid product ids as bundle-source entitlements.
    for (const bundledProductId of product.bundleIds) {
      const already = await tx.programEntitlement.findFirst({
        where: {
          userId: input.userId,
          productId: bundledProductId,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        select: { id: true },
      });
      if (already) continue;
      await tx.programEntitlement.create({
        data: {
          userId: input.userId,
          productId: bundledProductId,
          source: "bundle",
          orderId: order.id,
          grantedAt: new Date(),
        },
      });
    }

    return { entitlementId: entitlement.id, created };
  });

  if (result.created) {
    const { trackProductEventSafe } = await import(
      "@/services/analytics/track"
    );
    trackProductEventSafe({
      name: "paid_program_purchased",
      props: {
        productId: input.productId,
        orderId: order.id,
        priceCents: order.amountCents,
      },
      userId: input.userId,
    });
  }

  return { ok: true, ...result };
}
