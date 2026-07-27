import { absoluteUrl } from "@/config/site";
import { featureFlags } from "@/config/feature-flags";
import {
  envStripePriceIdForProgramSlug,
  isProgramCommerceConfigured,
  PROGRAM_COMMERCE_HONESTY,
  PROGRAM_COMMERCE_KIND,
} from "@/domain/program-commerce/constants";
import {
  assertStripePriceMatchesProduct,
  programCheckoutMetadata,
  validateProgramProductForCheckout,
} from "@/domain/program-commerce/price-validation";
import { prisma } from "@/lib/db";

export type StartProgramCheckoutResult =
  | { ok: true; checkoutUrl: string; orderId: string }
  | { ok: false; error: string };

function formEncode(data: Record<string, string>): string {
  return Object.entries(data)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
}

/**
 * Create a pending ProgramOrder and a Stripe Checkout Session (mode=payment).
 * Separated from subscription checkout — never uses subscription mode.
 */
export async function startProgramCheckout(input: {
  userId: string;
  productId: string;
  customerEmail?: string | null;
}): Promise<StartProgramCheckoutResult> {
  if (!featureFlags.billingCheckout) {
    return {
      ok: false,
      error: "Checkout is not enabled yet (billingCheckout feature flag).",
    };
  }
  if (!isProgramCommerceConfigured()) {
    return {
      ok: false,
      error: "Stripe is not configured (STRIPE_SECRET_KEY).",
    };
  }

  const validated = await validateProgramProductForCheckout(input.productId);
  if (!validated.ok) return validated;

  const secretKey = process.env.STRIPE_SECRET_KEY!.trim();
  const priceCheck = await assertStripePriceMatchesProduct({
    stripePriceId: validated.product.stripePriceId,
    displayPrice: validated.product.displayPrice,
    currency: validated.product.defaultCurrency,
    secretKey,
  });
  if (!priceCheck.ok) return priceCheck;

  const existingEntitlement = await prisma.programEntitlement.findFirst({
    where: {
      userId: input.userId,
      productId: validated.product.productId,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    select: { id: true },
  });
  if (existingEntitlement) {
    return { ok: false, error: "You already own this program." };
  }

  const order = await prisma.programOrder.create({
    data: {
      userId: input.userId,
      productId: validated.product.productId,
      status: "pending",
      currency: validated.product.defaultCurrency,
      amountCents: validated.product.displayPrice,
      providerMetaJson: {
        commerceKind: PROGRAM_COMMERCE_KIND,
        commerceChannel: "program_one_time",
        productSlug: validated.product.slug,
      },
    },
    select: { id: true },
  });

  const meta = programCheckoutMetadata({
    userId: input.userId,
    productId: validated.product.productId,
    orderId: order.id,
  });

  const body: Record<string, string> = {
    mode: "payment",
    success_url: absoluteUrl(
      `/checkout/success?orderId=${encodeURIComponent(order.id)}&session_id={CHECKOUT_SESSION_ID}`,
    ),
    cancel_url: absoluteUrl(
      `/checkout/cancel?orderId=${encodeURIComponent(order.id)}`,
    ),
    client_reference_id: input.userId,
    "line_items[0][price]": validated.product.stripePriceId,
    "line_items[0][quantity]": "1",
    "payment_intent_data[metadata][commerceKind]": PROGRAM_COMMERCE_KIND,
    "payment_intent_data[metadata][orderId]": order.id,
    "payment_intent_data[metadata][productId]": validated.product.productId,
  };

  for (const [key, value] of Object.entries(meta)) {
    body[`metadata[${key}]`] = value;
  }
  if (input.customerEmail?.trim()) {
    body.customer_email = input.customerEmail.trim();
  }

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formEncode(body),
    cache: "no-store",
  });

  const json = (await res.json()) as {
    id?: string;
    url?: string;
    error?: { message?: string };
  };

  if (!res.ok || !json.id || !json.url) {
    await prisma.programOrder.update({
      where: { id: order.id },
      data: {
        status: "failed",
        providerMetaJson: {
          commerceKind: PROGRAM_COMMERCE_KIND,
          error: json.error?.message ?? "checkout_session_create_failed",
        },
      },
    });
    return {
      ok: false,
      error:
        json.error?.message ??
        "Unable to start Stripe Checkout for this program.",
    };
  }

  await prisma.programOrder.update({
    where: { id: order.id },
    data: {
      stripeCheckoutSessionId: json.id,
      providerMetaJson: {
        commerceKind: PROGRAM_COMMERCE_KIND,
        commerceChannel: "program_one_time",
        productSlug: validated.product.slug,
        checkoutSessionId: json.id,
      },
    },
  });

  return { ok: true, checkoutUrl: json.url, orderId: order.id };
}

export type ProgramPricingCard = {
  id: string;
  slug: string;
  name: string;
  description: string;
  displayPrice: number;
  defaultCurrency: string;
  durationWeeks: number;
  checkoutReady: boolean;
  isBundle: boolean;
};

export async function listPaidProgramsForPricing(): Promise<{
  programs: ProgramPricingCard[];
  honesty: readonly string[];
  checkoutEnabled: boolean;
}> {
  const rows = await prisma.programProduct.findMany({
    where: { status: "published", isFree: false },
    orderBy: [{ displayPrice: "asc" }, { name: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      displayPrice: true,
      defaultCurrency: true,
      durationWeeks: true,
      stripePriceId: true,
      bundleIds: true,
    },
  });

  const checkoutEnabled =
    featureFlags.billingCheckout && isProgramCommerceConfigured();

  return {
    honesty: PROGRAM_COMMERCE_HONESTY,
    checkoutEnabled,
    programs: rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      displayPrice: row.displayPrice,
      defaultCurrency: row.defaultCurrency,
      durationWeeks: row.durationWeeks,
      checkoutReady:
        checkoutEnabled &&
        Boolean(row.stripePriceId?.trim() || envStripePriceIdForProgramSlug(row.slug)),
      isBundle: row.bundleIds.length > 0,
    })),
  };
}
